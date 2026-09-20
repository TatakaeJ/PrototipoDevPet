import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../../styles/habitsStyles/Sleep.styles';
import { saveSleepLog, getDayHabits } from "../../src/services/habits.service";
import { BrainCog } from "lucide-react-native";

const Sleep = ({ userId, addPoints, onSaved }) => {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [hasSleepRecord, setHasSleepRecord] = useState(false);
  const [sleepRecord, setSleepRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si ya existe registro de sueño hoy
  useEffect(() => {
    checkSleepRecord();
  }, [userId]);

  const checkSleepRecord = async () => {
    try {
      const dayHabits = await getDayHabits(userId);
      const sleepLog = dayHabits.find(log => log.healthy_habits?.type === 'sleep');
      
      if (sleepLog) {
        setHasSleepRecord(true);
        setSleepRecord(sleepLog);
      }
    } catch (error) {
      console.error('Error verificando registro de sueño:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSleepHours = () => {
    if (!sleepTime || !wakeTime) return 0

    const [hSleep, mSleep] = sleepTime.split(':').map(Number)
    const [hWake, mWake] = wakeTime.split(':').map(Number)

    const sleepDate = new Date(2000, 0, 1, hSleep, mSleep)
    const wakeDate = new Date(2000, 0, 1, hWake, mWake)

    let diff = (wakeDate - sleepDate) / (1000 * 60 * 60)
    if (diff < 0) diff += 24

    return diff.toFixed(1)
  }

  const handleSave = async () => {
  const hours = Number(calculateSleepHours());

  if (hours <= 0) {
    return Alert.alert("Aviso", "Ingresa horas válidas (Ej: 22:00)");
  }

  try {
    await saveSleepLog(hours, userId);
    // Los puntos se asignan automáticamente por el trigger trg_add_points_on_log
    Alert.alert("¡Buen descanso!", "Horas de sueño guardadas.");
    
    // Actualizar estado para mostrar mensaje de completado
    await checkSleepRecord();
    
    onSaved();

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.loadingText}>Verificando registros...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {hasSleepRecord ? (
          // Mensaje motivacional si ya se registró sueño hoy
          <View style={styles.completedContainer}>
            <Text style={styles.icon}>😴</Text>
            <Text style={styles.completedTitle}>¡Excelente descanso!</Text>
            <Text style={styles.completedMessage}>
              Ya has registrado tu sueño de hoy: {sleepRecord?.value || 0} horas
            </Text>
            <Text style={styles.completedSubMessage}>
              {"\n"}Un buen descanso es fundamental para tu salud y productividad.
              {"\n"}Sigue manteniendo tus hábitos de sueño saludables.
            </Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Consejo del día</Text>
              <Text style={styles.tipText}>
                Puedes verificar todos tus registros del día en el icono del cerebro <BrainCog size={20} color="#0C4A6E"/> en la pantalla principal.
              </Text>
            </View>
          </View>
        ) : (
          // Formulario normal si no se ha registrado sueño hoy
          <>
            <Text style={styles.icon}>😴</Text>
            <Text style={styles.title}>¿Cuánto dormiste?</Text>
            
            <TextInput 
              placeholder="Dormir (22:00)" 
              style={styles.input} 
              onChangeText={setSleepTime} 
              keyboardType="numbers-and-punctuation" 
            />
            <TextInput 
              placeholder="Despertar (06:00)" 
              style={styles.input} 
              onChangeText={setWakeTime} 
              keyboardType="numbers-and-punctuation" 
            />
            
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total calculado:</Text>
              <Text style={styles.resultText}>{calculateSleepHours()} hrs</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar sueño</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default Sleep;
