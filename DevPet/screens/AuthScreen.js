import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { styles } from '../styles/screensStyles/AuthScreen.styles';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de Autenticación.
 * Permite al usuario iniciar sesión o registrar una nueva cuenta.
 * 
 * @component
 */
export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // TODO: Implementar lógica de persistencia para el "Recuérdame" (ej. AsyncStorage)
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  // Extraemos 'loading' del contexto para mantener una única fuente de verdad
  const { login, register, loading } = useAuth();

  /**
   * Actualiza el estado del formulario dinámicamente.
   * 
   * @param {string} field - Nombre del campo a actualizar (ej. 'email', 'password').
   * @param {string} value - Nuevo valor ingresado por el usuario.
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Valida los campos del formulario antes de enviarlos al servidor.
   * Verifica campos vacíos, formato de correo y longitud de contraseñas.
   * 
   * @returns {boolean} True si el formulario es válido, False si hay errores.
   */
  const validateForm = () => {
    const { user_name, email, password, confirm_password } = formData;

    if (isLogin) {
      if (!user_name || !password) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return false;
      }
    } else {
      if (!user_name || !email || !password || !confirm_password) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return false;
      }
      
      // Validación de formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
        return false;
      }

      if (password !== confirm_password) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return false;
      }
      
      if (password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }
    return true;
  };

  /**
   * Ejecuta el flujo de autenticación (Login o Registro) si el formulario es válido.
   */
  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(formData.user_name.trim(), formData.password.trim());
        // Nota: Si el login es exitoso y el userId se actualiza en el contexto, 
        // la navegación suele desmontar esta pantalla automáticamente.
        Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente');
      } else {
        await register(
          formData.user_name.trim(),
          formData.email.trim(),
          formData.password.trim(),
          formData.confirm_password.trim()
        );
        Alert.alert('¡Cuenta creada!', 'Te has registrado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  /**
   * Manejador del botón principal para validar y enviar.
   */
  const handlePress = () => {
    if (validateForm()) {
      handleSubmit();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          {/* Renderizado condicional del Logo solo en Login */}
          {isLogin && (
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/petModel/HeadPet.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}

          <Text style={styles.title}>
            {isLogin ? 'Iniciar Sesión' : 'Crea tu cuenta'}
          </Text>

          <View style={styles.form}>
            {/* Campo: Usuario */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.user_name}
                onChangeText={(value) => handleInputChange('user_name', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo: Correo (Solo Registro) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Correo"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            )}

            {/* Campo: Contraseña */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Campo: Confirmar Contraseña (Solo Registro) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.confirm_password}
                  onChangeText={(value) => handleInputChange('confirm_password', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TODO: Implementar lógica de persistencia para el "Recuérdame" en futuras versiones 
            {!isLogin && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Recuérdame</Text>
              </TouchableOpacity>
            )}
            */}

            {/* Botón Principal (Login/Registro) */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handlePress}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            {/* TODO: Implementar proveedores OAuth (Facebook, Google, WhatsApp) en el futuro
            {!isLogin && (
              <View style={styles.socialLogin}>
                <Text style={styles.socialText}>O continúa con</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            */}

            {/* Botón para alternar vistas (Login <-> Registro) */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsLogin(!isLogin);
                // Limpia el formulario al cambiar de vista
                setFormData({
                  user_name: '',
                  email: '',
                  password: '',
                  confirm_password: '',
                });
              }}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? '¿No tienes una cuenta? Crear cuenta'
                  : '¿Ya tienes una cuenta? Iniciar sesión'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}