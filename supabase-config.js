// Supabase Configuration
// Uses UMD bundle for maximum compatibility

const SUPABASE_URL = 'https://mtndlylequqvhamciuus.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bmRseWxlcXVxdmhhbWNpdXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTU4NzcsImV4cCI6MjA3OTUzMTg3N30.x2PTamA4Omsfhb8idODiosg9vI-jdT0N_vW2kQAmcIo'

// Load Supabase UMD bundle
function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.supabase) {
            resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.async = true;
        
        script.onload = () => {
            if (window.supabase) {
                resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
            } else {
                reject(new Error('Supabase failed to load'));
            }
        };
        
        script.onerror = () => reject(new Error('Failed to load Supabase script'));
        
        document.head.appendChild(script);
    });
}

// Create a promise that resolves when supabase is ready
const supabaseReady = loadSupabaseScript();

// Also export for potential direct use
let supabase = null;
supabaseReady.then(client => {
    supabase = client;
}).catch(err => {
    console.error('Supabase initialization error:', err);
});

export { supabase, supabaseReady, SUPABASE_URL, SUPABASE_ANON_KEY };
