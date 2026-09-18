import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://shjdaneajcmwbjszdibx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoamRhbmVhamNtd2Jqc3pkaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTQ3MjcsImV4cCI6MjA5MTg3MDcyN30.TdCQMZmNrPyQPyjQqs5AQofPRHffQQk-Qsmvk30XXNk';

// Exportamos el cliente para usarlo en los demás servicios
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);