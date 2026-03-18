import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Send, TrendingDown, CheckCircle, Loader2 } from "lucide-react";
import { generateComplianceIssues, generateAIDuesReminder, generateAITrainingReminder, generateEngagementInsights } from "@/utils/secretaryAIDemoData";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ComplianceAgentDemo = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  
  const issues = generateComplianceIssues("Northeast Board 15");
  const insights = generateEngagementInsights();

  const handleGenerateReminder = async (type: 'dues' | 'training', data: any) => {
    setIsGenerating(true);
    setShowEmailDialog(true);
    
    // Simulate AI generation with steps
    setGenerationStep("Analyzing member history...");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setGenerationStep("Crafting personalized message...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setGenerationStep("Optimizing tone and timing...");
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const email = type === 'dues' 
      ? generateAIDuesReminder(data.name, data.amount, data.daysOverdue)
      : generateAITrainingReminder(data.name, data.course, data.progress, data.dueDate);
    
    setGeneratedEmail(email);
    setIsGenerating(false);
    setGenerationStep("");
  };

  const handleSendDemo = () => {
    setShowEmailDialog(false);
    toast({
      title: "✨ Demo Mode",
      description: "In production, this email would be sent to the member",
    });
  };

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      {/* Alerts Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Overdue Dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">{issues.overdues.length}</div>
            <p className="text-sm text-muted-foreground">Members need follow-up</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Incomplete Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">{issues.incompleteTraining.length}</div>
            <p className="text-sm text-muted-foreground">Approaching deadline</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">{issues.atRisk.length}</div>
            <p className="text-sm text-muted-foreground">Low engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Dues Details */}
      <Card>
        <CardHeader>
          <CardTitle>Members with Overdue Dues</CardTitle>
          <CardDescription>AI-powered follow-up recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.overdues.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Amount: {member.amount}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {member.daysOverdue} days overdue
                    </span>
                    <span>Last contact: {member.lastContact}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleGenerateReminder('dues', member)}
                  className="ml-4"
                >
                  Generate Reminder
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incomplete Training Details */}
      <Card>
        <CardHeader>
          <CardTitle>Training Progress</CardTitle>
          <CardDescription>Members needing encouragement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.incompleteTraining.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.course}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{member.progress}% complete</span>
                      <span className="text-muted-foreground">Due: {member.dueDate}</span>
                    </div>
                    <Progress value={member.progress} />
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleGenerateReminder('training', member)}
                  className="ml-4"
                >
                  Send Encouragement
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Proactive recommendations for your board</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Badge variant="outline" className="mt-1">
                  {insight.confidence}% confidence
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">{insight.insight}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended action: {insight.action}
                  </p>
                  <p className="text-sm text-primary mt-1">
                    Impact: {insight.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Generation Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Message</DialogTitle>
            <DialogDescription>
              Review and send this personalized message
            </DialogDescription>
          </DialogHeader>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{generationStep}</p>
            </div>
          ) : generatedEmail ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  {generatedEmail.subject}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap text-sm">
                  {generatedEmail.body}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">AI Reasoning:</p>
                <p className="text-sm text-blue-700">{generatedEmail.aiReasoning}</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSendDemo} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message (Demo)
                </Button>
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};
