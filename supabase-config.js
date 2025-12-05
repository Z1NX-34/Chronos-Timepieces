// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = "https://mtndlylequqvhamciuus.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bmRseWxlcXVxdmhhbWNpdXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTU4NzcsImV4cCI6MjA3OTUzMTg3N30.x2PTamA4Omsfhb8idODiosg9vI-jdT0N_vW2kQAmcIo";

// Initialize Supabase client using the UMD bundle (more reliable cross-browser)
let supabase = null;

// Try ESM import first, fallback to global UMD
async function initSupabase() {
  try {
    // Try dynamic ESM import
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("ESM import failed, trying fallback:", e);
    // Fallback to global if UMD script is loaded
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
  return supabase;
}

// Create a promise that resolves when supabase is ready
const supabaseReady = initSupabase();

export { supabase, supabaseReady, SUPABASE_URL, SUPABASE_ANON_KEY };
