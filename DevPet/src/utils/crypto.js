import CryptoJS from 'crypto-js';

/**
 * Encripta una contraseña utilizando el algoritmo SHA256.
 * 
 * Nota Técnica: Para el alcance de este prototipo funcional se utiliza SHA256 
 * como método de hashing. En una fase de paso a producción, la arquitectura 
 * está pensada para delegar esto a Supabase Auth (bcrypt).
 * 
 * @param {string} password - La contraseña en texto plano que se desea encriptar.
 * @returns {string} El hash resultante en formato de cadena hexadecimal.
 * @throws {Error} Si el parámetro proporcionado está vacío o no es una cadena de texto.
 */
export const hashPassword = (password) => {
    // Validación de seguridad para evitar que la librería falle
    if (!password || typeof password !== 'string') {
        throw new Error('Se requiere una cadena de texto válida para encriptar.');
    }
    
    return CryptoJS.SHA256(password).toString();
};