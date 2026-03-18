import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { Settings, GitBranch, Mail, Database } from "lucide-react";

const AdminWorkflows = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Workflow Management" subtitle="Visualize and configure automated member workflows" />

        <Tabs defaultValue="registration" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registration">
              <GitBranch className="h-4 w-4 mr-2" />
              Registration Flow
            </TabsTrigger>
            <TabsTrigger value="completion">
              <Mail className="h-4 w-4 mr-2" />
              Course Completion
            </TabsTrigger>
            <TabsTrigger value="sync">
              <Database className="h-4 w-4 mr-2" />
              Data Sync
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Rules & Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registration to Board Assignment Workflow</CardTitle>
                <CardDescription>
                  Complete flow from new registration through RefSec validation to board assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg overflow-auto">
                  <pre className="text-sm">
{`graph TD
    A[New Registration from IAABOU.org] --> B{Check in RefSec}
    B -->|Found| C[Link Existing Member]
    B -->|Not Found| D[Create New Member in RefSec]
    C --> E{Training Complete?}
    D --> E
    E -->|Rules Test Missing| F[Send Rules Test Reminder]
    E -->|Mechanics Missing| G[Send Mechanics Reminder]
    E -->|Both Complete| H[Assign to Holding Board 900]
    F --> I[Monitor Training Progress]
    G --> I
    H --> J[Notify Board Secretary]
    I --> E
    J --> K[Secretary Reviews Member]
    K --> L{Approve?}
    L -->|Yes| M[Assign to Active Board]
    L -->|No| N[Request More Info]
    M --> O[Send Welcome Email]
    N --> K
    O --> P[Active Member]`}
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    Workflow visualization showing the complete registration to board assignment process
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-check RefSec on registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically search RefSec when new registration received
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-assign to Holding Board 900</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically assign members with complete training
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send automatic notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Email secretaries when new members are assigned
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion to Email Workflow</CardTitle>
                <CardDescription>
                  Automatic progression updates when members complete courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg overflow-auto">
                  <pre className="text-sm">
{`graph TD
    A[Course Completion Webhook from IAABOU.org] --> B{Identify Course Type}
    B -->|Rules Test| C[Update Member Status: Rules Complete]
    B -->|Mechanics Course| D[Update Member Status: Mechanics Complete]
    C --> E{Check All Requirements}
    D --> E
    E -->|All Complete| F[Send Completion Congratulations Email]
    E -->|Incomplete| G[Send Progress Update Email]
    F --> H{Already Assigned to Board?}
    G --> I[List Remaining Requirements]
    H -->|No| J[Auto-assign to Holding Board 900]
    H -->|Yes| K[Notify Board Secretary]
    J --> L[Send Board Assignment Email]
    K --> M[Update Secretary Dashboard]
    L --> M
    I --> N[End]
    M --> N`}
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    Automatic progression updates triggered by course completion webhooks
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Template Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Rules Test Completion Email</Label>
                  <Input placeholder="Subject: Congratulations on completing..." />
                  <Button variant="outline" size="sm">Edit Template</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Mechanics Course Completion Email</Label>
                  <Input placeholder="Subject: Mechanics course completed!" />
                  <Button variant="outline" size="sm">Edit Template</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Delay between status update and email</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="5" className="w-24" />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>IAABOU.org to RefSec Data Sync Flow</CardTitle>
                <CardDescription>
                  Automatic synchronization of member data between systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg overflow-auto">
                  <pre className="text-sm">
{`graph LR
    A[IAABOU.org Database] -->|Webhook Trigger| B[Sync Handler]
    B --> C{Sync Type}
    C -->|New Registration| D[Create Member Record]
    C -->|Course Completion| E[Update Training Status]
    C -->|Profile Update| F[Update Member Info]
    D --> G[RefSec API]
    E --> G
    F --> G
    G --> H{API Response}
    H -->|Success| I[Log Sync Success]
    H -->|Error| J[Log Error & Retry]
    I --> K[Update Dashboard]
    J --> L{Retry Count < 3?}
    L -->|Yes| B
    L -->|No| M[Send Admin Alert]
    M --> K`}
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    Data synchronization flow between IAABOU.org and RefSec with error handling
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable automatic sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data when webhooks received
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Sync frequency (manual sync)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="30" className="w-24" />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Maximum retry attempts</Label>
                  <Input type="number" defaultValue="3" className="w-24" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alert admin on sync failures</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notification when sync fails after retries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Workflow Settings</CardTitle>
                <CardDescription>
                  Configure general automation rules and behaviors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Hours for Email Sending</Label>
                  <div className="flex items-center gap-2">
                    <Input type="time" defaultValue="09:00" className="w-32" />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input type="time" defaultValue="17:00" className="w-32" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Emails will be queued outside these hours
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable weekend processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Process registrations and send emails on weekends
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Admin notification email</Label>
                  <Input type="email" placeholder="admin@iaabo.org" />
                  <p className="text-xs text-muted-foreground">
                    Receive workflow alerts and error notifications
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Holding Board assignment threshold</Label>
                  <Input type="number" defaultValue="100" className="w-32" />
                  <p className="text-xs text-muted-foreground">
                    Maximum members in Holding Board 900 before requiring manual assignment
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Export Workflow Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  View Workflow Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Test Workflow with Sample Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminWorkflows;