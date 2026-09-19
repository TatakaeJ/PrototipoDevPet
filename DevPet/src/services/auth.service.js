import { supabase } from './supabase.config';
import { hashPassword } from '../utils/crypto';

// Verificar si usuario o email ya existe
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

// Registrar nuevo usuario
export const registerUser = async (user_name, email, password) => {
    try {
        const exists = await checkUserExists(user_name, email);
        if (exists) {
            throw new Error('El usuario o email ya está registrado');
        }

        // Usamos nuestra nueva función de utilidad
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

// Iniciar sesión
export const loginUser = async (user_name, password) => {
    try {
        console.log('Intentando login para user_name:', user_name);
        
        const { data, error } = await supabase
            .from('users')
            .select('user_id, password_hash')
            .eq('user_name', user_name)
            .single();

        if (error) {
            console.error('Error en consulta:', error);
            if (error.code === 'PGRST116') {
                throw new Error('Usuario no encontrado');
            }
            throw error;
        }

        if (!data) {
            throw new Error('Usuario no encontrado');
        }

        // Comparamos usando la función de utilidad
        const input_password_hash = hashPassword(password);
        console.log('Hash de password ingresado:', input_password_hash);
        console.log('Hash en DB:', data.password_hash);
        
        const isMatch = input_password_hash === data.password_hash;
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        console.log('Login exitoso:', data.user_id);
        return { user_id: data.user_id };
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};