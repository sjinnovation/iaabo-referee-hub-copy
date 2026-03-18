import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import iaaboLogo from "@/assets/iaabo-logo.png";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  DC:"District of Columbia",
};

const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  streetAddress: z.string().trim().min(1, "Street address is required").max(255),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().trim().min(5, "Valid ZIP code required").max(10),
  phone: z.string().trim().min(10, "Valid phone number required").max(20),
  email: z.string().trim().email("Invalid email address").max(255),
  confirmEmail: z.string().trim().email("Invalid email address"),
  isOver18: z.literal("yes", { errorMap: () => ({ message: "You must be over 18 to register" }) }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms and conditions" }) }),
}).refine(data => data.email === data.confirmEmail, {
  message: "Email addresses do not match",
  path: ["confirmEmail"],
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  confirmEmail: string;
  isOver18: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  email: "",
  confirmEmail: "",
  isOver18: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function PublicRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (errors.captcha) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.captcha;
        return next;
      });
    }
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      registrationSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      }
      return;
    }

    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      setErrors(prev => ({ ...prev, captcha: "Please complete the CAPTCHA verification" }));
      toast({
        title: "Verification Required",
        description: "Please complete the CAPTCHA to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Pass ALL profile fields as metadata — the handle_new_user trigger
      // extracts them from raw_user_meta_data (no session needed)
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
          street_address: formData.streetAddress.trim(),
          city: formData.city.trim(),
          state: formData.state,
          zip_code: formData.zipCode.trim(),
          date_of_birth: formData.dateOfBirth,
          is_over_18: formData.isOver18 === 'yes' ? 'true' : 'false',
        }
      );

      if (signUpError) {
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
        toast({
          title: "Registration failed",
          description: signUpError,
          variant: "destructive",
        });
        return;
      }

      // Sign out immediately — user must wait for admin approval
      await supabase.auth.signOut();
      setIsSubmitted(true);

      toast({
        title: "Registration Submitted!",
        description: "Your registration is pending admin approval.",
      });
    } catch (_err) {
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Registration Received!</CardTitle>
            <CardDescription>
              Thank you for registering with IAABO. Your application has been submitted for review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">What happens next:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>An administrator will review your registration</li>
                <li>Once approved, you'll be able to sign in</li>
                <li>You'll have access to the member portal</li>
              </ol>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Go to Sign In
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={iaaboLogo} alt="IAABO Logo" className="h-16" />
          </div>
          <CardTitle>IAABO Member Registration</CardTitle>
          <CardDescription>
            Create your account to begin your officiating journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Name <span className="text-destructive">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                </div>
              </div>
            </fieldset>

            {/* Address */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Address <span className="text-destructive">*</span></legend>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => updateField('streetAddress', e.target.value)}
                  className={errors.streetAddress ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className={errors.city ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateField('state', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {STATE_NAMES[st]} ({st})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    className={errors.zipCode ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
                </div>
              </div>
            </fieldset>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            {/* Email */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Email <span className="text-destructive">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Enter Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmEmail">Confirm Email</Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.confirmEmail}
                    onChange={(e) => updateField('confirmEmail', e.target.value)}
                    className={errors.confirmEmail ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.confirmEmail && <p className="text-sm text-destructive">{errors.confirmEmail}</p>}
                </div>
              </div>
            </fieldset>

            {/* Over 18 */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">I am over the age of 18 <span className="text-destructive">*</span></legend>
              <RadioGroup
                value={formData.isOver18}
                onValueChange={(value) => updateField('isOver18', value)}
                className="flex gap-6"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="over18-yes" />
                  <Label htmlFor="over18-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="over18-no" />
                  <Label htmlFor="over18-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
              {errors.isOver18 && <p className="text-sm text-destructive">{errors.isOver18}</p>}
            </fieldset>

            {/* Date of Birth */}
            <div className="space-y-1">
              <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className={errors.dateOfBirth ? "border-destructive" : ""}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Format: MM/DD/YYYY</p>
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
            </div>

            {/* Password */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Password <span className="text-destructive">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      disabled={isLoading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            </fieldset>

            {/* Terms & Conditions */}
            <fieldset className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, acceptedTerms: checked === true }));
                    if (errors.acceptedTerms) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.acceptedTerms;
                        return next;
                      });
                    }
                  }}
                  disabled={isLoading}
                  className={errors.acceptedTerms ? "border-destructive" : ""}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="acceptedTerms"
                    className="text-sm font-medium leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>
                    <span className="text-destructive"> *</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By registering, you agree to abide by IAABO rules and regulations.
                  </p>
                </div>
              </div>
              {errors.acceptedTerms && (
                <p className="text-sm text-destructive">{errors.acceptedTerms}</p>
              )}
            </fieldset>

            {/* CAPTCHA */}
            {RECAPTCHA_SITE_KEY && (
              <div className="space-y-1">
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    onExpired={handleCaptchaExpired}
                    theme="light"
                  />
                </div>
                {errors.captcha && (
                  <p className="text-sm text-destructive text-center">{errors.captcha}</p>
                )}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Submit Registration
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate('/auth')}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
