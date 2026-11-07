import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const defaultUrl = 'https://kspbwdfbveouyflcqqmm.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcGJ3ZGZidmVvdXlmbGNxcW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MjA2MjcsImV4cCI6MjEwOTE5NjYyN30.EG9g8or21ROhi5mNsderWqpyaSB1WP4nP6vSJYTJV8U';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
