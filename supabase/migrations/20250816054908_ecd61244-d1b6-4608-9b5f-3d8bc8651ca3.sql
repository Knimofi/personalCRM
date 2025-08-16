
-- Add birthday and is_hidden fields to the contacts table
ALTER TABLE public.contacts 
ADD COLUMN birthday date,
ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;

-- Add an index on is_hidden for better query performance when filtering
CREATE INDEX idx_contacts_is_hidden ON public.contacts(is_hidden);

-- Add an index on birthday for potential birthday queries
CREATE INDEX idx_contacts_birthday ON public.contacts(birthday);
