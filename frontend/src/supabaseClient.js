import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjboqmhisjywyssturda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqYm9xbWhpc2p5d3lzc3R1cmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjc2ODgsImV4cCI6MjA5ODgwMzY4OH0.NKw_95tP176GfiQ0JWrnr-RSxxNe-cSEi8sBN2a6IK0';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});