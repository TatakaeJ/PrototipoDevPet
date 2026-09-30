import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

// URL de respaldo en la nube (Asegúrate de que apunte directamente al model.json completo si la vas a usar)
const CLOUD_URL = "https://withgoogle.com/model.json"; 

/**
 * Carga el modelo de Machine Learning en memoria utilizando el motor de TFJS.
 * Implementa una estrategia híbrida (Local priorizado -> Nube como respaldo).
 *
 * @returns {Promise<tf.LayersModel>} Instancia del modelo cargado de TensorFlow.js
 */
export const loadModel = async () => {
  try {
    await tf.ready();
    console.log("Inicializando motor TensorFlow.js...");

    // 1. INTENTO DE CARGA LOCAL
    try {
      // Nota: Verifica que la ruta relativa hacia assets desde este archivo sea exacta
      const modelJson = require('../assets/Model/model.json');
      const modelWeights = require('../assets/Model/weights.bin');
      
      const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      console.log("✅ MODELO CARGADO EXITOSAMENTE DESDE ALMACENAMIENTO LOCAL");
      return model;
      
    } catch (localError) {
      console.warn("⚠️ Falló la carga local, intentando desde la nube...", localError.message);
      
      // 2. CONFIGURACIÓN DE RESPALDO (NUBE)
      const model = await tf.loadLayersModel(CLOUD_URL);
      console.log("✅ MODELO CARGADO DESDE LA NUBE");
      return model;
    }

  } catch (error) {
    console.error("❌ ERROR CRÍTICO: No se pudo cargar el modelo en ningún entorno:", error);
    // Relanzamos el error para que el componente visual (Cámara) lo capture en su propio try/catch
    throw error;
  }
};