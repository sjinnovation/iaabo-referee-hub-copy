import DashboardLayout from "@/components/DashboardLayout";
import { MemberSidebar } from "@/components/MemberSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Award, ExternalLink, Shield, Percent, Users, BookOpen } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Liability Insurance",
    description: "Comprehensive coverage for all officiating activities",
    link: "https://example.com/insurance"
  },
  {
    icon: Award,
    title: "Certification Programs",
    description: "Access to advanced certification and training programs",
    link: "https://example.com/certification"
  },
  {
    icon: Percent,
    title: "Member Discounts",
    description: "Exclusive discounts on equipment, apparel, and services",
    link: "https://example.com/discounts"
  },
  {
    icon: Users,
    title: "Networking Events",
    description: "Connect with fellow officials at regional and national events",
    link: "https://example.com/events"
  },
  {
    icon: BookOpen,
    title: "Educational Resources",
    description: "Access to rulebooks, sportorials, and training materials",
    link: "https://example.com/resources"
  }
];

const MemberBenefits = () => {
  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Member Benefits" subtitle="Exclusive benefits for IAABO members" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{benefit.description}</CardDescription>
                <Button variant="outline" className="w-full" asChild>
                  <a href={benefit.link} target="_blank" rel="noopener noreferrer">
                    Learn More
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Premium Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upgrade to Premium Membership for additional benefits including priority event registration, 
              enhanced insurance coverage, and exclusive merchandise discounts.
            </p>
            <Button>Upgrade to Premium</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberBenefits;
