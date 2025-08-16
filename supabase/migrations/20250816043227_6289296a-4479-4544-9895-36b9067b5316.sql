
-- Insert a default user for Telegram contacts
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'telegram@personalcrm.local',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "telegram", "providers": ["telegram"]}',
  '{"full_name": "Telegram Bot User"}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;
