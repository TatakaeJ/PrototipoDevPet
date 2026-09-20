import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
} from "react-native";
import { styles } from "../../styles/habitsStyles/Breack.styles";
import { saveActiveBreakLog } from "../../src/services/habits.service"

// const { width } = Dimensions.get("window");

const Break = ({
  userId,
  addPoints,
  onSaved,
  onCycleComplete,
  initialMode,
}) => {
  // Configuración de tiempos
  const TIMES = {
    FOCUS: 5,
    BREAK: 5,
  };

  const [mode, setMode] = useState(initialMode || "FOCUS");
  const [time, setTime] = useState(
    initialMode === "BREAK" ? TIMES.BREAK : TIMES.FOCUS,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

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
            console.log(
              "Registro de pausa activa guardado en BD para:",
              userId,
            );

            Alert.alert(
              "¡Ciclo Completado!",
              "Tu pausa activa ha sido registrada exitosamente en tu historial.",
              [
                {
                  text: "Continuar",
                  onPress: () => {
                    setMode("FOCUS");
                    setTime(TIMES.FOCUS);
                    setIsRunning(true);
                    if (onSaved) onSaved();
                  },
                },
              ],
            );
          })
          .catch((err) => {
            console.error("Error crítico al guardar en BD:", err);
            Alert.alert(
              "Error de Conexión",
              "No se pudo sincronizar tu actividad con el servidor.",
            );
          });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time, mode, onCycleComplete, addPoints, onSaved, userId]);

  const handleCycleComplete = async () => {
    Vibration.vibrate([500, 500, 500]);

    if (mode === "FOCUS") {
      Alert.alert("¡Tiempo de enfoque terminado!", "Iniciando descanso.");
      setMode("BREAK");
      setTime(TIMES.BREAK);
      setIsRunning(true);
    } else {
      setMode("BREAK");
      setTime(TIMES.BREAK);
      setIsRunning(false);

      if (onSaved) onSaved();
    }
  };

  const handleStartPause = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setMode("FOCUS");
    setTime(TIMES.FOCUS);
    setMessage("");
  };

  const formatTime = () => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleFinish = () => {
    setIsRunning(false);
    onFinish();
  };

  // Colores dinámicos según el modo
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
