import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function sanitizeString(str: string, maxLength: number): string {
  return String(str).replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    const body = await req.json();
    const { slideTexts, deckTitle } = body;

    if (!deckTitle || typeof deckTitle !== 'string') {
      return new Response(JSON.stringify({ error: 'deckTitle is required and must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!slideTexts || !Array.isArray(slideTexts) || slideTexts.length === 0 || slideTexts.length > 100) {
      return new Response(JSON.stringify({ error: 'slideTexts must be an array with 1-100 items' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const cleanTitle = sanitizeString(deckTitle, 200);
    const cleanSlides = slideTexts.map((text: unknown) => {
      if (typeof text !== 'string') return '';
      return sanitizeString(text, 5000);
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating guides for ${cleanSlides.length} slides`);

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

    const userPrompt = `Analyze these ${cleanSlides.length} slides from the presentation "${cleanTitle}" and generate speaker guides for each:

${cleanSlides.map((text: string, i: number) => `=== Slide ${i + 1} ===\n${text || '(Empty slide - suggest a title slide or transition)'}`).join('\n\n')}

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
      console.error('AI gateway error:', response.status);
      
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
      return new Response(JSON.stringify({ error: 'Failed to generate guides. Please try again.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return new Response(JSON.stringify({ error: 'Failed to generate guides. Please try again.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let guides;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      guides = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response');
      return new Response(JSON.stringify({ error: 'Failed to process AI response. Please try again.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully generated ${guides.length} guides`);

    return new Response(JSON.stringify({ guides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-guide function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
