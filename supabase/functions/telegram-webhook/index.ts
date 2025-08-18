
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

interface ContactInfo {
  name: string;
  phone?: string;
  location_met?: string;
  location_from?: string;
  context?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  date_met?: string;
  birthday?: string;
  location_met_latitude?: number;
  location_met_longitude?: number;
  location_from_latitude?: number;
  location_from_longitude?: number;
}

async function extractContactInfo(message: string): Promise<ContactInfo | null> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.error('OpenAI API key not found');
    return null;
  }

  try {
    console.log('Calling OpenAI API to extract contact info from:', message);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting contact information from messages. 

IMPORTANT DISTINCTIONS:
- "location_met": Where the user physically met this person (conference, coffee shop, etc.)
- "location_from": Where this person currently lives/is from (their city/country of residence)

HIGHLIGHTS vs CONTEXT:
- Only extract "context" if the message specifically mentions to "focus on", "highlight", "remember", "important", "key point", or similar emphasis words
- Context should contain key information that was specifically emphasized as important to remember
- Do NOT put general conversation details in context unless explicitly highlighted

Extract ONLY the information that is clearly stated. Do not infer or assume information.
Return a JSON object with the following structure:
{
  "name": "string (required)",
  "phone": "string (optional, include country code if mentioned)",
  "location_met": "string (optional - WHERE they met, like 'Tech Conference Berlin', 'Coffee shop in Paris')",
  "location_from": "string (optional - WHERE they live/are from, like 'Berlin, Germany', 'New York, USA')",
  "context": "string (optional - ONLY if specifically highlighted as important)",
  "email": "string (optional)",
  "instagram": "string (optional, include @ if mentioned)",
  "linkedin": "string (optional, full URL if possible)",
  "website": "string (optional, full URL)",
  "date_met": "string (optional, YYYY-MM-DD format)",
  "birthday": "string (optional, YYYY-MM-DD format)"
}

Examples:
- "Met John at the Berlin Tech Conference. He lives in Munich and works at Google. Remember to focus on his AI expertise." 
  → location_met: "Berlin Tech Conference", location_from: "Munich, Germany", context: "AI expertise"
- "Sarah from London, met her at Starbucks yesterday"
  → location_met: "Starbucks", location_from: "London, UK"
- "Met Mike, he's from San Francisco. Important: he's looking for a new job"
  → location_from: "San Francisco, USA", context: "looking for a new job"`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in OpenAI response');
      return null;
    }

    try {
      const contactInfo = JSON.parse(content);
      console.log('Extracted contact info:', contactInfo);
      
      // Validate required name field
      if (!contactInfo.name || typeof contactInfo.name !== 'string') {
        console.error('Invalid or missing name in extracted info');
        return null;
      }

      return contactInfo;
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError, 'Content:', content);
      return null;
    }
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}

async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!location || location.trim() === '') {
    return null;
  }

  try {
    console.log(`Geocoding location: ${location}`);
    
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const encodedLocation = encodeURIComponent(location.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`,
      {
        headers: {
          'User-Agent': 'TelegramScoutBuddy/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('Geocoding response:', data);

    if (data && data.length > 0) {
      const result = data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        console.log(`Geocoded "${location}" to: ${latitude}, ${longitude}`);
        return { latitude, longitude };
      }
    }

    console.warn(`No geocoding results found for location: ${location}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Telegram webhook called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const update: TelegramUpdate = await req.json();
    console.log('Received update:', JSON.stringify(update, null, 2));

    if (!update.message?.text) {
      console.log('No text message found, ignoring update');
      return new Response('OK', { headers: corsHeaders });
    }

    const message = update.message;
    const messageText = message.text;
    
    console.log(`Processing message: "${messageText}"`);

    // Extract contact information using OpenAI
    const contactInfo = await extractContactInfo(messageText);
    
    if (!contactInfo) {
      console.log('No contact information extracted from message');
      return new Response('OK', { headers: corsHeaders });
    }

    console.log('Extracted contact info:', contactInfo);

    // Geocode locations if provided
    let locationMetCoords = null;
    let locationFromCoords = null;

    if (contactInfo.location_met) {
      locationMetCoords = await geocodeLocation(contactInfo.location_met);
    }

    if (contactInfo.location_from) {
      locationFromCoords = await geocodeLocation(contactInfo.location_from);
    }

    // Format the original message as bullet points for better structure
    const formattedMessage = messageText
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => `• ${sentence}`)
      .join('\n');

    // Prepare contact data for database insertion
    const contactData = {
      user_id: '00000000-0000-0000-0000-000000000001', // Special user ID for Telegram contacts
      name: contactInfo.name,
      phone: contactInfo.phone || null,
      location_met: contactInfo.location_met || null,
      location_from: contactInfo.location_from || null,
      context: contactInfo.context || null,
      email: contactInfo.email || null,
      instagram: contactInfo.instagram || null,
      linkedin: contactInfo.linkedin || null,
      website: contactInfo.website || null,
      date_met: contactInfo.date_met || null,
      birthday: contactInfo.birthday || null,
      telegram_message_id: message.message_id.toString(),
      raw_content: formattedMessage,
      is_hidden: false,
      location_met_latitude: locationMetCoords?.latitude || null,
      location_met_longitude: locationMetCoords?.longitude || null,
      location_from_latitude: locationFromCoords?.latitude || null,
      location_from_longitude: locationFromCoords?.longitude || null,
    };

    console.log('Inserting contact data:', contactData);

    // Insert contact into database
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      return new Response('Database Error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Successfully created contact:', data);

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
