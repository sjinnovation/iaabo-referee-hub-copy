import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, DollarSign, Megaphone, FileText, Award, Shield } from "lucide-react";
import iaaboLogo from "@/assets/iaabo-logo.png";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Comprehensive system for managing member profiles, applications, and board assignments."
    },
    {
      icon: GraduationCap,
      title: "IAABO University",
      description: "Complete training platform with courses, certifications, and progress tracking."
    },
    {
      icon: DollarSign,
      title: "Finance & Dues",
      description: "Automated dues invoicing, payment tracking, and financial reporting."
    },
    {
      icon: Megaphone,
      title: "Communications",
      description: "Announcements, newsletters, and targeted messaging system."
    },
    {
      icon: FileText,
      title: "Resources Library",
      description: "Centralized hub for publications, videos, handbooks, and training materials."
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Track service awards, committee memberships, and member achievements."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-8">
          <img src={iaaboLogo} alt="IAABO Logo" className="h-32 w-32" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          IAABO Management Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Comprehensive management system for the International Association of Approved Basketball Officials
        </p>

        {/* Direct Dashboard Access */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
            <Users className="h-5 w-5" />
            Register Now
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="gap-2">
            <Shield className="h-5 w-5" />
            Sign In
          </Button>
        </div>

        {/* <div className="border-t pt-8 mt-8 hidden">
          <p className="text-sm text-muted-foreground mb-4">Development/Admin Access:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin')} className="gap-2">
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/secretary')} className="gap-2">
              <UserCog className="h-4 w-4" />
              Secretary Dashboard
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/member')} className="gap-2">
              <Users className="h-4 w-4" />
              Member Dashboard
            </Button>
          </div>
        </div> */}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <img src={iaaboLogo} alt="IAABO Logo" className="h-12 w-12" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            © 2024 International Association of Approved Basketball Officials
          </p>
          <p className="text-sm text-muted-foreground">UX Prototype - Sample Data Only</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
