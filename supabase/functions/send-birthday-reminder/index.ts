
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Contact {
  id: string;
  name: string;
  birthday: string;
  raw_content?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  location_met?: string;
  location_from?: string;
  context?: string;
  date_met?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { isTest, userEmail } = await req.json();

    if (isTest) {
      // Send test email
      const testContact: Contact = {
        id: 'test',
        name: 'John Doe',
        birthday: '1990-06-15',
        raw_content: 'Met John at a tech conference in San Francisco. He\'s a software engineer working on AI projects.',
        phone: '+1-555-0123',
        email: 'john.doe@example.com',
        location_met: 'San Francisco, CA',
        location_from: 'New York, USA',
        context: 'Tech Conference',
        date_met: '2024-03-15'
      };

      const emailHtml = generateBirthdayEmail(testContact);
      
      const emailResponse = await resend.emails.send({
        from: "Contact Manager <onboarding@resend.dev>",
        to: [userEmail],
        subject: `[TEST] Birthday reminder: ${testContact.name}`,
        html: emailHtml,
      });

      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Regular birthday check - get today's birthdays
    const today = new Date();
    const todayString = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Get users with birthday reminders enabled
    const { data: usersWithReminders, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('birthday_reminders_enabled', true);

    if (usersError) throw usersError;

    for (const userPref of usersWithReminders || []) {
      // Get user's contacts with today's birthday
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userPref.user_id)
        .like('birthday', `%-${todayString}`);

      if (contactsError) continue;

      if (contacts && contacts.length > 0) {
        // Get user email
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userPref.user_id);
        if (userError || !user?.email) continue;

        // Send birthday reminder for each contact
        for (const contact of contacts) {
          const emailHtml = generateBirthdayEmail(contact);
          
          await resend.emails.send({
            from: "Contact Manager <onboarding@resend.dev>",
            to: [user.email],
            subject: `Birthday reminder: ${contact.name}`,
            html: emailHtml,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-birthday-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateBirthdayEmail(contact: Contact): string {
  const contextInfo = contact.raw_content || contact.context || '';
  const birthdayWish = generateBirthdayWish(contact.name, contextInfo);

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🎉 Birthday Reminder: ${contact.name}</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Suggested Birthday Message:</h3>
            <p style="font-style: italic; border-left: 4px solid #2563eb; padding-left: 16px; margin: 16px 0;">
              ${birthdayWish}
            </p>
          </div>

          <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td style="padding: 8px 0;">${contact.name}</td></tr>
              ${contact.phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${contact.phone}</td></tr>` : ''}
              ${contact.email ? `<tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;">${contact.email}</td></tr>` : ''}
              ${contact.instagram ? `<tr><td style="padding: 8px 0; font-weight: bold;">Instagram:</td><td style="padding: 8px 0;">${contact.instagram}</td></tr>` : ''}
              ${contact.linkedin ? `<tr><td style="padding: 8px 0; font-weight: bold;">LinkedIn:</td><td style="padding: 8px 0;">${contact.linkedin}</td></tr>` : ''}
              ${contact.website ? `<tr><td style="padding: 8px 0; font-weight: bold;">Website:</td><td style="padding: 8px 0;">${contact.website}</td></tr>` : ''}
              ${contact.location_met ? `<tr><td style="padding: 8px 0; font-weight: bold;">Where we met:</td><td style="padding: 8px 0;">${contact.location_met}</td></tr>` : ''}
              ${contact.location_from ? `<tr><td style="padding: 8px 0; font-weight: bold;">From:</td><td style="padding: 8px 0;">${contact.location_from}</td></tr>` : ''}
              ${contact.date_met ? `<tr><td style="padding: 8px 0; font-weight: bold;">Date met:</td><td style="padding: 8px 0;">${new Date(contact.date_met).toLocaleDateString()}</td></tr>` : ''}
            </table>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This birthday reminder was sent by your Contact Manager app. 
            You can disable these reminders in your settings.
          </p>
        </div>
      </body>
    </html>
  `;
}

function generateBirthdayWish(name: string, context: string): string {
  const wishes = [
    `Happy birthday, ${name}! Hope you have a wonderful day filled with joy and celebration.`,
    `Wishing you a very happy birthday, ${name}! May this new year of life bring you happiness and success.`,
    `Happy birthday, ${name}! Hope your special day is as amazing as you are.`
  ];

  let wish = wishes[Math.floor(Math.random() * wishes.length)];
  
  if (context) {
    wish += ` It's been great getting to know you since we connected. ${context.substring(0, 100)}${context.length > 100 ? '...' : ''}`;
  }

  return wish;
}

serve(handler);
