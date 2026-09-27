import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../../styles/habitsStyles/Sleep.styles';
import { saveSleepLog, getDayHabits } from "../../src/services/habits.service";
import { BrainCog } from "lucide-react-native";

/**
 * Componente modal para el registro de horas de sueño.
 * Calcula automáticamente las horas dormidas basado en la hora de inicio y fin.
 * Previene registros múltiples mostrando un mensaje de felicitación si ya se registró el hábito hoy.
 * 
 * @component
 * @param {Object} props
 * @param {string|number} props.userId - ID del usuario actual.
 * @param {Function} props.onSaved - Callback ejecutado tras guardar exitosamente.
 */
const Sleep = ({ userId, onSaved }) => {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  
  const [hasSleepRecord, setHasSleepRecord] = useState(false);
  const [sleepRecord, setSleepRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Consulta la base de datos para verificar si el usuario ya registró 
   * su sueño en el día actual (limitado a 1 por día).
   */
  const checkSleepRecord = useCallback(async () => {
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
  }, [userId]);

  // Se ejecuta una sola vez al abrir el modal
  useEffect(() => {
    checkSleepRecord();
  }, [checkSleepRecord]);

  /**
   * Calcula las horas de diferencia entre la hora de dormir y despertar.
   * Utiliza useMemo para no recalcular a menos que los textos cambien.
   * Incluye protección Regex para evitar crashes si el usuario tipea letras.
   */
  const calculatedHours = useMemo(() => {
    if (!sleepTime || !wakeTime) return "0.0";

    // Regex simple para validar formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(sleepTime) || !timeRegex.test(wakeTime)) {
        return "0.0"; // Retorna 0 seguro si el formato es inválido
    }

    const [hSleep, mSleep] = sleepTime.split(':').map(Number);
    const [hWake, mWake] = wakeTime.split(':').map(Number);

    const sleepDate = new Date(2000, 0, 1, hSleep, mSleep);
    const wakeDate = new Date(2000, 0, 1, hWake, mWake);

    let diff = (wakeDate - sleepDate) / (1000 * 60 * 60);
    // Si la hora de despertar es menor a la de dormir, asumimos que cruzó la medianoche
    if (diff < 0) diff += 24;

    return diff.toFixed(1);
  }, [sleepTime, wakeTime]);

  /**
   * Guarda el registro final de horas de sueño en Supabase.
   */
  const handleSave = async () => {
    const hours = Number(calculatedHours);

    if (hours <= 0) {
      return Alert.alert("Formato Inválido", "Ingresa horas válidas en formato militar (Ej: 22:30, 06:15)");
    }

    try {
      await saveSleepLog(hours, userId);
      
      // Nota: Los puntos se asignan automáticamente por el trigger trg_add_points_on_log
      Alert.alert("¡Buen descanso!", "Horas de sueño guardadas.");
      
      // Actualizamos la vista para mostrar la pantalla de éxito
      await checkSleepRecord();
      
      if (onSaved) onSaved();

    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // Pantalla de carga mientras verifica la base de datos
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
          /* PANTALLA: HÁBITO YA COMPLETADO HOY */
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
          /* PANTALLA: FORMULARIO DE REGISTRO */
          <>
            <Text style={styles.icon}>😴</Text>
            <Text style={styles.title}>¿Cuánto dormiste?</Text>
            
            <TextInput 
              placeholder="Dormir (Ej: 22:00)" 
              style={styles.input} 
              onChangeText={setSleepTime} 
              keyboardType="numbers-and-punctuation" 
              maxLength={5} // Previene textos muy largos
            />
            <TextInput 
              placeholder="Despertar (Ej: 06:00)" 
              style={styles.input} 
              onChangeText={setWakeTime} 
              keyboardType="numbers-and-punctuation" 
              maxLength={5}
            />
            
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total calculado:</Text>
              <Text style={styles.resultText}>{calculatedHours} hrs</Text>
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