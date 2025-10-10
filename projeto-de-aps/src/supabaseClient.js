import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcuchztitjbyakpkckdq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdWNoenRpdGpieWFrcGtja2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODk1OTUsImV4cCI6MjA3NTA2NTU5NX0.mFm8eEPGjRc9HcEqScMnCNwmsuXK4VEBnKiF8eiqQyc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);