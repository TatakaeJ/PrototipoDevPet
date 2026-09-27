import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { styles } from '../styles/screensStyles/LoadingScreen.styles';

/**
 * Pantalla de Carga (Loading Screen).
 * Muestra una animación pulsante del logo de DevPet mientras
 * la aplicación resuelve procesos en segundo plano (como validación de sesión).
 * 
 * @component
 */
export default function LoadingScreen() {
  // Se utiliza useRef para persistir el valor de la animación en la memoria 
  // y evitar que se reinicie si el componente se vuelve a renderizar.
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Creamos el ciclo infinito de pulsación (crece y se encoge)
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true, // Usa el driver nativo para mejor rendimiento
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    // Limpieza: detiene la animación cuando el usuario sale de esta pantalla
    return () => pulse.stop();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../assets/petModel/HeadPet.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.title}>DevPet</Text>
      <Text style={styles.subtitle}>Cargando tu mascota...</Text>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </View>
  );
}