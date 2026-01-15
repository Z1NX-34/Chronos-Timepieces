// Supabase Configuration
// IMPORTANT: Copy this file to supabase-config.js and replace with your actual credentials
// Get these from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
