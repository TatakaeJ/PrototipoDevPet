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

const { height: screenHeight } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = screenHeight * 0.85;

const ANIMATIONS = {
    slideDown: {
        initial: -screenHeight,
        exit: screenHeight,
    },
    slideUp: {
        initial: screenHeight,
        exit: screenHeight,
    },
    slideLeft: {
        initial: -screenHeight,
        exit: -screenHeight,
    },
}

export default function Sheet({ 
    visible, 
    onClose, 
    children, 
    sheetTop= 10, 
    animation = "slideDown" 
}) {
    const translateY = useRef(new Animated.Value(ANIMATIONS[animation].initial)).current;
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => { //Cambio N°1 NSX011
    const config = ANIMATIONS[animation] || ANIMATIONS.slideUp; 

    if (visible) {
        setModalVisible(true);

        translateY.setValue(config.initial);

        Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true, // cambio arreglé useEffect
        }).start();
    } else {
        Animated.timing(translateY, {
            toValue: config.exit,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
        });
    }
}, [visible, animation]);

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose} // Posible cambio null antes
            />
            <Animated.View
                style={[
                    styles.sheet, 
                    { 
                        top: sheetTop,
                        maxHeight: MAX_SHEET_HEIGHT,
                        transform: [{ translateY }] 
                    }]}
            >
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={20} color="#fff" strokeWidth={2}></X>
                </TouchableOpacity>
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