import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { styles } from '../../styles/habitsStyles/Water.styles';
import { saveWaterLog } from "../../src/services/habits.service";

// Importamos las metas globales centralizadas
import { APP_GOALS } from '../../src/constants/dailyTasks';

/**
 * Componente modal para el registro de hidratación.
 * Permite al usuario seleccionar visualmente cuántos vasos de agua ha tomado
 * y guarda el registro en la base de datos convirtiéndolo a mililitros.
 * 
 * @component
 * @param {Object} props
 * @param {string|number} props.userId - ID del usuario actual.
 * @param {Function} props.onSaved - Callback ejecutado tras guardar exitosamente.
 */
const Water = ({ userId, onSaved }) => {
  const [water, setWater] = useState(0); // Estado en cantidad de vasos

  // Calculamos la meta de vasos de forma dinámica según las reglas de negocio
  const GOAL_GLASSES = APP_GOALS.WATER_GOAL_ML / APP_GOALS.WATER_GLASS_ML;

  /**
   * Guarda el registro de agua en la base de datos.
   * Convierte la cantidad de vasos seleccionada a mililitros totales.
   */
  const handleSave = async () => {
    if (water <= 0) {
      return Alert.alert("¡Hey!", "Bebe un poco de agua antes de registrar 💧");
    }
    
    try {
      const totalMl = water * APP_GOALS.WATER_GLASS_ML;
      await saveWaterLog(totalMl, userId);
      
      // Nota: Los puntos se asignan automáticamente por el trigger trg_add_points_on_log en BD
      Alert.alert("¡Hidratado!", "Progreso guardado. ¡Sigue así!");
      
      if (onSaved) onSaved();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // Calcula el porcentaje de llenado para el fondo animado (máximo 100%)
  const fillPercentage = Math.min((water / GOAL_GLASSES) * 100, 100);

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
          <Text style={styles.mlText}>
            {water * APP_GOALS.WATER_GLASS_ML} ml / {APP_GOALS.WATER_GOAL_ML} ml
          </Text>
        </View>

        <View style={styles.mainCounter}>
          <Text style={styles.waterEmoji}>💧</Text>
          <Text style={styles.countNumber}>{water}</Text>
          <Text style={styles.label}>vasos hoy</Text>
        </View>

        <View style={styles.grid}>
          {/* Renderiza 12 vasos como opciones visuales de registro rápido */}
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

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>REGISTRAR AGUA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Water;