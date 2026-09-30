import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURACIÓN DEL CLIENTE DE SUPABASE
 * 
 * Carga las variables de entorno públicas desde la configuración de Expo (.env)
 * e inicializa la instancia global de Supabase.
 */

// Lectura de la URL pública del proyecto
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// Lectura de la clave anónima (Anon Key) del cliente
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Verificación en consola para comprobar el inicio del servicio en desarrollo
console.log("URL leída:", supabaseUrl);

/**
 * Instancia exportada del cliente de Supabase para su uso en la capa de servicios.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);