// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xutglrntdwntuecjvutl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dGdscm50ZHdudHVlY2p2dXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDEyNDQsImV4cCI6MjA3ODY3NzI0NH0.iw6zjTQnMlyWABROcpJBigskjv7lZmmxvUr_iQuSAm8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)