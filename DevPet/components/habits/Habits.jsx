import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  TextInput, 
  Alert, 
  ScrollView 
} from 'react-native';
import { styles } from '../../styles/habitsStyles/Habits.styles';
import { saveHabits } from "../../src/services/habits.service";

const Habits = ({ addPoints, onSaved }) => {
  const [view, setView] = useState('menu'); // 'menu', 'water', 'sleep'
  const [water, setWater] = useState(0);
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');

  const calculateSleepHours = () => {
    if (!sleepTime || !wakeTime) return 0;
    const [hS, mS] = sleepTime.split(':').map(Number);
    const [hW, mW] = wakeTime.split(':').map(Number);
    let diff = (new Date(0,0,0,hW,mW) - new Date(0,0,0,hS,mS)) / 1000 / 60 / 60;
    return diff < 0 ? (diff + 24).toFixed(1) : diff.toFixed(1);
  };

  const handleSave = async () => {
    try {
      const data = {
        user_id: 'demo-user',
        date: new Date().toISOString().split('T')[0],
        water: water,
        sleep_hours: Number(calculateSleepHours())
      };

      await saveHabits(data);
      if (addPoints) addPoints(prev => prev + 10);
      if (onSaved) onSaved();
      
      Alert.alert("¡Genial!", "Tus hábitos han sido actualizados.");
      setView('menu'); // Regresa al menú después de guardar
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // --- VISTA: MENÚ PRINCIPAL ---
  if (view === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Panel de Hábitos</Text>
        <Text style={styles.subtitle}>¿Qué quieres registrar hoy?</Text>
        <View style={styles.menuGrid}>
          <TouchableOpacity style={[styles.card, styles.waterCard]} onPress={() => setView('water')}>
            <View style={styles.iconCircle}><Text style={styles.emoji}>💧</Text></View>
            <Text style={styles.cardText}>Agua</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, styles.sleepCard]} onPress={() => setView('sleep')}>
            <View style={styles.iconCircle}><Text style={styles.emoji}>😴</Text></View>
            <Text style={styles.cardText}>Sueño</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- VISTA: FORMULARIO ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => setView('menu')} style={styles.backBtn}>
        <Text style={{color: '#64748b'}}>← Volver al menú</Text>
      </TouchableOpacity>

      {view === 'water' ? (
        <View style={styles.formBlock}>
          <Text style={styles.title}>💧 Hidratación</Text>
          <Text style={styles.countText}>{water} vasos</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnRound} onPress={() => setWater(Math.max(0, water - 1))}><Text style={styles.btnText}>-</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnRound} onPress={() => setWater(water + 1)}><Text style={styles.btnText}>+</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formBlock}>
          <Text style={styles.title}>😴 Sueño</Text>
          <TextInput placeholder="Dormir (22:00)" style={styles.input} onChangeText={setSleepTime} value={sleepTime} />
          <TextInput placeholder="Despertar (06:00)" style={styles.input} onChangeText={setWakeTime} value={wakeTime} />
          <Text style={styles.resultText}>Total: {calculateSleepHours()} hrs</Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Guardar Todo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Habits;
