import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Animated,
    TouchableOpacity,
    Dimensions,
    ScrollView
} from 'react-native';
import { styles } from '../styles/Sheet.style';
import { X } from "lucide-react-native";

// Capturamos el tamaño de la pantalla para calcular los límites de la animación
const { height: screenHeight } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = screenHeight * 0.85;

// Diccionario de configuraciones para las animaciones verticales
const ANIMATIONS = {
    slideDown: {
        initial: -screenHeight, // Entra desde arriba
        exit: screenHeight,     // Sale hacia abajo
    },
    slideUp: {
        initial: screenHeight,  // Entra desde abajo
        exit: screenHeight,     // Sale hacia abajo
    },
};

/**
 * Componente Contenedor Genérico (Bottom/Top Sheet).
 * Un modal personalizable con animaciones fluidas y soporte para scroll interno.
 * Utilizado a lo largo de la app para mostrar los registros de hábitos y tareas.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.visible - Controla si el modal se muestra en pantalla.
 * @param {Function} props.onClose - Callback ejecutado al tocar el fondo oscuro o la 'X'.
 * @param {React.ReactNode} props.children - Contenido interno del modal.
 * @param {number} props.sheetTop - Margen superior del modal.
 * @param {string} props.animation - Tipo de animación ('slideDown' o 'slideUp').
 */
export default function Sheet({ 
    visible, 
    onClose, 
    children, 
    sheetTop = 10, 
    animation = "slideDown" 
}) {
    // Referencia persistente para la posición vertical del modal
    const translateY = useRef(new Animated.Value(ANIMATIONS[animation]?.initial || screenHeight)).current;
    
    // Estado interno que controla el montaje real del componente Modal
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const config = ANIMATIONS[animation] || ANIMATIONS.slideUp; 

        if (visible) {
            // 1. Primero montamos el modal
            setModalVisible(true);
            
            // 2. Colocamos el modal fuera de la pantalla
            translateY.setValue(config.initial);

            // 3. Lo animamos hacia su posición original (0) con un ligero rebote
            Animated.spring(translateY, {
                toValue: 0,
                bounciness: 4,
                useNativeDriver: true,
            }).start();
            
        } else {
            // 1. Animamos la salida del modal hacia afuera de la pantalla
            Animated.timing(translateY, {
                toValue: config.exit,
                duration: 250,
                useNativeDriver: true,
            }).start(({ finished }) => {
                // 2. Solo desmontamos el modal si la animación terminó correctamente
                if (finished) {
                    setModalVisible(false);
                }
            });
        }
    }, [visible, animation, translateY]);

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none" // Desactivamos la nativa para usar nuestra animación Custom
            onRequestClose={onClose}
        >
            {/* Fondo oscuro translúcido (Overlay). Tocarlo cierra el modal */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose} 
            />
            
            {/* Contenedor principal animado */}
            <Animated.View
                style={[
                    styles.sheet, 
                    { 
                        top: sheetTop,
                        maxHeight: MAX_SHEET_HEIGHT,
                        transform: [{ translateY }] 
                    }
                ]}
            >
                {/* Botón de cierre superior */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={20} color="#fff" strokeWidth={2} />
                </TouchableOpacity>

                {/* Contenido interno con scroll habilitado */}
                <ScrollView 
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                >
                    {children}
                </ScrollView>
            </Animated.View>
        </Modal>
    );
}