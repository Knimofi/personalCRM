
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Telegram webhook called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse Telegram webhook payload
    const telegramUpdate = await req.json();
    console.log('Received Telegram update:', JSON.stringify(telegramUpdate, null, 2));

    // Check if this is a message update
    if (!telegramUpdate.message) {
      console.log('No message found in update');
      return new Response('No message found', { status: 200, headers: corsHeaders });
    }

    const message = telegramUpdate.message;
    const chatId = message.chat.id;
    const messageText = message.text || '';
    const messageDate = new Date(message.date * 1000);

    console.log(`Processing message from chat ${chatId}: "${messageText}"`);

    // Process voice messages if present
    let processedText = messageText;
    if (message.voice) {
      console.log('Processing voice message...');
      const fileId = message.voice.file_id;
      processedText = await transcribeAudio(fileId);
      console.log('Transcribed text:', processedText);
    }

    // Extract contact information using OpenAI
    if (processedText.trim()) {
      console.log('Processing text:', processedText);
      const contactData = await extractContactInfo(processedText, messageDate);
      console.log('Extracted contact data:', contactData);
      
      if (contactData && contactData.name) {
        // Store in Supabase with default user ID for Telegram contacts
        const { data, error } = await supabase
          .from('contacts')
          .insert([{
            ...contactData,
            user_id: '00000000-0000-0000-0000-000000000001', // Use default Telegram user
            raw_content: processedText,
            telegram_message_id: message.message_id.toString(),
          }]);

        if (error) {
          console.error('Database error:', error);
          return new Response(`Database error: ${error.message}`, { 
            status: 500,
            headers: corsHeaders 
          });
        } else {
          console.log('Contact successfully saved:', data);
          return new Response(JSON.stringify({ success: true, contact: data }), { 
            status: 200,
            headers: corsHeaders 
          });
        }
      } else {
        console.log('No valid contact data extracted');
      }
    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

async function transcribeAudio(fileId: string): Promise<string> {
  try {
    const botToken = '8339139241:AAHjViMDIoxaLJJNlHJZ7y5gHeXYcXU6V8w';
    
    // Get file info from Telegram
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();
    
    if (!fileData.ok) {
      console.error('Failed to get file from Telegram:', fileData);
      return '';
    }

    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    console.log('Downloading audio from:', fileUrl);
    
    // Download the audio file
    const audioResponse = await fetch(fileUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Create FormData for OpenAI Whisper API
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
    formData.append('file', audioBlob, 'audio.ogg');
    formData.append('model', 'whisper-1');

    // Transcribe using OpenAI Whisper
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI transcription error:', errorText);
      return '';
    }

    const transcription = await openaiResponse.json();
    return transcription.text || '';
    
  } catch (error) {
    console.error('Audio transcription error:', error);
    return '';
  }
}

async function extractContactInfo(text: string, messageDate: Date) {
  try {
    console.log('Extracting contact info from:', text);
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Extract contact information from this text about someone I met in person: "${text}"
          
          Return ONLY a JSON object with these fields (use null if not found):
          {
            "name": "Full name",
            "phone": "Phone number with country code if mentioned",
            "location_from": "Where they live/are from (City, Country)",
            "location_met": "Where we physically met (specific venue, event, or general location)",
            "context": "Key professional and personal details in bullet format",
            "email": "email@domain.com",
            "instagram": "username_only",
            "linkedin": "profile_url_or_username",
            "website": "https://website.com",
            "date_met": "YYYY-MM-DD",
            "birthday": "YYYY-MM-DD"
          }
          
          CRITICAL PARSING INSTRUCTIONS:
          
          **Location Parsing:**
          - "location_from": Where they LIVE or are FROM (residence/origin) - use for map display
          - "location_met": Where we physically MET (venue, event, conference, etc.)
          - Distinguish carefully: "I met John from London at the NYC conference" → location_from: "London, UK", location_met: "NYC conference"
          
          **Context Formatting:**
          Structure the context as organized bullet points including:
          • Job title and company (if mentioned) - ALWAYS include this prominently
          • Industry or field of work
          • Mutual connections or referrals
          • Shared interests or topics discussed
          • Any notable personal details
          • Reason for meeting or event context
          
          **Contact Details:**
          - Extract phone numbers in international format when possible
          - For social media, extract just the username (no @ symbol for instagram)
          - LinkedIn can be full URL or just username
          
          **Date Handling:**
          - If date_met not specified, use: "${messageDate.toISOString().split('T')[0]}"
          - For birthday: look for birth dates, ages, or birthday mentions
          
          **Example Context Format:**
          • Senior Software Engineer at Google
          • Works in AI/Machine Learning
          • Referred by Sarah Johnson
          • Interested in startup investing
          • Marathon runner, lives in San Francisco
          • Met at TechCrunch Disrupt networking event
          
          IMPORTANT: Return ONLY the JSON object, no markdown formatting, no backticks, just raw JSON.`
        }],
        temperature: 0.1,
        max_tokens: 600
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI extraction error:', errorText);
      return null;
    }

    const response = await openaiResponse.json();
    const content = response.choices[0].message.content.trim();
    
    console.log('OpenAI response content:', content);
    
    if (content === 'null' || content === '{}') {
      return null;
    }
    
    try {
      let extractedContent = content;
      
      // Remove markdown code blocks if present
      if (extractedContent.startsWith('```json')) {
        extractedContent = extractedContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (extractedContent.startsWith('```')) {
        extractedContent = extractedContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      // Additional cleanup for any remaining backticks
      extractedContent = extractedContent.replace(/^`+|`+$/g, '').trim();
      
      console.log('Cleaned extracted content:', extractedContent);
      
      const extractedData = JSON.parse(extractedContent);
      
      // Validate that we have at least a name
      if (!extractedData || !extractedData.name) {
        return null;
      }
      
      // Geocode both locations if provided
      if (extractedData.location_from) {
        console.log('Geocoding residence location:', extractedData.location_from);
        const coordinates = await geocodeLocation(extractedData.location_from);
        if (coordinates) {
          extractedData.location_from_latitude = coordinates.lat;
          extractedData.location_from_longitude = coordinates.lng;
          console.log('Geocoded residence coordinates:', coordinates);
        }
      }
      
      if (extractedData.location_met) {
        console.log('Geocoding meeting location:', extractedData.location_met);
        const coordinates = await geocodeLocation(extractedData.location_met);
        if (coordinates) {
          extractedData.location_met_latitude = coordinates.lat;
          extractedData.location_met_longitude = coordinates.lng;
          console.log('Geocoded meeting coordinates:', coordinates);
        }
      }
      
      console.log('Successfully parsed contact data:', extractedData);
      return extractedData;
    } catch (parseError) {
      console.error('Failed to parse extracted contact data:', parseError);
      console.error('Raw OpenAI response:', content);
      return null;
    }
  } catch (error) {
    console.error('Failed to extract contact data:', error);
    return null;
  }
}

async function geocodeLocation(location: string) {
  try {
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      console.error('No Mapbox token available');
      return null;
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&limit=1`
    );
    
    if (!response.ok) {
      console.error('Mapbox geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}
