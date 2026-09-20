import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { styles } from '../../styles/habitsStyles/Water.styles';
import { saveWaterLog } from "../../src/services/habits.service";

// const { height } = Dimensions.get('window');

const Water = ({ userId, addPoints, onSaved }) => {
  const [water, setWater] = useState(0);
  const GOAL = 8; // Meta diaria de vasos
  const ML_PER_GLASS = 250;

  const handleSave = async () => {
    if (water <= 0) {
      return Alert.alert("¡Hey!", "Bebe un poco de agua antes de registrar 💧");
    }
    try {
      await saveWaterLog(water * ML_PER_GLASS, userId);
      // Los puntos se asignan automáticamente por el trigger trg_add_points_on_log
      Alert.alert("¡Hidratado!", "Progreso guardado. ¡Sigue así!");
      onSaved?.();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // Calcula el porcentaje de llenado (máximo 100%)
  const fillPercentage = Math.min((water / GOAL) * 100, 100);

  return (
  <View style={{ flex: 1 }}> 
    {/* El fondo de agua se queda fuera del scroll para que sea estático */}
    <View style={[styles.waterBackground, { height: `${fillPercentage}%` }]} />

    <ScrollView 
      contentContainerStyle={{ paddingBottom: 60, alignItems: 'center', paddingTop: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Hidratación</Text>
        <Text style={styles.mlText}>{water * ML_PER_GLASS} ml / {GOAL * ML_PER_GLASS} ml</Text>
      </View>

      <View style={styles.mainCounter}>
        <Text style={styles.waterEmoji}>💧</Text>
        <Text style={styles.countNumber}>{water}</Text>
        <Text style={styles.label}>vasos hoy</Text>
      </View>

      <View style={styles.grid}>
        {[...Array(12)].map((_, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => setWater(i + 1)}
            style={[styles.glassIcon, i < water ? styles.glassFull : styles.glassEmpty]}
          >
            <Text style={{ opacity: i < water ? 1 : 0.3 }}>🥛</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTÓN DE REGISTRO INTEGRADO ABAJO */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>REGISTRAR AGUA</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);
};

export default Water;
