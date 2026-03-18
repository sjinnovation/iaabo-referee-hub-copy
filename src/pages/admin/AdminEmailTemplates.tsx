import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Save, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  trigger: string;
  enabled: boolean;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "New Registration Confirmation",
    category: "registration",
    subject: "Welcome to IAABO - Registration Confirmed",
    body: `Dear {{member_name}},

Thank you for registering with IAABO! We're excited to have you join our community of basketball officials.

Your registration has been received and is currently being processed. Here's what happens next:

1. Your information will be verified in our RefSec system
2. You'll be assigned to Board 900 (Holding Board) to begin your training
3. Complete the Rules Test and Mechanics Course
4. Upon completion, you'll be assigned to your permanent board

Member Number: {{member_number}}
Registration Date: {{registration_date}}

If you have any questions, please don't hesitate to reach out.

Best regards,
IAABO Administration`,
    trigger: "On new registration submission",
    enabled: true,
  },
  {
    id: "2",
    name: "Rules Test Completion",
    category: "progression",
    subject: "Congratulations - Rules Test Completed",
    body: `Dear {{member_name}},

Congratulations on completing the NFHS Rules Test!

Completion Date: {{completion_date}}
Score: {{test_score}}%

Next Step: Please proceed with the Three-Person Mechanics Course.

Your progress:
✓ Registration Complete
✓ Rules Test Complete
→ Mechanics Course (Next)
○ Board Assignment
○ Active Status

Keep up the great work!

Best regards,
IAABO Training Department`,
    trigger: "On rules test completion",
    enabled: true,
  },
  {
    id: "3",
    name: "Mechanics Course Completion",
    category: "progression",
    subject: "Mechanics Course Completed - Board Assignment Pending",
    body: `Dear {{member_name}},

Excellent work completing the Three-Person Mechanics Course!

Completion Date: {{completion_date}}
Final Grade: {{course_grade}}

You're now ready for board assignment. Our administration team will review your profile and assign you to a board based on:
- Geographic location
- Board capacity
- Experience level

You'll receive your board assignment notification within 5-7 business days.

Your progress:
✓ Registration Complete
✓ Rules Test Complete
✓ Mechanics Course Complete
→ Board Assignment (Pending)
○ Active Status

Best regards,
IAABO Training Department`,
    trigger: "On mechanics course completion",
    enabled: true,
  },
  {
    id: "4",
    name: "Board Assignment - Member Notification",
    category: "assignment",
    subject: "Board Assignment Complete - Welcome to {{board_name}}",
    body: `Dear {{member_name}},

We're pleased to inform you that you've been assigned to {{board_name}}!

Assignment Date: {{assignment_date}}
Board Secretary: {{secretary_name}}
Secretary Email: {{secretary_email}}

Your board secretary will be in touch shortly to welcome you and provide information about:
- Meeting schedules
- Game assignments
- Board-specific procedures
- Mentorship opportunities

You're now an active member of IAABO. Welcome to the team!

Your complete journey:
✓ Registration Complete
✓ Rules Test Complete
✓ Mechanics Course Complete
✓ Board Assigned
✓ Active Status

Best regards,
IAABO Administration`,
    trigger: "On board assignment",
    enabled: true,
  },
  {
    id: "5",
    name: "Board Assignment - Secretary Notification",
    category: "assignment",
    subject: "New Member Assigned to {{board_name}}",
    body: `Dear {{secretary_name}},

A new member has been assigned to {{board_name}}.

Member Details:
Name: {{member_name}}
Email: {{member_email}}
Phone: {{member_phone}}
Member Number: {{member_number}}

Training Completed:
✓ Rules Test - {{rules_test_date}}
✓ Mechanics Course - {{mechanics_date}}

Assignment Date: {{assignment_date}}

Please reach out to welcome them to the board and provide orientation information.

Member Profile: [View in Dashboard]

Best regards,
IAABO Administration System`,
    trigger: "On board assignment",
    enabled: true,
  },
];

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0]);
  const [_showPreview, _setShowPreview] = useState(false);

  const handleSaveTemplate = () => {
    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id ? selectedTemplate : t
    ));
    toast({
      title: "Template Saved",
      description: "Email template has been updated successfully",
    });
  };

  const handleToggleTemplate = (templateId: string, enabled: boolean) => {
    setTemplates(templates.map(t => 
      t.id === templateId ? { ...t, enabled } : t
    ));
  };

  const previewTemplate = () => {
    // Mock data for preview
    const previewData = {
      member_name: "John Smith",
      member_number: "M00123",
      member_email: "john.smith@email.com",
      member_phone: "(555) 123-4567",
      registration_date: "October 15, 2024",
      completion_date: "October 22, 2024",
      test_score: "92",
      course_grade: "A",
      board_name: "Brooklyn Basketball Officials",
      secretary_name: "Sarah Johnson",
      secretary_email: "secretary@bbo.org",
      assignment_date: "November 1, 2024",
      rules_test_date: "October 22, 2024",
      mechanics_date: "October 29, 2024",
    };

    let preview = selectedTemplate.body;
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return preview;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Email Templates"
          subtitle="Manage automated email notifications"
          actions={
            <Button onClick={() => toast({ title: "Test Email", description: "Test email sent to your address" })}>
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Templates" value={templates.length} />
          <StatCard title="Active Templates" value={templates.filter(t => t.enabled).length} />
          <StatCard title="Emails Sent (30 days)" value="1,247" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Select a template to edit</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                      selectedTemplate.id === template.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{template.trigger}</p>
                      </div>
                      <Badge variant={template.enabled ? "default" : "secondary"} className="text-xs">
                        {template.enabled ? "On" : "Off"}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>Edit template content and configuration</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedTemplate.enabled}
                    onCheckedChange={(enabled) => handleToggleTemplate(selectedTemplate.id, enabled)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedTemplate.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Subject</Label>
                    <Input
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={selectedTemplate.body}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Trigger Event</Label>
                    <Input
                      value={selectedTemplate.trigger}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, trigger: e.target.value })}
                    />
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Available Variables:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>{"{{member_name}}"}</div>
                      <div>{"{{member_email}}"}</div>
                      <div>{"{{member_number}}"}</div>
                      <div>{"{{board_name}}"}</div>
                      <div>{"{{completion_date}}"}</div>
                      <div>{"{{secretary_name}}"}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveTemplate}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Template
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg p-6 bg-card">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Subject:</p>
                        <p className="font-semibold">{selectedTemplate.subject}</p>
                      </div>
                      <div className="border-t pt-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {previewTemplate()}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmailTemplates;
