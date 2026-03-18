import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { Book, Webhook, CheckCircle, AlertCircle, Code } from "lucide-react";

const AdminIntegrationDocs = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Integration Documentation" subtitle="Complete setup guide for LearnDash LMS integration" />

        <Tabs defaultValue="learndash" className="space-y-4">
          <TabsList>
            <TabsTrigger value="learndash">
              <Webhook className="h-4 w-4 mr-2" />
              LearnDash Setup
            </TabsTrigger>
            <TabsTrigger value="testing">
              <CheckCircle className="h-4 w-4 mr-2" />
              Testing Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learndash" className="space-y-4">
            <Alert>
              <Book className="h-4 w-4" />
              <AlertTitle>Overview</AlertTitle>
              <AlertDescription>
                LearnDash LMS (IAABO University) integration enables automatic course completion tracking and member progression through webhooks.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Configure Webhook Endpoint</CardTitle>
                <CardDescription>Set up webhook receiver for course completion events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Badge>POST</Badge>
                    Course Completion Webhook
                  </h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    https://your-domain.com/api/webhooks/learndash/course-completion
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Triggered when a member completes the Rules Test, Mechanics Course, or any training module
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Expected Payload Format</CardTitle>
                <CardDescription>JSON structure sent by LearnDash webhooks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Course Completion Payload</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`{
  "event": "learndash_course_completed",
  "timestamp": "2024-10-09T16:45:00Z",
  "user": {
    "id": 12345,
    "email": "john.smith@email.com",
    "first_name": "John",
    "last_name": "Smith"
  },
  "course": {
    "id": 789,
    "title": "IAABO Rules Test 2024-25",
    "type": "rules_test",
    "completed_at": "2024-10-09T16:45:00Z"
  },
  "progress": {
    "score": 92,
    "percentage": 92,
    "certificate_url": "https://iaabou.org/certificates/cert-12345.pdf"
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Authentication & Security</CardTitle>
                <CardDescription>Secure your webhook endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Always validate webhook signatures to ensure requests are from IAABOU.org
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-semibold">Header Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    IAABOU.org includes these headers with each webhook request:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li><code className="bg-muted px-2 py-1 rounded">X-IAABOU-Signature</code> - HMAC signature for verification</li>
                    <li><code className="bg-muted px-2 py-1 rounded">X-IAABOU-Event</code> - Event type identifier</li>
                    <li><code className="bg-muted px-2 py-1 rounded">X-IAABOU-Timestamp</code> - Request timestamp</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Example Signature Verification</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return signature === expectedSignature;
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Configure in LearnDash</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Log into your IAABO University (LearnDash) administrator account</li>
                  <li>Navigate to <strong>LearnDash LMS → Settings → Webhooks</strong></li>
                  <li>Click <strong>Add New Webhook</strong></li>
                  <li>Enter your webhook URL from Step 1</li>
                  <li>Select event: <code className="bg-muted px-2 py-1 rounded">Course Completed</code></li>
                  <li>Copy the provided webhook secret for signature verification</li>
                  <li>Save and test the connection with a test course completion</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Alert>
              <Book className="h-4 w-4" />
              <AlertTitle>Testing Overview</AlertTitle>
              <AlertDescription>
                Use these test scenarios to verify your integration is working correctly before going live.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Test Scenario 1: Course Completion</CardTitle>
                <CardDescription>Test automatic member progression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create test member in Holding Board 900 with "Rules Test" pending</li>
                  <li>Trigger course completion webhook for Rules Test from LearnDash</li>
                  <li>Verify member progression stage updates to "mechanics-course"</li>
                  <li>Check completion email was sent to member</li>
                  <li>Trigger Mechanics Course completion webhook</li>
                  <li>Verify member status updates and ready for board assignment</li>
                  <li>Confirm admin receives notification for board assignment</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Scenario 2: Member Registration Flow</CardTitle>
                <CardDescription>Verify the complete new member workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create new registration in Admin → Registrations</li>
                  <li>Click "Check for Duplicates" - should return "No Duplicates Found"</li>
                  <li>Click "Create Member Profile" - creates profile in database</li>
                  <li>Assign to "Holding Board 900"</li>
                  <li>Click "Activate Member" - sends welcome email</li>
                  <li>Verify member can log in and see their dashboard</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Code className="h-4 w-4 inline mr-2" />
                  Test Webhook Payload
                </CardTitle>
                <CardDescription>Use this test payload with your webhook endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Course Completion Payload</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
{`curl -X POST https://your-domain.com/api/webhooks/learndash/course-completion \\
  -H "Content-Type: application/json" \\
  -H "X-LearnDash-Event: course_completed" \\
  -H "X-LearnDash-Signature: test_signature" \\
  -d '{
    "event": "learndash_course_completed",
    "timestamp": "2024-10-09T14:30:00Z",
    "user": {
      "id": 12345,
      "email": "test.user@example.com",
      "first_name": "Test",
      "last_name": "User"
    },
    "course": {
      "id": 789,
      "title": "IAABO Rules Test 2024-25",
      "type": "rules_test",
      "completed_at": "2024-10-09T14:30:00Z"
    },
    "progress": {
      "score": 92,
      "percentage": 92,
      "certificate_url": "https://iaabou.org/certificates/cert-12345.pdf"
    }
  }'`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Webhook not receiving data</h4>
                    <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                      <li>• Verify webhook URL is publicly accessible</li>
                      <li>• Check SSL certificate is valid</li>
                      <li>• Review webhook logs in LearnDash admin</li>
                      <li>• Ensure webhook secret is correctly configured</li>
                    </ul>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Course completion not updating member status</h4>
                    <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                      <li>• Verify LearnDash user ID is linked to member profile</li>
                      <li>• Check webhook payload contains correct user email</li>
                      <li>• Review database for member matching issues</li>
                    </ul>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Members not progressing through stages</h4>
                    <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                      <li>• Verify both course completions are recorded</li>
                      <li>• Check auto-progression workflow is enabled</li>
                      <li>• Review workflow logs for errors</li>
                      <li>• Ensure member is in correct initial stage</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminIntegrationDocs;