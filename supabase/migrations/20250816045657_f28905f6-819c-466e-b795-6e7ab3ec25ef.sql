
-- Create a more permissive RLS policy for authenticated users to view Telegram contacts
-- This allows any authenticated user to view contacts from the default Telegram user
CREATE POLICY "Authenticated users can view telegram contacts" 
ON public.contacts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  user_id = '00000000-0000-0000-0000-000000000001'
);

-- Also create a policy to allow authenticated users to create contacts with their own user_id
-- This ensures new contacts created through the UI use the authenticated user's ID
CREATE POLICY "Authenticated users can create their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update the existing policies to be more specific
-- Drop the old generic policies and replace with more specific ones
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

-- Recreate the user-specific policies with clearer names
CREATE POLICY "Users can view their own user contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update their own user contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can delete their own user contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000001');

-- Allow users to update Telegram contacts (for editing contact details)
CREATE POLICY "Authenticated users can update telegram contacts" 
ON public.contacts 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  user_id = '00000000-0000-0000-0000-000000000001'
);

-- Allow users to delete Telegram contacts if needed
CREATE POLICY "Authenticated users can delete telegram contacts" 
ON public.contacts 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  user_id = '00000000-0000-0000-0000-000000000001'
);
