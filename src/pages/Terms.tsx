import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import iaaboLogo from "@/assets/iaabo-logo.png";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={iaaboLogo} alt="IAABO Logo" className="h-16" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Last Updated: February 25, 2026
            </p>
          </CardHeader>

          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the IAABO Referee Hub ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Membership Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                To become a member of IAABO, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Comply with all applicable local, state, and federal laws</li>
                <li>Adhere to the IAABO Code of Ethics and officiating standards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Account Registration and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the security of your account and password. IAABO cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You agree to immediately notify IAABO of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Code of Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                As a member, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Conduct yourself professionally at all times</li>
                <li>Respect fellow members, officials, players, and coaches</li>
                <li>Maintain the integrity of the game</li>
                <li>Continue professional development through training and education</li>
                <li>Not engage in any conduct that brings discredit to IAABO or the officiating profession</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Membership Dues and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Membership dues are set annually by the IAABO Board. Payment of dues is required to maintain active membership status. Failure to pay dues may result in suspension or termination of membership. All payments are non-refundable unless otherwise stated in writing by IAABO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Training and Certification</h2>
              <p className="text-muted-foreground leading-relaxed">
                Members must complete required training programs and maintain current certifications as mandated by IAABO and applicable governing bodies. Failure to maintain certifications may result in suspension of officiating privileges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on the Platform, including but not limited to text, graphics, logos, images, and software, is the property of IAABO or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                IAABO shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform. This includes, but is not limited to, damages for loss of profits, data, or other intangibles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                IAABO reserves the right to suspend or terminate your membership and access to the Platform at any time, with or without notice, for conduct that violates these Terms and Conditions or is otherwise harmful to other members or IAABO's interests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms and Conditions or your use of the Platform shall be resolved through binding arbitration in accordance with IAABO's dispute resolution procedures. You agree to waive any right to a jury trial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                IAABO reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform following any changes indicates your acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p className="font-medium">IAABO Headquarters</p>
                <p className="text-muted-foreground">Email: info@iaabo.org</p>
                <p className="text-muted-foreground">Phone: (555) 123-4567</p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground italic">
                By registering for membership with IAABO, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <div className="flex justify-center pt-6">
              <Button onClick={() => navigate(-1)} size="lg">
                I Understand
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
