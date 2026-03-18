export interface ComplianceIssue {
  overdues: Array<{
    name: string;
    amount: string;
    daysOverdue: number;
    lastContact: string;
  }>;
  incompleteTraining: Array<{
    name: string;
    course: string;
    progress: number;
    dueDate: string;
  }>;
  atRisk: Array<{
    name: string;
    issue: string;
    riskScore: string;
  }>;
}

export const generateComplianceIssues = (_boardName: string): ComplianceIssue => ({
  overdues: [
    { name: 'John Smith', amount: '$350', daysOverdue: 45, lastContact: '2 weeks ago' },
    { name: 'Sarah Johnson', amount: '$350', daysOverdue: 30, lastContact: '1 week ago' },
    { name: 'Michael Brown', amount: '$175', daysOverdue: 15, lastContact: 'Never' }
  ],
  incompleteTraining: [
    { name: 'Emily Davis', course: 'Rules Test', progress: 65, dueDate: 'Dec 15, 2024' },
    { name: 'David Wilson', course: 'Mechanics', progress: 40, dueDate: 'Dec 20, 2024' }
  ],
  atRisk: [
    { name: 'Lisa Martinez', issue: 'No activity in 90 days', riskScore: 'High' }
  ]
});

export const generateAIDuesReminder = (memberName: string, amount: string, daysOverdue: number) => ({
  subject: `Friendly Reminder: Board Dues Payment`,
  body: `Hi ${memberName},

I hope this message finds you well! I wanted to reach out regarding your board dues of ${amount}.

I noticed the payment is now ${daysOverdue} days past due. I understand things can get busy, so I wanted to send a friendly reminder.

You can make your payment through our online portal or mail a check to the board treasurer. If you've already sent payment, please disregard this message.

If you have any questions or need to discuss payment options, I'm here to help.

Thank you for your continued dedication to officiating!

Best regards,
Board Secretary
Northeast Board 15`,
  tone: 'Friendly, professional, understanding',
  aiReasoning: `Used warm tone as this is the first reminder at ${daysOverdue} days overdue. Acknowledged member's contributions and offered support options to maintain positive relationship.`
});

export const generateAITrainingReminder = (memberName: string, course: string, progress: number, dueDate: string) => ({
  subject: `Training Progress Update: ${course}`,
  body: `Hi ${memberName},

Great job on making progress with your ${course} training! You're currently at ${progress}% completion.

With the deadline coming up on ${dueDate}, I wanted to check in and see if there's anything I can do to help you finish strong.

Remember, completing this training is important for maintaining your certification status. If you need any study materials or have questions, please don't hesitate to reach out.

You've got this!

Best regards,
Board Secretary
Northeast Board 15`,
  tone: 'Encouraging, supportive',
  aiReasoning: `Positive reinforcement approach since member has already started (${progress}%). Emphasized support and resources rather than pressure.`
});

export const generateEngagementInsights = () => ([
  {
    insight: '3 members show declining activity patterns',
    action: 'Send re-engagement message',
    impact: 'High - Prevent member dropout',
    confidence: 92
  },
  {
    insight: 'Training completion rate 15% below board average',
    action: 'Schedule group study session',
    impact: 'Medium - Boost completion rates',
    confidence: 88
  },
  {
    insight: '2 members approaching certification expiration',
    action: 'Send renewal reminder with timeline',
    impact: 'Critical - Prevent lapses',
    confidence: 95
  }
]);

export interface MessageTemplate {
  prompt: string;
  output: {
    subject: string;
    body: string;
    aiReasoning: string;
  };
}

export const communicationTemplates: Record<string, MessageTemplate> = {
  meeting: {
    prompt: 'Board meeting Thursday at 7pm, high school gym, discuss playoff assignments',
    output: {
      subject: 'Board Meeting This Thursday - Playoff Assignments',
      body: `Dear Board Members,

I hope this message finds you well! I wanted to remind everyone about our upcoming board meeting:

📅 **When:** Thursday, 7:00 PM
📍 **Where:** High School Gymnasium
📋 **Main Topic:** Playoff Assignment Discussion

We'll be reviewing and finalizing playoff assignments for the upcoming postseason. Please bring your availability calendars and any schedule conflicts you're aware of.

Light refreshments will be provided. Looking forward to seeing everyone there!

Please reply to confirm your attendance.

Best regards,
Board Secretary
Northeast Board 15`,
      aiReasoning: 'Used friendly but professional tone. Added emojis for visual appeal. Included clear logistics and action items (RSVP, bring calendars).'
    }
  },
  training: {
    prompt: 'Reminder about Rules Test deadline Dec 15',
    output: {
      subject: 'Rules Test Deadline Approaching - December 15th',
      body: `Hello Officials,

This is a friendly reminder that the Rules Test completion deadline is coming up on **December 15th**.

📚 **Study Resources:**
- Online study guide available in your LearnDash portal
- Practice questions updated weekly
- Study group meets Tuesdays at 6 PM (virtual)

⏰ **Time Management Tip:** The test takes about 2 hours. Plan accordingly!

We're here to support you! If you have questions or need study materials, reach out anytime.

You've got this! 💪

Best regards,
Board Secretary
Northeast Board 15`,
      aiReasoning: 'Motivational tone to reduce test anxiety. Included practical resources and support offerings. Added emoji for encouragement.'
    }
  },
  welcome: {
    prompt: 'Welcome new members John, Sarah, and Michael',
    output: {
      subject: 'Welcome to Northeast Board 15! 🎉',
      body: `Dear John, Sarah, and Michael,

Welcome to Northeast Board 15! We're thrilled to have you join our officiating family.

🎯 **Your Next Steps:**
1. Complete your Rules Test by December 15th (link in LearnDash)
2. Attend orientation on December 1st at 6 PM
3. Join our WhatsApp group for quick communications
4. Review the board handbook (attached)

👥 **Meet Your Mentors:**
Each of you will be paired with an experienced official who will guide you through your first season.

📅 **Important Dates:**
- Dec 1: New Member Orientation
- Dec 15: Rules Test Deadline
- Jan 5: Season Kickoff Meeting

If you have any questions, please don't hesitate to reach out. We're all here to support your success!

Welcome aboard! 🏀

Best regards,
Board Secretary
Northeast Board 15`,
      aiReasoning: 'Warm, welcoming tone with clear action items. Structured information with emojis for readability. Emphasized support system and community.'
    }
  }
};

export const generateAIMessage = (
  prompt: string,
  type: 'meeting' | 'training' | 'welcome' | 'custom',
  tone: 'formal' | 'friendly' | 'urgent' = 'friendly'
): { subject: string; body: string; aiReasoning: string } => {
  if (type !== 'custom' && communicationTemplates[type]) {
    return communicationTemplates[type].output;
  }

  // Custom generation based on prompt
  return {
    subject: `Important Update from Northeast Board 15`,
    body: `Dear Board Members,

${prompt}

Please let me know if you have any questions.

Best regards,
Board Secretary
Northeast Board 15`,
    aiReasoning: `Generated custom message with ${tone} tone based on provided prompt.`
  };
};

export const getComplianceStats = () => ({
  hoursThisMonth: 12,
  responseRate: 94,
  actionsLast7Days: 28,
  complianceScore: 85
});
