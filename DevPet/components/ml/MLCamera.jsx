import React, { useRef, useState, useEffect } from "react";
import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import { styles } from "../../styles/mlStyles/MLCamera.styles";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import { loadModel } from "../../lib/loadModel";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Propiedades para el componente MLCamera.
 * @typedef {Object} MLCameraProps
 * @property {Function} onDetected - Callback que se ejecuta cuando el modelo de IA detecta una postura correcta con éxito.
 */

/**
 * Componente MLCamera.
 * Se encarga de la captura de imágenes en tiempo real mediante la cámara frontal
 * y ejecuta la inferencia de Machine Learning local utilizando TensorFlow.js para la validación de posturas.
 *
 * @param {MLCameraProps} props - Propiedades del componente.
 * @returns {JSX.Element} Vista con la cámara activa y controles de procesamiento de IA.
 */
const MLCamera = ({ onDetected }) => {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("idle"); // Estados: "idle" | "processing" | "success" | "error"
  const [model, setModel] = useState(null);
  const [modelError, setModelError] = useState(false);

  /**
   * Gestiona de forma asíncrona los permisos de acceso a la cámara del dispositivo.
   */
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  /**
   * Inicializa y carga en memoria el modelo de grafos de TensorFlow.js.
   */
  useEffect(() => {
    let isMounted = true;

    const initModel = async () => {
      try {
        setModelError(false);
        const loadedModel = await loadModel();
        
        if (isMounted && loadedModel) {
          console.log("[IA] Modelo cargado exitosamente en el componente.");
          setModel(loadedModel);
        }
      } catch (error) {
        if (isMounted) {
          console.error("[IA - Error]: Falló la inicialización del modelo nativo:", error);
          setModelError(true);
        }
      }
    };

    initModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // Renderizado condicional mientras se consulta el estado de permisos
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Renderizado condicional si los permisos fueron denegados
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10, textAlign: "center" }}>
          Se requieren permisos de cámara para la validación de postura.
        </Text>
        <Button title="Conceder Permisos" onPress={requestPermission} />
      </View>
    );
  }

  /**
   * Pipeline de Inferencia de Redes Neuronales.
   * Convierte la imagen JPEG en un tensor tridimensional, aplica preprocesamiento
   * (normalización [0, 1] y expansión de dimensiones) y evalúa la probabilidad del modelo.
   *
   * @param {Object} photo - Objeto resultante del procesamiento de la imagen.
   * @param {string} photo.base64 - Cadena en formato Base64 con el contenido binario JPEG.
   */
  const runPrediction = async (photo) => {
    try {
      setStatus("processing");

      // Optimización de memoria GPU/JS mediante tf.tidy
      const isCorrect = tf.tidy(() => {
        // 1. Decodificación Base64 a Buffer binario Uint8Array
        const imgBuffer = tf.util.encodeString(photo.base64, "base64").buffer;
        const rawImageData = new Uint8Array(imgBuffer);

        // 2. Transformación a Tensor 3D (Alto, Ancho, Canales RGB)
        const imageTensor = decodeJpeg(rawImageData, 3);

        // 3. Preprocesamiento: Expansión de batch y normalización [0, 1]
        const normalizedTensor = imageTensor.expandDims(0).toFloat().div(255);

        // 4. Inferencia feedforward
        const prediction = model.predict(normalizedTensor);
        
        // Extracción de probabilidades
        const scores = prediction.dataSync();
        console.log("[IA - Scores]:", scores);

        // 5. Evaluación por argmax (asume clase 1 = Postura Correcta con umbral > 70%)
        const maxScoreIndex = scores.indexOf(Math.max(...scores));

        return maxScoreIndex === 1 && scores[1] > 0.7;
      });

      if (isCorrect) {
        setStatus("success");
        setTimeout(() => {
          if (onDetected) onDetected();
        }, 800);
      } else {
        setStatus("error");
        Alert.alert("Postura Incorrecta", "Por favor, endereza tu espalda para validar el estiramiento.");
      }
    } catch (error) {
      console.error("[IA - Pipeline Error]:", error);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Captura y optimiza la imagen a 224x224 px antes de enviarla a la red neuronal.
   */
  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing || !model) return;

    try {
      setIsProcessing(true);
      
      // Captura inicial rápida en baja calidad
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.1 });

      // Redimensión a 224x224 píxeles (resolución de entrada MobileNet / Teachable Machine)
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 224, height: 224 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG }
      );

      await runPrediction(manipulated);
    } catch (error) {
      console.error("[Captura Error]:", error);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      
      <View style={styles.overlay}>
        <Text style={styles.text}>Valida tu estiramiento</Text>
        
        <View style={{ width: "100%", marginBottom: 10 }}>
          {model ? (
            <Button
              title={isProcessing ? "Analizando..." : "Validar Postura"}
              onPress={handleCapture}
              disabled={isProcessing}
              color="#2196F3"
            />
          ) : modelError ? (
            <Button
              title="Error de IA (Reintentar)"
              onPress={() => setModelError(false)}
              color="#ff4444"
            />
          ) : (
            <ActivityIndicator size="small" color="#ffffff" />
          )}
        </View>

        {/* Feedback visual interactivo según el estado de la inferencia */}
        {!model && !modelError && (
          <Text style={styles.feedbackText}>Iniciando motor de IA local...</Text>
        )}
        {modelError && (
          <Text style={[styles.feedbackText, { color: "#ff4444" }]}>
            No se pudo cargar el modelo de IA.
          </Text>
        )}
        {status === "processing" && (
          <Text style={styles.feedbackText}>Analizando tensores con IA...</Text>
        )}
        {status === "success" && (
          <Text style={[styles.feedbackText, { color: "#00C851", fontWeight: "bold" }]}>
            ¡Postura Correcta!
          </Text>
        )}
        {status === "error" && (
          <Text style={[styles.feedbackText, { color: "#ff4444", fontWeight: "bold" }]}>
            Postura incorrecta. Intenta de nuevo.
          </Text>
        )}
      </View>
    </View>
  );
};

export default MLCamera;