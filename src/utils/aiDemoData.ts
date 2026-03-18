import { AIActivity } from "@/services/aiActivityLog";

export const generateDemoAIActivities = (count: number = 10): AIActivity[] => {
  const actions = [
    'Processed new registration',
    'Matched member to board',
    'Generated welcome email',
    'Detected duplicate registration',
    'Enrolled member in course',
    'Linked LearnDash account',
    'Sent compliance reminder',
    'Generated board report'
  ];

  const names = [
    'John Smith',
    'Sarah Johnson',
    'Michael Chen',
    'Emily Rodriguez',
    'David Martinez',
    'Lisa Anderson',
    'James Wilson',
    'Maria Garcia'
  ];

  const aiReasonings = [
    'High confidence match based on geographic proximity',
    'Email pattern suggests existing account',
    'Training completion rate indicates engagement',
    'Board capacity optimal for new member',
    'Course prerequisites satisfied',
    'Profile similarity score: 95%'
  ];

  const activities: AIActivity[] = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - i * 3600000).toISOString();
    const status = Math.random() > 0.1 ? 'success' : 'error';
    
    activities.push({
      id: `demo-${i}`,
      timestamp,
      agentType: ['onboarding', 'compliance', 'communication'][Math.floor(Math.random() * 3)] as any,
      action: actions[Math.floor(Math.random() * actions.length)],
      targetId: `target-${i}`,
      targetName: names[Math.floor(Math.random() * names.length)],
      status,
      details: { demo: true },
      aiReasoning: status === 'success' ? aiReasonings[Math.floor(Math.random() * aiReasonings.length)] : 'Processing failed'
    });
  }
  
  return activities;
};

export const generateDemoBoardMatch = () => ({
  boardId: 'board-1',
  boardName: 'Brooklyn Basketball Officials',
  confidence: 0.92,
  reasoning: 'Member address is within 5 miles of board headquarters. Board has capacity for new members and active training program.'
});

export const generateDemoWelcomeEmail = (name: string, boardName: string) => ({
  subject: `Welcome to ${boardName}!`,
  body: `Dear ${name},

We're thrilled to welcome you to ${boardName}! Your registration has been processed and your member profile is now active.

As a new member, you'll have access to:
- Complete training curriculum via IAABO University
- Member resources and rulebooks
- Official assignment opportunities
- Networking with experienced officials

Your next step is to complete the NFHS Rules Test in the training portal. This is required before you can receive game assignments.

If you have any questions, please don't hesitate to reach out to your board secretary.

Welcome to the team!

Best regards,
IAABO Administration`
});

export const generateDemoDuplicateCheck = () => ({
  isDuplicate: false,
  probability: 0.15,
  matches: []
});
