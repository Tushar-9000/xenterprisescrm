// Untyped Supabase client for CRM tables that aren't in the auto-generated types yet
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vvwkehbwxeolneugichw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d2tlaGJ3eGVvbG5ldWdpY2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTM3ODUsImV4cCI6MjA4NzI2OTc4NX0.Nf18BCYLuCp5ZBsKO3PQjTczV2jHPmVu0mCsxpLh_EQ";

// This client skips strict typing so we can use tables created via migrations
// before the types file is regenerated
export const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
