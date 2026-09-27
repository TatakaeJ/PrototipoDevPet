import React, { createContext, useState, useContext } from 'react';
import { registerUser, loginUser } from '../src/services/auth.service';

/**
 * @context AuthContext
 * Contexto global para manejar el estado de autenticación y la sesión del usuario.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  
  // Se cambia el valor inicial a 'false'. Al no tener persistencia local 
  // (como AsyncStorage) inicializar en 'true' puede causar pantallas de carga infinitas.
  const [loading, setLoading] = useState(false);

  /**
   * Registra un nuevo usuario validando los campos y la coincidencia de contraseñas.
   * 
   * @param {string} user_name - Nombre de usuario único.
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña en texto plano.
   * @param {string} confirm_password - Confirmación de la contraseña.
   * @returns {Promise<Object>} Objeto con el user_id generado.
   * @throws {Error} Si los campos están incompletos o las contraseñas no coinciden.
   */
  const register = async (user_name, email, password, confirm_password) => {
    if (!user_name || !email || !password) {
      throw new Error('Todos los campos son obligatorios');
    }

    if (password !== confirm_password) {
      throw new Error('Las contraseñas no coinciden');
    }

    setLoading(true);
    try {
      const result = await registerUser(user_name, email, password);
      setUserId(result.user_id);
      return result;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Autentica a un usuario existente en la plataforma.
   * 
   * @param {string} user_name - Nombre de usuario.
   * @param {string} password - Contraseña en texto plano.
   * @returns {Promise<Object>} Objeto con el user_id si las credenciales son correctas.
   * @throws {Error} Si los campos están vacíos o las credenciales son inválidas.
   */
  const login = async (user_name, password) => {
    if (!user_name || !password) {
      throw new Error('Todos los campos son obligatorios');
    }

    setLoading(true);
    try {
      const result = await loginUser(user_name, password);
      setUserId(result.user_id);
      return result;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión activa limpiando el ID del usuario.
   */
  const logout = () => {
    setUserId(null);
  };

  const value = {
    userId,
    loading,
    setLoading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para acceder fácilmente al contexto de autenticación.
 * 
 * @returns {Object} Valores y funciones del contexto (userId, login, register, etc.)
 * @throws {Error} Si se usa fuera del componente AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};