import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveHabits } from "../lib/supabaseClient";

const Water = ({ addPoints, onSaved }) => {
  const [water, setWater] = useState(0);

  const handleSave = async () => {
if (water <= 0) {
  return Alert.alert("Error", "Debes tomar al menos 1 vaso 💧")
}    try {
      await saveHabits({
        water: water
      });
      
      addPoints(prev => prev + 5);
      Alert.alert("¡Hidratado!", "Has registrado tu agua correctamente.");
      onSaved();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>💧</Text>
        <Text style={styles.countText}>{water}</Text>
        <Text style={styles.subText}>Vasos de agua hoy</Text>
        
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.minus]} onPress={() => setWater(Math.max(0, water - 1))}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.plus]} onPress={() => setWater(water + 1)}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Registrar Agua</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 30, alignItems: 'center', elevation: 5, width: '80%' },
  icon: { fontSize: 50, marginBottom: 10 },
  countText: { fontSize: 60, fontWeight: 'bold', color: '#3B82F6' },
  subText: { fontSize: 16, color: '#64748B', marginBottom: 25 },
  row: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  btn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  minus: { backgroundColor: '#FCA5A5' },
  plus: { backgroundColor: '#93C5FD' },
  btnText: { fontSize: 30, color: 'white', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#3B82F6', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, width: '100%', alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default Water;
