-- ==============================================================================
-- REVANI EDU - DATABASE MIGRATION: ATTENDANCE SYSTEM & STUDENT PORTAL
-- ==============================================================================

-- 1. TABEL ATTENDANCE_SESSIONS (SESI ABSENSI HARI INI DIBUAT TENTOR)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tentor_id UUID REFERENCES public.tentors(id) ON DELETE SET NULL,
    mapel TEXT NOT NULL,
    judul_sesi TEXT,
    kode_unik VARCHAR(10) NOT NULL UNIQUE,
    tanggal DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'ditutup')),
    waktu_mulai TIMESTAMPTZ DEFAULT NOW(),
    waktu_selesai TIMESTAMPTZ,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL ATTENDANCE_RECORDS (REKAP PRESENSI SISWA MENGGUNAKAN KODE UNIK)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    kode_digunakan VARCHAR(10) NOT NULL,
    waktu_absen TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_session UNIQUE (session_id, student_id)
);

-- 3. TABEL LEARNING_MATERIALS (MATERI & MODUL PELAJARAN)
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tentor_id UUID REFERENCES public.tentors(id) ON DELETE SET NULL,
    judul TEXT NOT NULL,
    mapel TEXT NOT NULL,
    jenjang TEXT NOT NULL,
    deskripsi TEXT,
    file_url TEXT,
    tipe_file TEXT DEFAULT 'pdf' CHECK (tipe_file IN ('pdf', 'video', 'doc', 'link')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL LEARNING_SCHEDULES (JADWAL PELAJARAN SISWA)
CREATE TABLE IF NOT EXISTS public.learning_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tentor_id UUID REFERENCES public.tentors(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    hari TEXT NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    mapel TEXT NOT NULL,
    metode TEXT DEFAULT 'Offline' CHECK (metode IN ('Offline', 'Online', 'Hybrid')),
    ruangan TEXT DEFAULT 'Ruang Belajar',
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_schedules ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES: ALLOW ACCESS UNTUK APLIKASI
-- attendance_sessions
DROP POLICY IF EXISTS "Public can view attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "Public can view attendance_sessions" ON public.attendance_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "Public can insert attendance_sessions" ON public.attendance_sessions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "Public can update attendance_sessions" ON public.attendance_sessions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public can delete attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "Public can delete attendance_sessions" ON public.attendance_sessions FOR DELETE USING (true);

-- attendance_records
DROP POLICY IF EXISTS "Public can view attendance_records" ON public.attendance_records;
CREATE POLICY "Public can view attendance_records" ON public.attendance_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert attendance_records" ON public.attendance_records;
CREATE POLICY "Public can insert attendance_records" ON public.attendance_records FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update attendance_records" ON public.attendance_records;
CREATE POLICY "Public can update attendance_records" ON public.attendance_records FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public can delete attendance_records" ON public.attendance_records;
CREATE POLICY "Public can delete attendance_records" ON public.attendance_records FOR DELETE USING (true);

-- learning_materials
DROP POLICY IF EXISTS "Public can view learning_materials" ON public.learning_materials;
CREATE POLICY "Public can view learning_materials" ON public.learning_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert learning_materials" ON public.learning_materials;
CREATE POLICY "Public can insert learning_materials" ON public.learning_materials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update learning_materials" ON public.learning_materials;
CREATE POLICY "Public can update learning_materials" ON public.learning_materials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public can delete learning_materials" ON public.learning_materials;
CREATE POLICY "Public can delete learning_materials" ON public.learning_materials FOR DELETE USING (true);

-- learning_schedules
DROP POLICY IF EXISTS "Public can view learning_schedules" ON public.learning_schedules;
CREATE POLICY "Public can view learning_schedules" ON public.learning_schedules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert learning_schedules" ON public.learning_schedules;
CREATE POLICY "Public can insert learning_schedules" ON public.learning_schedules FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update learning_schedules" ON public.learning_schedules;
CREATE POLICY "Public can update learning_schedules" ON public.learning_schedules FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public can delete learning_schedules" ON public.learning_schedules;
CREATE POLICY "Public can delete learning_schedules" ON public.learning_schedules FOR DELETE USING (true);

-- 7. INITIAL SAMPLE DATA (MATERIALS)
INSERT INTO public.learning_materials (judul, mapel, jenjang, deskripsi, file_url, tipe_file)
VALUES
('Ringkasan Rumus Cepat Matematika SMP & Latihan Soal', 'Matematika', 'SMP', 'Kompilasi rumus aljabar, phytagoras, geometri, dan statistika untuk persiapan ujian.', 'https://drive.google.com', 'pdf'),
('Modul Bedah Tuntas SNBT TPS & Literasi Penalaran', 'UTBK / Kedinasan', 'UTBK / Kedinasan', 'Modul eksklusif kupas tuntas penalaran matematika dan penalaran umum SNBT 2026.', 'https://drive.google.com', 'pdf'),
('Handout Kimia SMA: Stoikiometri & Tata Nama Senyawa', 'Kimia', 'SMA', 'Catatan ringkas konsep mol, persamaan reaksi, dan stoikiometri larutan.', 'https://drive.google.com', 'pdf'),
('Worksheet Tematik & Calistung Pintar Ceria', 'Tematik', 'SD', 'Lembar kerja interaktif bergambar latihan berhitung dan membaca seru untuk kelas 1-3 SD.', 'https://drive.google.com', 'pdf');
