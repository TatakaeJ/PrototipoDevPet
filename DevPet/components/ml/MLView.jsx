import React from "react";
import { View, Alert } from "react-native";
import MLCamera from "./MLCamera";

/**
 * Componente MLView
 * Actúa como orquestador y contenedor de la funcionalidad de visión por computadora nativa,
 * administrando las bonificaciones y mutaciones tras una validación correcta.
 */
const MLView = ({ onDetected, saveBreak, addPoints }) => {
  
  /**
   * Manejador del resultado exitoso del pipeline de visión por computadora
   */
  const handlePosturaCorrecta = () => {
    Alert.alert(
      "Análisis de postura",
      "✔ ¡Estiramiento correcto detectado por la IA nativa!",
    ); 

    // Disparador del callback del módulo padre (para actualizar estados visuales de la interfaz)
    if (onDetected) onDetected(true);

    // Persistencia del registro de salud en el backend de Supabase
    if (saveBreak) {
      saveBreak({
        user_id: "demo-user", // TODO: Vincular dinámicamente con el UID de AuthContext
        completed_at: new Date().toISOString(),
      });
    }

    // Gamificación: Incremento de la puntuación para la evolución de la mascota virtual
    if (addPoints) {
      addPoints((prev) => prev + 5);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Inyección directa del módulo nativo optimizado con TensorFlow.js */}
      <MLCamera onDetected={handlePosturaCorrecta} />
    </View>
  );
};

export default MLView;