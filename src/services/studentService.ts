import { supabase } from '@/lib/supabase';
import { Student } from '@/types';

export const studentService = {
  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error.message);
      throw error;
    }

    return (data || []) as Student[];
  },

  async getById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching student by id:', error.message);
      return null;
    }

    return data as Student;
  },

  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert([student as any])
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error.message);
      throw error;
    }

    return data as Student;
  },

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error.message);
      throw error;
    }

    return data as Student;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error.message);
      throw error;
    }

    return true;
  },

  async adjustSessions(id: string, delta: number): Promise<Student> {
    const current = await this.getById(id);
    if (!current) throw new Error('Siswa tidak ditemukan');

    const newSisa = Math.max(0, (current.sisa_sesi || 0) + delta);
    return this.update(id, { sisa_sesi: newSisa });
  }
};
