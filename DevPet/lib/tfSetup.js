import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

/**
 * Inicializa el entorno de TensorFlow.js en el celular.
 * Garantiza que el backend de cómputo esté listo antes de cargar modelos o procesar tensores.
 */
export const initTF = async () => {
  try {
    // Espera a que el puente entre el código nativo (React Native) y el motor de TFJS se complete
    await tf.ready();
    console.log("[TFJS] Entorno inicializado correctamente. Backend activo:", tf.getBackend());
  } catch (error) {
    console.error("[TFJS] Error durante la inicialización del entorno:", error);
  }
};
