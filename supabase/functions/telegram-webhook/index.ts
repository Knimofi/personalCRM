

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
        // Store in Supabase - we need a user_id, so we'll use a default for now
        // In production, you'd want to authenticate the Telegram user
        const { data, error } = await supabase
          .from('contacts')
          .insert([{
            ...contactData,
            user_id: '00000000-0000-0000-0000-000000000000', // Default user ID - you'll need to handle user authentication
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
            "location": "City, Country",
            "context": "How/where we met",
            "email": "email@domain.com",
            "instagram": "username_only",
            "linkedin": "profile_url_or_username",
            "website": "https://website.com",
            "date_met": "YYYY-MM-DD"
          }
          
          If date_met is not specified, use: "${messageDate.toISOString().split('T')[0]}"
          Be precise and only extract information that's clearly present. If no contact information is found, return null.
          
          IMPORTANT: Return ONLY the JSON object, no markdown formatting, no \`\`\`json blocks, just the raw JSON.`
        }],
        temperature: 0.1,
        max_tokens: 500
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
      
      // Geocode the location if provided
      if (extractedData.location) {
        console.log('Geocoding location:', extractedData.location);
        const coordinates = await geocodeLocation(extractedData.location);
        if (coordinates) {
          extractedData.latitude = coordinates.lat;
          extractedData.longitude = coordinates.lng;
          console.log('Geocoded coordinates:', coordinates);
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

