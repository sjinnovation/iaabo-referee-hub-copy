import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Sparkles, Send, Loader2, Wand2 } from "lucide-react";
import { communicationTemplates, generateAIMessage } from "@/utils/secretaryAIDemoData";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CommunicationAssistantDemo = () => {
  const [messageType, setMessageType] = useState<'meeting' | 'training' | 'welcome' | 'custom'>('meeting');
  const [customPrompt, setCustomPrompt] = useState('');
  const [tone, setTone] = useState<'formal' | 'friendly' | 'urgent'>('friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedMessage(null);
    
    // Simulate AI generation
    setGenerationStep("Analyzing context and audience...");
    await new Promise(resolve => setTimeout(resolve, 700));
    
    setGenerationStep("Crafting message structure...");
    await new Promise(resolve => setTimeout(resolve, 900));
    
    setGenerationStep("Applying tone and personalization...");
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setGenerationStep("Finalizing content...");
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const message = generateAIMessage(
      messageType === 'custom' ? customPrompt : communicationTemplates[messageType].prompt,
      messageType,
      tone
    );
    
    setGeneratedMessage(message);
    setIsGenerating(false);
    setGenerationStep("");
  };

  const handleEnhance = async (enhancement: string) => {
    toast({
      title: "✨ Enhancement Applied",
      description: `Message updated with ${enhancement}`,
    });
  };

  const handleSendDemo = () => {
    toast({
      title: "📧 Demo Mode",
      description: "In production, this would send to selected members",
    });
  };

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Message Composer
          </CardTitle>
          <CardDescription>
            Generate professional communications in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Quick Templates</TabsTrigger>
              <TabsTrigger value="custom">Custom Message</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Template</label>
                <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Board Meeting Announcement</SelectItem>
                    <SelectItem value="training">Training Reminder</SelectItem>
                    <SelectItem value="welcome">New Member Welcome</SelectItem>
                  </SelectContent>
                </Select>
                
                {messageType !== 'custom' && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                    <span className="font-medium">Prompt: </span>
                    {communicationTemplates[messageType].prompt}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Message Prompt</label>
                <Textarea
                  placeholder="Describe what you want to communicate... (e.g., 'Remind everyone about the holiday schedule and office closure dates')"
                  value={customPrompt}
                  onChange={(e) => {
                    setCustomPrompt(e.target.value);
                    setMessageType('custom');
                  }}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tone</label>
                <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerate} 
                  className="w-full"
                  disabled={isGenerating || (messageType === 'custom' && !customPrompt)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">AI is working...</p>
                  <p className="text-xs text-muted-foreground">{generationStep}</p>
                </div>
              </div>
            </div>
          )}

          {generatedMessage && !isGenerating && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Generated Message</h4>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEnhance('warmer tone')}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Make Warmer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEnhance('call-to-action')}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Add CTA
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <div className="mt-1 p-3 bg-muted rounded-md font-medium">
                  {generatedMessage.subject}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Message Body</label>
                <div className="mt-1 p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                  {generatedMessage.body}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  AI Reasoning:
                </p>
                <p className="text-sm text-blue-700">{generatedMessage.aiReasoning}</p>
              </div>

              <Card className="bg-background">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Audience Targeting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>All Active Members</span>
                      <Badge variant="secondary">48 members</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Training Incomplete</span>
                      <Badge variant="outline">2 members</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Dues Overdue</span>
                      <Badge variant="outline">3 members</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleSendDemo} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Members (Demo)
                </Button>
                <Button variant="outline" onClick={() => setGeneratedMessage(null)}>
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Before/After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="opacity-60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">❌ Without AI</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>• Writing announcements: 30-45 min each</p>
            <p>• Risk of inconsistent tone or formatting</p>
            <p>• Manual audience segmentation</p>
            <p>• Limited personalization at scale</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">✅ With AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>• AI-drafted messages: 2-3 min each</p>
            <p>• Consistent professional quality</p>
            <p>• Smart targeting suggestions</p>
            <p>• Personalized at scale effortlessly</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
