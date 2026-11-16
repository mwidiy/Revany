-- ==============================================================================
-- REVANI EDU - ADD AUTH CREDENTIALS TO TENTORS AND STUDENTS
-- ==============================================================================

-- 1. Tambah kolom password ke tabel tentors jika belum ada
ALTER TABLE public.tentors 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';

-- Update password tentor yang sudah ada agar konsisten
UPDATE public.tentors 
SET password = '123456' 
WHERE password IS NULL OR password = '';

-- 2. Tambah kolom email & password ke tabel students jika belum ada
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';

-- Berikan email default realistis untuk siswa yang sudah ada
UPDATE public.students SET email = 'farhan@siswa.edu', password = '123456' WHERE nama ILIKE '%Farhan%';
UPDATE public.students SET email = 'alya@siswa.edu', password = '123456' WHERE nama ILIKE '%Alya%';
UPDATE public.students SET email = 'bintang@siswa.edu', password = '123456' WHERE nama ILIKE '%Bintang%';
UPDATE public.students SET email = 'nayla@siswa.edu', password = '123456' WHERE nama ILIKE '%Nayla%';
UPDATE public.students SET email = 'syifa@siswa.edu', password = '123456' WHERE nama ILIKE '%Syifa%';
UPDATE public.students SET email = 'alvaro@siswa.edu', password = '123456' WHERE nama ILIKE '%Alvaro%';
UPDATE public.students SET email = 'rizky@siswa.edu', password = '123456' WHERE nama ILIKE '%Rizky%';
UPDATE public.students SET email = 'dinda@siswa.edu', password = '123456' WHERE nama ILIKE '%Dinda%';

-- Fallback jika ada siswa lain yang belum punya email
UPDATE public.students 
SET email = LOWER(REPLACE(nama, ' ', '.')) || '@siswa.edu', password = '123456'
WHERE email IS NULL OR email = '';
