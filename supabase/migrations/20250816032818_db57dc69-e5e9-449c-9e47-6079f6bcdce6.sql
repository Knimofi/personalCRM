
-- Create contacts table for storing extracted contact information
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  context TEXT,
  email TEXT,
  instagram TEXT,
  linkedin TEXT,
  website TEXT,
  date_met DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  telegram_message_id TEXT,
  raw_content TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
  ON public.contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
  ON public.contacts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
