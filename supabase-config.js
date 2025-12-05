// Supabase Configuration
// The Supabase client is initialized in the HTML head via UMD script
// This file just exports the global reference for ES modules

const SUPABASE_URL = window.SUPABASE_URL || 'https://mtndlylequqvhamciuus.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bmRseWxlcXVxdmhhbWNpdXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTU4NzcsImV4cCI6MjA3OTUzMTg3N30.x2PTamA4Omsfhb8idODiosg9vI-jdT0N_vW2kQAmcIo';

// Get the supabase client from the global window object (set by UMD script in HTML)
const supabase = window.supabaseClient;

// For backward compatibility, also create a ready promise
const supabaseReady = Promise.resolve(supabase);

export { supabase, supabaseReady, SUPABASE_URL, SUPABASE_ANON_KEY };
