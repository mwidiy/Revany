-- Add jenis_kelamin to tentors
ALTER TABLE public.tentors ADD COLUMN IF NOT EXISTS jenis_kelamin TEXT DEFAULT 'L' CHECK (jenis_kelamin IN ('L', 'P'));

-- Update existing tentors with appropriate gender
UPDATE public.tentors SET jenis_kelamin = 'P' WHERE nama ILIKE '%Sarah%' OR nama ILIKE '%Nadia%';
UPDATE public.tentors SET jenis_kelamin = 'L' WHERE jenis_kelamin IS NULL OR (nama NOT ILIKE '%Sarah%' AND nama NOT ILIKE '%Nadia%');
