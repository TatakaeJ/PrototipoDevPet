import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    Vibration,
} from "react-native";
import { styles } from "../../styles/habitsStyles/Breack.styles";
import { saveActiveBreakLog } from "../../src/services/habits.service";

/**
 * Componente que gestiona el temporizador de pausas activas (Método Pomodoro).
 * Divide el tiempo entre períodos de Enfoque (Focus) y Descanso (Break),
 * gatillando la verificación por visión artificial (Machine Learning) al culminar el enfoque.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.userId - Identificador único del usuario en la base de datos (Supabase).
 * @param {Function} [props.addPoints] - Función para otorgar puntos al perfil del usuario tras el éxito.
 * @param {Function} [props.onSaved] - Callback ejecutado tras persistir el registro en el historial de BD.
 * @param {Function} [props.onCycleComplete] - Callback que intercepta el fin del enfoque para abrir el módulo ML.
 * @param {string} [props.initialMode="FOCUS"] - Modo inicial con el que arranca el temporizador ("FOCUS" o "BREAK").
 * @returns {React.JSX.Element} Elemento JSX que renderiza la interfaz y cronómetro de la pausa activa.
 */
const Break = ({
    userId,
    addPoints,
    onSaved,
    onCycleComplete,
    initialMode = "FOCUS",
}) => {
    
    const TIMES = {
        FOCUS: 5,
        BREAK: 5,
    };

    const [mode, setMode] = useState(initialMode);
    const [time, setTime] = useState(initialMode === "BREAK" ? TIMES.BREAK : TIMES.FOCUS);
    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState("");

    /**
     * Efecto secundario encargado de controlar el ciclo de vida del cronómetro (Cuenta regresiva).
     * Administra las alertas del sistema, las vibraciones físicas y los flujos asíncronos con el backend.
     */
    useEffect(() => {
        let interval = null;

        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime((prev) => prev - 1);
            }, 1000);
        } else if (time === 0 && isRunning) {
            setIsRunning(false);
            Vibration.vibrate([0, 500, 200, 500]);

            if (mode === "FOCUS") {
                // Flujo al terminar el enfoque: Forzar validación de postura mediante IA
                Alert.alert(
                    "¡Enfoque Terminado!",
                    "Es hora de validar con la cámara para iniciar tu descanso.",
                    [
                        {
                            text: "Abrir Cámara",
                            onPress: () => {
                                if (onCycleComplete) onCycleComplete();
                                setMode("BREAK");
                                setTime(TIMES.BREAK);
                            },
                        },
                    ],
                );
            } else {
                saveActiveBreakLog(userId)
                    .then(() => {
                        console.log("Registro de pausa activa guardado en BD para:", userId);
                        
                        if (addPoints) addPoints(10); 

                        Alert.alert(
                            "¡Ciclo Completado!",
                            "Tu pausa activa ha sido registrada exitosamente en tu historial.",
                            [
                                {
                                    text: "Continuar",
                                    onPress: () => {
                                        setMode("FOCUS");
                                        setTime(TIMES.FOCUS);
                                        setIsRunning(true); // Reinicia automáticamente al siguiente ciclo de enfoque
                                        if (onSaved) onSaved();
                                    },
                                },
                            ],
                        );
                    })
                    .catch((err) => {
                        console.error("Error crítico al guardar en BD:", err);
                        Alert.alert(
                            "Error de Sincronización",
                            "No se pudo sincronizar tu actividad con el servidor. Verifica tu conexión.",
                        );
                    });
            }
        }

        return () => clearInterval(interval);
    }, [isRunning, time, mode, onCycleComplete, addPoints, onSaved, userId]);

    /**
     * Alterna de forma síncrona el estado de ejecución del temporizador (Play / Pause).
     */
    const handleStartPause = () => setIsRunning(!isRunning);

    /**
     * Resetea el ciclo completo del temporizador, devolviendo los estados a sus configuraciones de fábrica.
     */
    const handleReset = () => {
        setIsRunning(false);
        setMode("FOCUS");
        setTime(TIMES.FOCUS);
        setMessage("");
    };

    /**
     * Formatea los segundos restantes en un string legible bajo el estándar digital (MM:SS).
     * 
     * @returns {string} Tiempo formateado con ceros a la izquierda si aplica.
     */
    const formatTime = () => {
        const min = Math.floor(time / 60);
        const sec = time % 60;
        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    // Estilo adaptativo y dinámico según el contexto del usuario (Rojo para Enfoque, Azul para Descanso)
    const themeColor = mode === "FOCUS" ? "#EF4444" : "#3B82F6";

    return (
        <View style={styles.container}>
            <Text style={[styles.modeTitle, { color: themeColor }]}>
                {mode === "FOCUS" ? "MODO ENFOQUE" : "MODO DESCANSO"}
            </Text>
            
            <View style={[styles.timerCircle, { borderColor: themeColor }]}>
                <Text style={styles.timerText}>{formatTime()}</Text>
                <Text style={styles.statusText}>
                    {isRunning ? "EJECUTANDO" : "PAUSADO"}
                </Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[
                        styles.mainButton,
                        { backgroundColor: isRunning ? "#64748B" : themeColor },
                    ]}
                    onPress={handleStartPause}
                >
                    <Text style={styles.buttonText}>
                        {isRunning ? "Pausar" : "Iniciar"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetText}>Reiniciar Ciclo</Text>
                </TouchableOpacity>
            </View>

            {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
    );
};

export default Break;