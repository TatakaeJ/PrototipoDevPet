/**
 * Centraliza el formateo de fechas y horas locales para sincronización
 * uniforme con las columnas 'DATE' y 'TIME' en Supabase.
 */

/**
 * Obtiene la fecha actual del dispositivo en formato ISO estándar
 * 
 * @returns {string} Fecha formateada como 'YYYY-MM-DD'.
 */
export const getLocalDate = () => {
    return new Date().toLocaleDateString('en-CA');
};

/**
 * Obtiene la hora actual del dispositivo en formato de 24 horas
 * 
 * @param {boolean} [includeSeconds=false] - Si es true, incluye los segundos en el string retornado.
 * @returns {string} Hora formateada en 24h
 */
export const getLocalTime = (includeSeconds = false) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    if (includeSeconds) {
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
};