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

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const { login, register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.user_name.trim(), formData.password.trim());
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
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (isLogin) {
      if (!formData.user_name || !formData.password) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return false;
      }
    } else {
      if (!formData.user_name || !formData.email || !formData.password || !formData.confirm_password) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return false;
      }
      if (formData.password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }
    return true;
  };

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
          {/* Logo */}
          {isLogin && (
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/petModel/HeadPet.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>
            {isLogin ? 'Iniciar Sesión' : 'Crea tu cuenta'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* User Name */}
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

            {/* Email (solo registro) */}
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

            {/* Password */}
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

            {/* Confirm Password (solo registro) */}
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

            {/* Remember Me (solo registro) */}
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

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handlePress}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            {/* Social Login (solo registro) */}
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

            {/* Toggle Login/Register */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsLogin(!isLogin);
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
