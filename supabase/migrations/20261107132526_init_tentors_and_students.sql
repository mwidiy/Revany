-- ==============================================================================
-- REVANI EDU - DATABASE MIGRATION: TENTORS & STUDENTS
-- ==============================================================================

-- 1. TABEL TENTORS (DATA TENTOR / GURU LES)
CREATE TABLE IF NOT EXISTS public.tentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    email TEXT,
    telepon TEXT,
    mapel TEXT NOT NULL,
    avatar TEXT,
    jam_mengajar INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    total_sesi INTEGER DEFAULT 0,
    fee_per_jam INTEGER DEFAULT 80000,
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'cuti', 'nonaktif')),
    badge TEXT DEFAULT 'Tutor',
    rekening_bank TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL STUDENTS (DATA SISWA BIMBEL / LES)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    jenjang TEXT NOT NULL CHECK (jenjang IN ('SD', 'SMP', 'SMA', 'UTBK / Kedinasan')),
    kelas TEXT NOT NULL,
    sekolah TEXT,
    telepon TEXT NOT NULL,
    alamat TEXT,
    avatar TEXT,
    paket TEXT DEFAULT 'Reguler (8 Sesi / Bulan)',
    sisa_sesi INTEGER DEFAULT 8,
    total_sesi_paket INTEGER DEFAULT 8,
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'lulus', 'nonaktif')),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES: ALLOW ACCESS UNTUK APLIKASI
DROP POLICY IF EXISTS "Public can view tentors" ON public.tentors;
CREATE POLICY "Public can view tentors" ON public.tentors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert tentors" ON public.tentors;
CREATE POLICY "Public can insert tentors" ON public.tentors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update tentors" ON public.tentors;
CREATE POLICY "Public can update tentors" ON public.tentors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete tentors" ON public.tentors;
CREATE POLICY "Public can delete tentors" ON public.tentors FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public can view students" ON public.students;
CREATE POLICY "Public can view students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert students" ON public.students;
CREATE POLICY "Public can insert students" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update students" ON public.students;
CREATE POLICY "Public can update students" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete students" ON public.students;
CREATE POLICY "Public can delete students" ON public.students FOR DELETE USING (true);

-- 5. INITIAL SEED DATA TENTOR (REALISTIS INDONESIA)
INSERT INTO public.tentors (nama, email, telepon, mapel, avatar, jam_mengajar, rating, total_sesi, fee_per_jam, status, badge, rekening_bank)
VALUES
('Kak Dimas Arya, S.Si', 'dimas.arya@revani.edu', '0812-3456-7890', 'Matematika & Fisika', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 48, 4.98, 32, 85000, 'aktif', 'Top Performer', 'BCA 8271928172 a.n Dimas Arya'),
('Kak Sarah Nurul, M.Pd', 'sarah.nurul@revani.edu', '0813-8877-6655', 'Kimia & Biologi', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 42, 4.95, 28, 80000, 'aktif', 'Favorite Tutor', 'Mandiri 137001928192 a.n Sarah Nurul'),
('Mr. Kevin Sanjaya, B.Ed', 'kevin.sanjaya@revani.edu', '0857-1122-3344', 'Bahasa Inggris & TOEFL', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 36, 4.92, 24, 85000, 'aktif', 'Consistent', 'BSI 7182910291 a.n Kevin Sanjaya'),
('Kak Reza Pahlevi, S.Pd', 'reza.pahlevi@revani.edu', '0878-9900-1122', 'IPA & Matematika SMP', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 30, 4.88, 20, 75000, 'aktif', 'Rising Star', 'BRI 020601928191 a.n Reza Pahlevi'),
('Kak Nadia Safitri, S.Psi', 'nadia.safitri@revani.edu', '0896-5544-3322', 'Calistung & Tematik SD', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 28, 4.90, 18, 70000, 'aktif', 'Patience Star', 'BCA 5120192831 a.n Nadia Safitri'),
('Kak Bagus Prasetyo, S.Kom', 'bagus.prasetyo@revani.edu', '0821-7788-9900', 'Informatika & Logika Koding', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 22, 4.85, 14, 90000, 'aktif', 'Tech Specialist', 'BNI 0981928172 a.n Bagus Prasetyo');

-- 6. INITIAL SEED DATA SISWA (REALISTIS INDONESIA)
INSERT INTO public.students (nama, jenjang, kelas, sekolah, telepon, alamat, avatar, paket, sisa_sesi, total_sesi_paket, status, catatan)
VALUES
('Farhan Pratama', 'SMA', 'XII MIPA 1', 'SMAN 28 Jakarta', '0812-9876-5432', 'Jl. Melati No. 14, Jagakarsa, Jakarta Selatan', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'Intensif 12 Sesi / Bulan', 9, 12, 'aktif', 'Target SNBT Kedokteran UI, perlu drill soal kalkulus lanjutan'),
('Alya Putri Ramadhani', 'SMA', 'XII MIPA 3', 'SMAN 38 Jakarta', '0813-1122-3344', 'Perumahan Lenteng Agung Residence Blok B3', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Reguler (8 Sesi / Bulan)', 5, 8, 'aktif', 'Fokus fisika modern & persiapan ujian semester'),
('Bintang Kusuma', 'UTBK / Kedinasan', 'Persiapan Akpol', 'Alumni SMAN 8 Depok', '0856-7788-9900', 'Jl. Margonda Raya No. 45, Depok', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Privat Eksklusif (16 Sesi)', 12, 16, 'aktif', 'Persiapan Tes Akademik Akpol & Bahasa Inggris TOEFL'),
('Nayla Zahra Putri', 'SMP', 'VIII-B', 'SMPN 115 Jakarta', '0877-2233-4455', 'Jl. Tebet Barat Dalam No. 10', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'Reguler (8 Sesi / Bulan)', 6, 8, 'aktif', 'Fokus IPA biologi & persiapan olimpiade tingkat kota'),
('Syifa Azzahra', 'SMA', 'XI MIPA 2', 'SMAN 70 Jakarta', '0818-4455-6677', 'Kebayoran Baru, Jakarta Selatan', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', 'Intensif 12 Sesi / Bulan', 8, 12, 'aktif', 'Paham materi kimia hidrokarbon dengan sangat cepat'),
('Alvaro Kenzo', 'SD', 'III-A', 'SD Al-Azhar Pusat', '0811-9988-7766', 'Kebayoran Lama, Jakarta Selatan', 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80', 'Reguler (8 Sesi / Bulan)', 4, 8, 'aktif', 'Perlu bimbingan matematika dasar dan logika pembagian'),
('Rizky Dwi Ananda', 'UTBK / Kedinasan', 'Alumni SMA 28', 'SMAN 28 Jakarta', '0852-3344-5566', 'Pasar Minggu, Jakarta Selatan', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', 'Privat Eksklusif (16 Sesi)', 14, 16, 'aktif', 'Target STEI ITB, drill soal Penalaran Matematika'),
('Dinda Kirana', 'SMP', 'IX-1', 'SMP Labschool Kebayoran', '0812-7766-5544', 'Gandaria, Jakarta Selatan', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Reguler (8 Sesi / Bulan)', 7, 8, 'aktif', 'Persiapan ASPD & Asesmen Nasional');
