// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = 'https://mtndlylequqvhamciuus.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bmRseWxlcXVxdmhhbWNpdXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTU4NzcsImV4cCI6MjA3OTUzMTg3N30.x2PTamA4Omsfhb8idODiosg9vI-jdT0N_vW2kQAmcIo'

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
