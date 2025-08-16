
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  location?: string;
  context?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  date_met?: string;
  created_at: string;
  updated_at: string;
  telegram_message_id?: string;
  raw_content?: string;
  latitude?: number;
  longitude?: number;
}
