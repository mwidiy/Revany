import { supabase } from '@/lib/supabase';
import { AttendanceSession, AttendanceRecord } from '@/types';
import { studentService } from './studentService';

const db = supabase as any;

// Karakter aman tanpa angka/huruf ambigu (seperti 0/O atau 1/I)
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRandomCode(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  // Format rapi: RN-XXXX (misal: RN-8K2A)
  return `RN-${result.slice(0, 4)}`;
}

export const attendanceService = {
  /**
   * Mengambil semua sesi absensi aktif hari ini
   */
  async getActiveSessions(): Promise<AttendanceSession[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await db
      .from('attendance_sessions')
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        ),
        records:attendance_records (
          id,
          session_id,
          student_id,
          kode_digunakan,
          waktu_absen,
          status,
          catatan,
          student:student_id (
            id,
            nama,
            kelas,
            jenjang,
            avatar,
            sisa_sesi
          )
        )
      `)
      .eq('tanggal', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active attendance sessions:', error.message);
      return [];
    }

    return (data || []) as unknown as AttendanceSession[];
  },

  /**
   * Mengambil semua riwayat sesi absensi
   */
  async getAllSessions(limit = 25): Promise<AttendanceSession[]> {
    const { data, error } = await db
      .from('attendance_sessions')
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        ),
        records:attendance_records (
          id,
          session_id,
          student_id,
          kode_digunakan,
          waktu_absen,
          status,
          catatan,
          student:student_id (
            id,
            nama,
            kelas,
            jenjang,
            avatar,
            sisa_sesi
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all attendance sessions:', error.message);
      return [];
    }

    return (data || []) as unknown as AttendanceSession[];
  },

  /**
   * Membuat sesi absensi baru dengan kode unik
   */
  async createSession(payload: {
    tentor_id?: string;
    mapel: string;
    judul_sesi?: string;
    catatan?: string;
    customCode?: string;
  }): Promise<AttendanceSession> {
    const kodeUnik = payload.customCode ? payload.customCode.trim().toUpperCase() : generateRandomCode();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await db
      .from('attendance_sessions')
      .insert([
        {
          tentor_id: payload.tentor_id || null,
          mapel: payload.mapel,
          judul_sesi: payload.judul_sesi || `Kelas ${payload.mapel}`,
          kode_unik: kodeUnik,
          tanggal: today,
          status: 'aktif',
          waktu_mulai: new Date().toISOString(),
          catatan: payload.catatan || null
        }
      ])
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('Error creating attendance session:', error.message);
      throw new Error(`Gagal membuat sesi absensi: ${error.message}`);
    }

    return data as unknown as AttendanceSession;
  },

  /**
   * Menutup sesi absensi agar tidak bisa diakses lagi oleh siswa
   */
  async closeSession(sessionId: string): Promise<AttendanceSession> {
    const { data, error } = await db
      .from('attendance_sessions')
      .update({
        status: 'ditutup',
        waktu_selesai: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error closing attendance session:', error.message);
      throw error;
    }

    return data as AttendanceSession;
  },

  /**
   * Membuka kembali sesi absensi yang ditutup
   */
  async reopenSession(sessionId: string): Promise<AttendanceSession> {
    const { data, error } = await db
      .from('attendance_sessions')
      .update({
        status: 'aktif',
        waktu_selesai: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error reopening attendance session:', error.message);
      throw error;
    }

    return data as AttendanceSession;
  },

  /**
   * Menghapus sesi absensi
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await db
      .from('attendance_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error.message);
      throw error;
    }

    return true;
  },

  /**
   * SISWA: Melakukan absensi dengan Kode Unik
   */
  async submitAttendanceWithCode(
    kodeInput: string,
    studentId: string,
    catatan?: string
  ): Promise<{ record: AttendanceRecord; session: AttendanceSession }> {
    const cleanedCode = kodeInput.trim().toUpperCase();

    if (!cleanedCode) {
      throw new Error('Silakan masukkan kode unik absensi');
    }

    // 1. Cari sesi dengan kode_unik yang aktif
    const { data: sessionData, error: sessionError } = await db
      .from('attendance_sessions')
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        )
      `)
      .eq('kode_unik', cleanedCode)
      .maybeSingle();

    if (sessionError) {
      console.error('Error searching session by code:', sessionError.message);
      throw new Error('Terjadi kendala saat memeriksa kode');
    }

    if (!sessionData) {
      throw new Error(`Kode absensi "${cleanedCode}" tidak ditemukan. Pastikan kode yang dimasukkan sesuai.`);
    }

    if (sessionData.status !== 'aktif') {
      throw new Error('Sesi absensi untuk kode ini sudah ditutup oleh Tentor.');
    }

    // 2. Cek apakah siswa sudah pernah absen di sesi ini
    const { data: existingRecord } = await db
      .from('attendance_records')
      .select('id, waktu_absen')
      .eq('session_id', sessionData.id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (existingRecord) {
      throw new Error('Kamu sudah berhasil melakukan absensi pada sesi ini sebelumnya!');
    }

    // 3. Masukkan presensi siswa
    const { data: newRecord, error: insertError } = await db
      .from('attendance_records')
      .insert([
        {
          session_id: sessionData.id,
          student_id: studentId,
          kode_digunakan: cleanedCode,
          waktu_absen: new Date().toISOString(),
          status: 'hadir',
          catatan: catatan || 'Hadir mandiri via Portal Siswa (Kode Unik)'
        }
      ])
      .select(`
        *,
        student:student_id (
          id,
          nama,
          kelas,
          jenjang,
          avatar
        )
      `)
      .single();

    if (insertError) {
      console.error('Error submitting attendance:', insertError.message);
      throw new Error(`Gagal mencatat kehadiran: ${insertError.message}`);
    }

    // 4. Potong sisa kuota sesi siswa sebanyak 1 sesi
    try {
      await studentService.adjustSessions(studentId, -1);
    } catch (adjustError) {
      console.warn('Gagal memotong sisa sesi otomatis:', adjustError);
    }

    return {
      record: newRecord as unknown as AttendanceRecord,
      session: sessionData as unknown as AttendanceSession
    };
  },

  /**
   * Mengambil riwayat absensi seorang siswa
   */
  async getStudentAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await db
      .from('attendance_records')
      .select(`
        *,
        session:session_id (
          id,
          mapel,
          judul_sesi,
          tanggal,
          kode_unik,
          tentor:tentor_id (
            id,
            nama,
            avatar
          )
        )
      `)
      .eq('student_id', studentId)
      .order('waktu_absen', { ascending: false });

    if (error) {
      console.error('Error fetching student attendance history:', error.message);
      return [];
    }

    return (data || []) as unknown as AttendanceRecord[];
  },

  /**
   * REKAP PERTEMUAN: Mencatat kilas balik pertemuan les yang telah selesai
   * (Topik materi yang diajarkan, evaluasi pemahaman siswa, dan PR/tugas)
   */
  async createMeetingRecap(payload: {
    tentor_id?: string;
    student_id: string;
    mapel: string;
    judul_sesi: string;
    tanggal: string;
    jam_mulai?: string;
    jam_selesai?: string;
    catatan: string;
    tugas_pr?: string;
    status_kehadiran?: 'hadir' | 'izin' | 'sakit' | 'alpha';
    potong_sesi?: boolean;
    metode?: string;
  }): Promise<AttendanceSession> {
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const kodeUnik = `RKP-${codeSuffix}`;
    const metode = payload.metode || 'Offline';
    const jamInfo = payload.jam_mulai && payload.jam_selesai ? `${payload.jam_mulai} - ${payload.jam_selesai}` : '15:30 - 17:00';
    
    // Format rapi catatan sesi agar menyimpan info metode & PR
    let formattedNotes = `[METODE: ${metode}] [JAM: ${jamInfo}]\n${payload.catatan}`;
    if (payload.tugas_pr && payload.tugas_pr.trim()) {
      formattedNotes += `\n[PR / TUGAS]: ${payload.tugas_pr.trim()}`;
    }

    // 1. Simpan sesi pertemuan
    const { data: sessionData, error: sessionError } = await db
      .from('attendance_sessions')
      .insert([
        {
          tentor_id: payload.tentor_id || null,
          mapel: payload.mapel,
          judul_sesi: payload.judul_sesi.trim(),
          kode_unik: kodeUnik,
          tanggal: payload.tanggal,
          status: 'ditutup', // Sesi sudah terlaksana
          waktu_mulai: payload.jam_mulai ? `${payload.tanggal}T${payload.jam_mulai}:00.000Z` : new Date().toISOString(),
          waktu_selesai: payload.jam_selesai ? `${payload.tanggal}T${payload.jam_selesai}:00.000Z` : new Date().toISOString(),
          catatan: formattedNotes
        }
      ])
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        )
      `)
      .single();

    if (sessionError) {
      console.error('Error creating meeting recap session:', sessionError.message);
      throw new Error(`Gagal menyimpan sesi pertemuan: ${sessionError.message}`);
    }

    // 2. Simpan record kehadiran siswa terkait
    const { error: recordError } = await db
      .from('attendance_records')
      .insert([
        {
          session_id: sessionData.id,
          student_id: payload.student_id,
          kode_digunakan: kodeUnik,
          waktu_absen: new Date().toISOString(),
          status: payload.status_kehadiran || 'hadir',
          catatan: payload.catatan
        }
      ]);

    if (recordError) {
      console.error('Error creating meeting recap record:', recordError.message);
    }

    // 3. Potong sisa kuota sesi siswa jika diaktifkan
    if (payload.potong_sesi) {
      try {
        await studentService.adjustSessions(payload.student_id, -1);
      } catch (err) {
        console.warn('Gagal memotong kuota sesi siswa:', err);
      }
    }

    return sessionData as unknown as AttendanceSession;
  },

  /**
   * REKAP PERTEMUAN: Mengambil seluruh riwayat rekap pertemuan belajar
   */
  async getMeetingRecaps(): Promise<AttendanceSession[]> {
    const { data, error } = await db
      .from('attendance_sessions')
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar,
          telepon
        ),
        records:attendance_records (
          id,
          session_id,
          student_id,
          kode_digunakan,
          waktu_absen,
          status,
          catatan,
          student:student_id (
            id,
            nama,
            kelas,
            jenjang,
            avatar,
            sekolah,
            sisa_sesi,
            telepon
          )
        )
      `)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meeting recaps:', error.message);
      return [];
    }

    return (data || []) as unknown as AttendanceSession[];
  }
};
