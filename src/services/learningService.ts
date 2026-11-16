import { supabase } from '@/lib/supabase';
import { LearningMaterial, LearningSchedule } from '@/types';

const db = supabase as any;

export const learningService = {
  /**
   * Mengambil semua materi pelajaran
   */
  async getMaterials(jenjang?: string): Promise<LearningMaterial[]> {
    let query = db
      .from('learning_materials')
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (jenjang && jenjang !== 'all') {
      query = query.eq('jenjang', jenjang);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching learning materials:', error.message);
      return [];
    }

    return (data || []) as unknown as LearningMaterial[];
  },

  /**
   * Menambah materi pelajaran baru
   */
  async createMaterial(payload: {
    tentor_id?: string;
    judul: string;
    mapel: string;
    jenjang: string;
    deskripsi?: string;
    file_url?: string;
    tipe_file?: 'pdf' | 'video' | 'doc' | 'link';
  }): Promise<LearningMaterial> {
    const { data, error } = await db
      .from('learning_materials')
      .insert([
        {
          tentor_id: payload.tentor_id || null,
          judul: payload.judul,
          mapel: payload.mapel,
          jenjang: payload.jenjang,
          deskripsi: payload.deskripsi || null,
          file_url: payload.file_url || null,
          tipe_file: payload.tipe_file || 'pdf'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating learning material:', error.message);
      throw error;
    }

    return data as LearningMaterial;
  },

  /**
   * Mengambil jadwal pelajaran siswa
   */
  async getSchedulesByStudent(studentId?: string): Promise<LearningSchedule[]> {
    let query = db
      .from('learning_schedules')
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar,
          telepon
        ),
        student:student_id (
          id,
          nama,
          kelas,
          jenjang
        )
      `)
      .order('hari', { ascending: true });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching learning schedules:', error.message);
      return [];
    }

    return (data || []) as unknown as LearningSchedule[];
  },

  /**
   * Menambahkan jadwal les baru ke database
   */
  async createSchedule(payload: {
    tentor_id?: string;
    student_id: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    mapel: string;
    metode: 'Offline' | 'Online' | 'Hybrid';
    ruangan?: string;
  }): Promise<LearningSchedule> {
    const { data, error } = await db
      .from('learning_schedules')
      .insert([
        {
          tentor_id: payload.tentor_id || null,
          student_id: payload.student_id,
          hari: payload.hari,
          jam_mulai: payload.jam_mulai,
          jam_selesai: payload.jam_selesai,
          mapel: payload.mapel,
          metode: payload.metode,
          ruangan: payload.ruangan || 'Ruang Belajar',
          status: 'aktif'
        }
      ])
      .select(`
        *,
        tentor:tentor_id (
          id,
          nama,
          mapel,
          avatar
        ),
        student:student_id (
          id,
          nama,
          kelas,
          jenjang
        )
      `)
      .single();

    if (error) {
      console.error('Error creating learning schedule:', error.message);
      throw error;
    }

    return data as unknown as LearningSchedule;
  },

  /**
   * Menghapus jadwal les dari database
   */
  async deleteSchedule(scheduleId: string): Promise<boolean> {
    const { error } = await db
      .from('learning_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('Error deleting learning schedule:', error.message);
      throw error;
    }

    return true;
  }
};
