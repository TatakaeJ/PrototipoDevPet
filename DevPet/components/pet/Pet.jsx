import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Image } from 'react-native';
import { styles } from '../../styles/petStyles/Pet.styles'
import PetParticles from './PetParticles';
import { usePetState } from '../../src/hooks/usePetState';

const OptimizedParticles = React.memo(PetParticles);

const Pet = forwardRef(({ userId }, ref) => {
    // Llamamos a nuestro Hook y extraemos los estados finales
    const { baseMood, isSleepy, isThirsty, refreshPetState } = usePetState(userId);
    const [petArea, setPetArea] = useState({ width: 0, height: 0 });

    // Exponemos la función refresh al padre (HomeScreen)
    useImperativeHandle(ref, () => ({ refreshPetState }));

    // Calculamos qué partículas mostrar según el estado que nos dio el hook
    const getParticleStates = () => {
        if (isSleepy) return ['sleepy'];
        const states = [baseMood];
        if (isThirsty) states.push('thirsty');
        return states;
    };

    const handlePetLayout = useCallback((e) =>
        setPetArea({
            width:  e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        }), []);

    return (
        <>
            <View style={styles.petBox}>
                <Image
                    source={require('../../assets/petStates/DevPet_neutral.png')}
                    style={styles.petImage}
                    onLayout={handlePetLayout}
                />
            </View>

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

Pet.displayName = 'Pet';

export default Pet;