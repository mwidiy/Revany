-- ==============================================================================
-- REVANI EDU - SEED DATA LEARNING SCHEDULES
-- ==============================================================================

-- Bersihkan data lama jika ada
DELETE FROM public.learning_schedules;

-- Masukkan jadwal les terhubung dengan tentor & siswa yang ada
INSERT INTO public.learning_schedules (tentor_id, student_id, hari, jam_mulai, jam_selesai, mapel, metode, ruangan, status)
SELECT 
  t.id AS tentor_id,
  s.id AS student_id,
  js.hari,
  js.jam_mulai,
  js.jam_selesai,
  js.mapel,
  js.metode,
  js.ruangan,
  'aktif' AS status
FROM (
  VALUES
    ('Kak Dimas Arya, S.Si', 'Farhan Pratama', 'Senin', '15:30', '17:00', 'Matematika & Fisika', 'Offline', 'Ruang Belajar B-02'),
    ('Kak Sarah Nurul, M.Pd', 'Alya Putri Ramadhani', 'Selasa', '16:00', '17:30', 'Kimia & Biologi', 'Offline', 'Ruang Belajar A-01'),
    ('Mr. Kevin Sanjaya, B.Ed', 'Bintang Kusuma', 'Rabu', '14:00', '15:30', 'Bahasa Inggris & TOEFL', 'Online', 'Virtual Zoom Room 01'),
    ('Kak Reza Pahlevi, S.Pd', 'Nayla Zahra Putri', 'Kamis', '15:30', '17:00', 'IPA & Matematika SMP', 'Offline', 'Ruang Belajar B-03'),
    ('Kak Dimas Arya, S.Si', 'Syifa Azzahra', 'Jumat', '14:00', '15:30', 'Matematika SMA', 'Offline', 'Ruang Belajar A-02'),
    ('Kak Nadia Safitri, S.Psi', 'Alvaro Kenzo', 'Sabtu', '09:00', '10:30', 'Calistung & Tematik SD', 'Offline', 'Ruang Kids Smart'),
    ('Kak Bagus Prasetyo, S.Kom', 'Rizky Dwi Ananda', 'Sabtu', '11:00', '12:30', 'Informatika & Logika Koding', 'Online', 'Virtual Lab Coding'),
    ('Kak Sarah Nurul, M.Pd', 'Dinda Kirana', 'Minggu', '10:00', '11:30', 'IPA Terpadu SMP', 'Offline', 'Ruang Belajar A-01')
) AS js(tentor_nama, siswa_nama, hari, jam_mulai, jam_selesai, mapel, metode, ruangan)
JOIN public.tentors t ON t.nama ILIKE '%' || js.tentor_nama || '%'
JOIN public.students s ON s.nama ILIKE '%' || js.siswa_nama || '%';
