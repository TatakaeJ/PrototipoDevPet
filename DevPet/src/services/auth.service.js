import { supabase } from './supabase.config';
import { hashPassword } from '../utils/crypto';

/**
 * Verifica si un nombre de usuario o correo electrónico ya se encuentra registrado en la base de datos.
 * 
 * @param {string} user_name - El nombre de usuario a verificar.
 * @param {string} email - El correo electrónico a verificar.
 * @returns {Promise<boolean>} Retorna `true` si el usuario o email ya existe, `false` en caso contrario.
 * @throws {Error} Lanza un error si falla la consulta a Supabase.
 */
export const checkUserExists = async (user_name, email) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('user_id')
            .or(`user_name.eq.${user_name},email.eq.${email}`)
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error('Error verificando usuario:', error);
        throw error;
    }
};

/**
 * Registra un nuevo usuario en la base de datos con contraseña encriptada.
 * Inicializa los puntos totales del usuario en 0.
 * 
 * @param {string} user_name - Nombre de usuario único.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña en texto plano proporcionada por el usuario.
 * @returns {Promise<Object>} Retorna un objeto que contiene el `user_id` del nuevo usuario.
 * @throws {Error} Lanza un error si el usuario ya existe o si falla la inserción.
 */
export const registerUser = async (user_name, email, password) => {
    try {
        const exists = await checkUserExists(user_name, email);
        if (exists) {
            throw new Error('El usuario o email ya está registrado');
        }

        const password_hash = hashPassword(password);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                user_name,
                email,
                password_hash,
                total_points: 0
            }])
            .select('user_id')
            .single();

        if (error) throw error;

        console.log('Usuario registrado exitosamente:', data.user_id);
        return { user_id: data.user_id };
    } catch (error) {
        console.error('Error registrando usuario:', error);
        throw error;
    }
};

/**
 * Autentica a un usuario verificando sus credenciales contra la base de datos.
 * 
 * @param {string} user_name - Nombre de usuario.
 * @param {string} password - Contraseña en texto plano para verificar.
 * @returns {Promise<Object>} Retorna un objeto con el `user_id` si las credenciales son válidas.
 * @throws {Error} Lanza un error si el usuario no es encontrado o la contraseña es incorrecta.
 */
export const loginUser = async (user_name, password) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('user_id, password_hash')
            .eq('user_name', user_name)
            .single();

        if (error) {
            // PGRST116 es el código de Supabase cuando `.single()` no encuentra resultados
            if (error.code === 'PGRST116') {
                throw new Error('Usuario no encontrado');
            }
            console.error('Error en consulta de login:', error);
            throw error;
        }

        if (!data) {
            throw new Error('Usuario no encontrado');
        }

        const input_password_hash = hashPassword(password);
        
        const isMatch = input_password_hash === data.password_hash;
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        console.log('Login exitoso para usuario ID:', data.user_id);
        return { user_id: data.user_id };
    } catch (error) {
        console.error('Error en login:', error.message);
        throw error;
    }
};