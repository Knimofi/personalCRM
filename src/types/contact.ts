
export interface Contact {
  id: string;
  user_id: string;
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
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  telegram_message_id?: string;
  raw_content?: string;
  location_met_latitude?: number;
  location_met_longitude?: number;
  location_from_latitude?: number;
  location_from_longitude?: number;
  profile_picture_url?: string;
}
