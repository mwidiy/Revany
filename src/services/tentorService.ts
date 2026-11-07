import { supabase } from '@/lib/supabase';
import { Tutor } from '@/types';

export const tentorService = {
  async getAll(): Promise<Tutor[]> {
    const { data, error } = await supabase
      .from('tentors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tentors:', error.message);
      throw error;
    }

    return (data || []) as Tutor[];
  },

  async getById(id: string): Promise<Tutor | null> {
    const { data, error } = await supabase
      .from('tentors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tentor by id:', error.message);
      return null;
    }

    return data as Tutor;
  },

  async create(tentor: Omit<Tutor, 'id' | 'created_at' | 'updated_at'>): Promise<Tutor> {
    const { data, error } = await supabase
      .from('tentors')
      .insert([tentor as any])
      .select()
      .single();

    if (error) {
      console.error('Error creating tentor:', error.message);
      throw error;
    }

    return data as Tutor;
  },

  async update(id: string, updates: Partial<Tutor>): Promise<Tutor> {
    const { data, error } = await supabase
      .from('tentors')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tentor:', error.message);
      throw error;
    }

    return data as Tutor;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tentors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tentor:', error.message);
      throw error;
    }

    return true;
  }
};
