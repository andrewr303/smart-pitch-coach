import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slideTexts, deckTitle } = await req.json();
    
    if (!slideTexts || !Array.isArray(slideTexts) || slideTexts.length === 0) {
      throw new Error('slideTexts array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating guides for ${slideTexts.length} slides from deck: ${deckTitle}`);

    const systemPrompt = `You are an expert presentation coach. Your job is to analyze slide content and generate helpful speaker guides.

For each slide, you must return a JSON object with exactly this structure:
{
  "slideNumber": number,
  "title": "A concise title for the slide content",
  "keyTalkingPoints": ["3 specific, actionable talking points"],
  "transitionStatement": "A smooth transition phrase to the next slide",
  "emphasisTopic": "The main takeaway or key message to emphasize",
  "keywords": ["3-5 relevant keywords"],
  "stats": ["Any statistics mentioned, or empty array if none"],
  "speakerReminder": {
    "timing": "Suggested time like '90 seconds' or '2 minutes'",
    "energy": "High, Medium, or Low based on content"
  }
}

Be specific, practical, and help the speaker deliver the content with confidence.`;

    const userPrompt = `Analyze these ${slideTexts.length} slides from the presentation "${deckTitle}" and generate speaker guides for each:

${slideTexts.map((text: string, i: number) => `=== Slide ${i + 1} ===\n${text || '(Empty slide - suggest a title slide or transition)'}`).join('\n\n')}

Return a JSON array with a guide object for each slide. Respond ONLY with valid JSON, no markdown or explanation.`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing guides...');

    // Parse the JSON response (handle markdown code blocks if present)
    let guides;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      guides = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`Successfully generated ${guides.length} guides`);

    return new Response(JSON.stringify({ guides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-guide function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
