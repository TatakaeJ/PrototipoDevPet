import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styles } from "../../styles/mlStyles/MLCamera.styles";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
// import * as FileSystem from "expo-file-system/legacy";
import { loadModel } from "../../lib/loadModel";
import * as ImageManipulator from "expo-image-manipulator";

const MLCamera = ({ onDetected }) => {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("idle");
  const [model, setModel] = useState(null);

  useEffect(() => {
    const initModel = async () => {
      const loadedModel = await loadModel();
      if (loadedModel) {
        console.log("Cerebro recibido en el componente");
        setModel(loadedModel);
      }
    };
    initModel();
  }, []);

  if (!permission)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Solicitando permiso...</Text>
      </View>
    );
  }

  const runPrediction = async (photo) => {
    try {
      setStatus("processing");

      const imgBuffer = tf.util.encodeString(photo.base64, "base64").buffer;
      const rawImageData = new Uint8Array(imgBuffer);

      let imageTensor = decodeJpeg(rawImageData, 3);
      const normalizedTensor = imageTensor.expandDims(0).toFloat(0).div(255);

      const prediction = await model.predict(normalizedTensor);
      const scores = await prediction.data();
      const maxScoreIndex = scores.indexOf(Math.max(...scores));

      console.log("Scores del modelo:", scores);
      const isCorrect = maxScoreIndex === 1 && scores[1] > 0.7;

      tf.dispose([imageTensor, normalizedTensor, prediction]);

      if (isCorrect) {
        setStatus("success");
        setTimeout(() => onDetected(), 800);
      } else {
        setStatus("error");
        Alert.alert("Postura Incorrecta", "Enderézate un poco.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing || !model) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.1 });

      // Recorte agresivo
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 224, height: 224 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG },
      );

      await runPrediction(manipulated);
    } catch (error) {
      console.error(error);
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
          ) : (
            <ActivityIndicator size="small" color="#ffffff" />
          )}
        </View>

        {/* Feedback visual según el estado del modelo y la predicción */}
        {!model && (
          <Text style={styles.feedbackText}>⚙️ Iniciando motor de IA...</Text>
        )}

        {status === "processing" && (
          <Text style={styles.feedbackText}>🔍 Analizando con IA...</Text>
        )}

        {status === "success" && (
          <Text style={[styles.feedbackText, { color: "#00C851" }]}>
            ✅ ¡Postura Correcta!
          </Text>
        )}

        {status === "error" && (
          <Text style={[styles.feedbackText, { color: "#ff4444" }]}>
            ❌ Intenta de nuevo
          </Text>
        )}
      </View>
    </View>
  );
};

export default MLCamera;
