import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Image } from 'react-native';
import { styles } from '../../styles/petStyles/Pet.styles';
import PetParticles from './PetParticles';
import { usePetState } from '../../src/hooks/usePetState';

// Memorizamos el componente de partículas para evitar re-renderizados innecesarios
const OptimizedParticles = React.memo(PetParticles);

/**
 * Componente principal de la Mascota Virtual (DevPet).
 * Se encarga de renderizar la imagen base del gato y superponer las partículas (emojis)
 * correspondientes a su estado de ánimo, hidratación y sueño.
 * 
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {string|number} props.userId - Identificador del usuario para consultar sus hábitos.
 * @param {React.Ref} ref - Referencia expuesta al padre para forzar la actualización del estado.
 */
const Pet = forwardRef(({ userId }, ref) => {
    // Delegamos toda la lógica compleja de cálculo de estados al custom hook
    const { baseMood, isSleepy, isThirsty, refreshPetState } = usePetState(userId);
    
    // Estado local para capturar el tamaño dinámico de la imagen renderizada
    const [petArea, setPetArea] = useState({ width: 0, height: 0 });

    // Exponemos la función refresh al componente padre (HomeScreen)
    useImperativeHandle(ref, () => ({ 
        refreshPetState 
    }), [refreshPetState]);

    /**
     * Determina qué conjunto de partículas (emojis) deben mostrarse.
     * Le da prioridad absoluta al estado 'sleepy' si el gato está dormido.
     * 
     * @returns {string[]} Arreglo con los estados activos a renderizar.
     */
    const getParticleStates = () => {
        if (isSleepy) return ['sleepy'];
        const states = [baseMood];
        if (isThirsty) states.push('thirsty');
        return states;
    };

    /**
     * Captura las dimensiones exactas de la imagen una vez que se dibuja en pantalla.
     * Esto asegura que las partículas floten exactamente sobre el cuerpo del gato.
     */
    const handlePetLayout = useCallback((e) => {
        setPetArea({
            width:  e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        });
    }, []);

    return (
        <>
            <View style={styles.petBox}>
                {/* 
                  Nota: La imagen base siempre es neutral. Las expresiones faciales 
                  y estados (triste, feliz, sediento) se manejan vía PetParticles. 
                */}
                <Image
                    source={require('../../assets/petStates/DevPet_neutral.png')}
                    style={styles.petImage}
                    onLayout={handlePetLayout}
                />
            </View>

            {/* Solo renderizamos las partículas si ya conocemos el tamaño exacto del gato */}
            {petArea.width > 0 && (
                <OptimizedParticles
                    petStates={getParticleStates()}
                    petAreaWidth={petArea.width}
                    petAreaHeight={petArea.height}
                />
            )}
        </>
    );
});

// Asignamos el displayName para facilitar la depuración en React DevTools
Pet.displayName = 'Pet';

export default Pet;