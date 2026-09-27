import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { styles } from '../../styles/petStyles/PetPerticles.styles';

/**
 * Diccionario de imágenes (emojis) asignadas a cada estado de la mascota.
 * Utiliza require() para pre-cargar los assets locales en el bundler.
 */
const EMOJI_SETS = {
  happy: [require('../../assets/petStates/happy.png')],
  sad: [require('../../assets/petStates/sad.png')],
  sleepy: [require('../../assets/petStates/sleepy.png')],
  neutral: [require('../../assets/petStates/neutral.png')],
  thirsty: [require('../../assets/petStates/thirsty.png')],
};

/**
 * Define la densidad (cantidad) de partículas simultáneas en pantalla según el estado.
 */
const PARTICLE_COUNT = {
  happy: 5,
  sad: 5,
  sleepy: 5,
  neutral: 5,
  thirsty: 5,
};

/**
 * Subcomponente que representa una única partícula animada.
 * Gestiona su propia física de movimiento (subida y deriva horizontal) y opacidad.
 * 
 * @param {Object} props
 * @param {number} props.emoji - Referencia al asset de la imagen (require).
 * @param {number} props.petAreaWidth - Ancho del área base de la mascota.
 * @param {number} props.petAreaHeight - Alto del área base de la mascota.
 * @param {number} props.delay - Retraso inicial para desfasar la animación de otras partículas.
 */
function Particle({ emoji, petAreaWidth, petAreaHeight, delay }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity    = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    
    // Ref para prevenir memory leaks si el componente se desmonta a mitad de animación
    const isMounted  = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const animate = () => {
            // Si el usuario cambió de pantalla, detenemos el bucle infinito
            if (!isMounted.current) return;

            // Posición inicial aleatoria dentro del área del gato
            const currentStartX = (Math.random() - 0.5) * petAreaWidth * 0.8;
            const currentStartY = -(Math.random() * 0.5 + 0.1) * petAreaHeight * 0.8;

            translateX.setValue(currentStartX);
            translateY.setValue(currentStartY);
            opacity.setValue(0);

            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    // Física 1: Elevación vertical (sube entre 80 y 140px)
                    Animated.timing(translateY, {
                        toValue: currentStartY - (80 + Math.random() * 60),
                        duration: 2200 + Math.random() * 800,
                        useNativeDriver: true,
                    }),
                    // Física 2: Deriva horizontal leve para dar efecto de flotación
                    Animated.timing(translateX, {
                        toValue: currentStartX + (Math.random() - 0.5) * 30,
                        duration: 2200 + Math.random() * 800,
                        useNativeDriver: true,
                    }),
                    // Física 3: Control de opacidad (Aparece rápido, se desvanece al final)
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.delay(1400),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(({ finished }) => {
                // Solo reinicia el bucle si la animación terminó naturalmente y sigue en pantalla
                if (finished && isMounted.current) {
                    animate(); 
                }
            });
        };

        animate();

        // Función de limpieza (cleanup) al desmontar el componente
        return () => {
            isMounted.current = false;
        };
    }, [delay, petAreaWidth, petAreaHeight, translateX, translateY, opacity]);

    return (
        <Animated.Image
            source={emoji}
            style={[
                styles.particle,
                {
                    opacity,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
}

/**
 * Componente Contenedor de Partículas.
 * Recibe los estados activos de la mascota y renderiza la cantidad correspondiente de emojis.
 * 
 * @component
 * @param {Object} props
 * @param {string|string[]} props.petStates - Estado(s) actual(es) de la mascota (ej. ['sleepy', 'thirsty']).
 * @param {number} props.petAreaWidth - Ancho del layout renderizado.
 * @param {number} props.petAreaHeight - Alto del layout renderizado.
 */
export default function PetParticles({ petStates, petAreaWidth, petAreaHeight }) {
    
    // Normalizamos la entrada para que siempre sea un array
    const states = Array.isArray(petStates) ? petStates : [petStates];
    
    const allParticles = [];
    let idCounter = 0;
    
    // Iteramos sobre los estados para generar el lote de partículas necesario
    states.forEach(state => {
        // Fallback seguro a neutral para evitar crashes con la etiqueta <Image>
        const emojis = EMOJI_SETS[state] || EMOJI_SETS.neutral;
        const count = PARTICLE_COUNT[state] || 3;
        
        for (let i = 0; i < count; i++) {
            allParticles.push({
                id: idCounter++,
                emoji: emojis[i % emojis.length],
                delay: (i / count) * 2000,
            });
        }
    });

    return (
        <View
            style={[styles.container, { width: petAreaWidth, height: petAreaHeight }]}
            pointerEvents="none" // Permite que los toques traspasen hacia el componente inferior
        >
            {allParticles.map(p => (
                <Particle
                    key={p.id}
                    emoji={p.emoji}
                    delay={p.delay}
                    petAreaWidth={petAreaWidth}
                    petAreaHeight={petAreaHeight}
                />
            ))}
        </View>
    );
}