-- ==============================================================================
-- UPDATE STUDENTS: JENJANG (TK, PRASEKOLAH) & BIAYA/FEE SISWA
-- ==============================================================================

-- 1. Drop existing CHECK constraint on jenjang
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_jenjang_check;

-- 2. Add updated CHECK constraint with TK and Prasekolah
ALTER TABLE public.students ADD CONSTRAINT students_jenjang_check 
  CHECK (jenjang IN ('TK', 'Prasekolah', 'SD', 'SMP', 'SMA', 'UTBK / Kedinasan'));

-- 3. Add biaya / fee column to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS biaya INTEGER DEFAULT 0;

-- 4. Update existing students with initial fee values
UPDATE public.students SET biaya = 650000 WHERE paket ILIKE '%Reguler%' AND (biaya = 0 OR biaya IS NULL);
UPDATE public.students SET biaya = 1100000 WHERE paket ILIKE '%Intensif%' AND (biaya = 0 OR biaya IS NULL);
UPDATE public.students SET biaya = 1800000 WHERE paket ILIKE '%Eksklusif%' AND (biaya = 0 OR biaya IS NULL);
UPDATE public.students SET biaya = 750000 WHERE biaya = 0 OR biaya IS NULL;
