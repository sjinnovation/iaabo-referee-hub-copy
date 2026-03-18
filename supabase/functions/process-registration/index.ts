import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    let systemPrompt = '';
    let userPrompt = '';
    
    switch(action) {
      case 'match-board':
        systemPrompt = 'You are an expert at matching basketball officials to local boards based on geographic proximity, board capacity, and regional distribution. Return only valid JSON.';
        userPrompt = `Match this member to the best board:
Member Info: ${data.address}
Available Boards: ${JSON.stringify(data.boards)}

Analyze:
1. Geographic proximity (prioritize local boards)
2. Board capacity and member count
3. Regional distribution
4. Active status and training programs

Return JSON format: { "boardId": "board-X", "confidence": 0.95, "reasoning": "Detailed explanation of match" }`;
        break;
        
      case 'generate-welcome-email':
        systemPrompt = 'You are a professional communications specialist for IAABO, writing warm, informative, and encouraging welcome emails to new basketball officials. Return only valid JSON.';
        userPrompt = `Generate a welcome email for a new IAABO member:
Name: ${data.name}
Board: ${data.boardName}
Stage: ${data.stage}

Include:
1. Warm welcome message
2. What to expect as a new member
3. Next steps (training requirements)
4. How to access resources
5. Encouragement and support

Keep tone professional yet friendly. Make them excited about their officiating journey.

Return JSON format: { "subject": "Email subject line", "body": "Full email body with proper formatting" }`;
        break;
        
      case 'detect-duplicate':
        systemPrompt = 'You are a data quality specialist detecting potential duplicate member registrations. Analyze email, name, and phone patterns. Return only valid JSON.';
        userPrompt = `Check if this registration might be a duplicate:

New Registration:
${JSON.stringify(data.newMember, null, 2)}

Existing Members:
${JSON.stringify(data.existingMembers, null, 2)}

Analyze:
1. Exact email match
2. Name similarity (accounting for typos, nicknames)
3. Phone number match
4. Probable duplicate vs coincidence

Return JSON format: { "isDuplicate": boolean, "probability": 0.0-1.0, "matches": ["memberId1"], "reasoning": "Why this is/isn't a duplicate" }`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Processing action: ${action}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI processing failed', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const result = JSON.parse(aiResponse.choices[0].message.content);

    console.log(`AI Response for ${action}:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
