import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Ponemos esto para ver qué está leyendo tu app
console.log("URL leída:", supabaseUrl);

// Exportamos el cliente para usarlo en los demás servicios
export const supabase = createClient(supabaseUrl, supabaseAnonKey);