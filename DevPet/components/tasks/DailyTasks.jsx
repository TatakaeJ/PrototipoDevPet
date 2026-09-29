import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { styles } from '../../styles/tasksStyles/DailyTasks.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// Servicios y Constantes
import { getDayHabits, getUserInfo, updateUserPoints } from '../../src/services/habits.service';
import { ALL_TASKS, APP_GOALS } from '../../src/constants/dailyTasks';

/**
 * Modal/Pantalla de Tareas Diarias.
 * Muestra 5 misiones aleatorias al usuario y evalúa su progreso 
 * con base en los hábitos registrados durante el día.
 * 
 * @component
 */
const DailyTasks = ({ userId, addPoints, onSaved }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedTasks, setClaimedTasks] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // ==========================================
  // INICIALIZACIÓN DE DATOS
  // ==========================================

  useEffect(() => {
    const initializeDailyTasks = async () => {
      await loadOrGenerateDailyTasks();
      await loadDayHabits();
      await loadUserInfo();
      await loadClaimedTasks();
    };
    initializeDailyTasks();
  }, [userId]);

  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  const saveDailyTasks = async (tasks, date) => {
    try {
      const tasksData = { date, tasks, generatedAt: new Date().toISOString() };
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(tasksData));
    } catch (error) {
      console.error('Error guardando tareas diarias:', error);
    }
  };

  /**
   * Verifica en caché si ya hay tareas para el día de hoy.
   * Si no las hay o es un nuevo día, genera un set de 5 nuevas.
   */
  const loadOrGenerateDailyTasks = async () => {
    setLoading(true);
    try {
      const currentDate = getCurrentDate();
      const savedData = await AsyncStorage.getItem('dailyTasks');

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.date === currentDate) {
          setDailyTasks(parsedData.tasks);
          setLoading(false);
          return;
        }
      }

      const newTasks = generateNewDailyTasks();
      setDailyTasks(newTasks);
      setClaimedTasks([]);
      await saveDailyTasks(newTasks, currentDate);
    } catch (error) {
      console.error('Error cargando tareas diarias:', error);
      const fallbackTasks = generateNewDailyTasks();
      setDailyTasks(fallbackTasks);
      setClaimedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mezcla el catálogo y extrae 5 tareas aleatorias sin repetirse.
   */
  const generateNewDailyTasks = () => {
    const shuffled = [...ALL_TASKS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  const loadDayHabits = async () => {
    try {
      const dayHabits = await getDayHabits(userId);
      setHabitLogs(dayHabits);
    } catch (error) {
      console.error('Error cargando hábitos del día:', error);
      setHabitLogs([]);
    }
  };

  const loadUserInfo = async () => {
    try {
      const userData = await getUserInfo(userId);
      setUserInfo(userData);
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  const loadClaimedTasks = async () => {
    try {
      const currentDate = getCurrentDate();
      const claimedData = await AsyncStorage.getItem('claimedTasks');
      if (claimedData) {
        const parsedData = JSON.parse(claimedData);
        if (parsedData.date === currentDate) {
          setClaimedTasks(parsedData.taskIds || []);
        } else {
          setClaimedTasks([]);
        }
      } else {
        setClaimedTasks([]);
      }
    } catch (error) {
      console.error('Error cargando tareas reclamadas:', error);
      setClaimedTasks([]);
    }
  };

  const saveClaimedTasks = async (taskIds) => {
    try {
      const currentDate = getCurrentDate();
      const claimedData = { date: currentDate, taskIds };
      await AsyncStorage.setItem('claimedTasks', JSON.stringify(claimedData));
    } catch (error) {
      console.error('Error guardando tareas reclamadas:', error);
    }
  };

  // ==========================================
  // LÓGICA DE RECOMPENSAS
  // ==========================================

  /**
   * Suma los puntos al usuario cuando completa una tarea y la marca como reclamada.
   */
  const claimTaskPoints = async (task) => {
    try {
      if (!userInfo) {
        await loadUserInfo();
        if (!userInfo) {
          Alert.alert('Error', 'No se pudo cargar la información del usuario');
          return;
        }
      }

      const currentPoints = userInfo.total_points || 0;
      const newPoints = currentPoints + task.points;

      await updateUserPoints(newPoints, userId);

      setUserInfo({ ...userInfo, total_points: newPoints });
      setClaimedTasks([...claimedTasks, task.id]);
      await saveClaimedTasks([...claimedTasks, task.id]);

      if (addPoints) addPoints(newPoints);

      Alert.alert('¡Tarea Completada!', `Has ganado ${task.points} diamantes 💎`, [{ text: 'OK' }]);

      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error reclamando puntos:', error);
      Alert.alert('Error', 'No se pudo reclamar los puntos');
    }
  };

  // ==========================================
  // OPTIMIZACIÓN DE RENDIMIENTO (ESTADÍSTICAS)
  // ==========================================

  /**
   * Memoriza los totales de los hábitos del usuario para evitar 
   * calcularlos en cada iteración del mapeo de las tareas en la interfaz.
   */
  const userStats = useMemo(() => {
    let water = 0;
    let sleep = 0;
    let breaks = 0;
    let hasSleepData = false;

    habitLogs.forEach(log => {
      const habitType = log.healthy_habits?.type;
      switch (habitType) {
        case 'hydration':
          water += log.value || 0;
          break;
        case 'sleep':
          if (!hasSleepData || log.value > sleep) {
            sleep = log.value || 0;
            hasSleepData = true;
          }
          break;
        case 'active_break':
          breaks += 1;
          break;
      }
    });

    return { water, sleep, breaks };
  }, [habitLogs]);

  /**
   * Evalúa si una tarea ha sido cumplida según los estadísticos del usuario.
   */
  const isTaskCompleted = useCallback((task) => {
    if (!habitLogs || habitLogs.length === 0) return false;
    const { water, sleep, breaks } = userStats;
    const GLASS = APP_GOALS.WATER_GLASS_ML;

    switch(task.category) {
      case 'hydration':
        return task.unit === 'vasos' ? water >= task.target * GLASS : water >= task.target;
      case 'sleep':
        return sleep >= task.target;
      case 'break':
        return breaks >= task.target; // Sirve tanto para ciclos como pausas
      case 'mixed':
        const t = task.target;
        if (t.water && t.sleep) return water >= t.water * GLASS && sleep >= t.sleep;
        if (t.water && t.breaks) return water >= t.water * GLASS && breaks >= t.breaks;
        if (t.sleep && t.breaks) return sleep >= t.sleep && breaks >= t.breaks;
        if (t.cycles && t.water) return breaks >= t.cycles && water >= t.water * GLASS;
        return false;
      default:
        return false;
    }
  }, [habitLogs, userStats]);

  /**
   * Calcula el progreso matemático de una tarea para rellenar la barra visual.
   */
  const getTaskProgress = useCallback((task) => {
    if (!habitLogs || habitLogs.length === 0) {
      return { 
        current: 0, 
        target: task.category === 'mixed' ? Object.keys(task.target).length : task.target, 
        percentage: 0 
      };
    }

    const { water, sleep, breaks } = userStats;
    const GLASS = APP_GOALS.WATER_GLASS_ML;
    let current = 0;
    let target = task.target;

    switch(task.category) {
      case 'hydration':
        current = task.unit === 'vasos' ? Math.floor(water / GLASS) : water;
        break;
      case 'sleep':
        current = sleep;
        break;
      case 'break':
        current = breaks;
        break;
      case 'mixed':
        // Contamos cuántos sub-objetivos se han cumplido
        let completedGoals = 0;
        const t = task.target;

        if (t.water && water >= t.water * GLASS) completedGoals++;
        if (t.sleep && sleep >= t.sleep) completedGoals++;
        if (t.breaks && breaks >= t.breaks) completedGoals++;
        if (t.cycles && breaks >= t.cycles) completedGoals++;
        
        current = completedGoals;
        target = Object.keys(t).length; // Total de sub-objetivos (casi siempre 2)
        break;
    }

    // Limitamos "current" para que no sobrepase a "target"
    const cappedCurrent = Math.min(current, target);

    // Calculamos el porcentaje usando el valor ya limitado
    const percentage = target > 0 ? (cappedCurrent / target) * 100 : 0;
    
    return { current: cappedCurrent, target, percentage };
  }, [habitLogs, userStats]);

  // ==========================================
  // HELPERS VISUALES
  // ==========================================

  const getCategoryColor = (category) => {
    switch(category) {
      case 'hydration': return '#4B9FE1';
      case 'sleep': return '#8B5CF6';
      case 'break': return '#10B981';
      case 'mixed': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'hydration': return 'Hidratación';
      case 'sleep': return 'Sueño';
      case 'break': return 'Pausa Activa';
      case 'mixed': return 'Mixta';
      default: return 'General';
    }
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#4B9FE1" />
        <Text style={{ marginTop: 15, color: '#94A3B8', fontSize: 16, fontWeight: '500' }}>
          Cargando misiones...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tareas Diarias</Text>
        <Text style={styles.subtitle}>Completa misiones para ganar diamantes 💎</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {dailyTasks.map((task) => {
          const isCompleted = isTaskCompleted(task);
          const progress = getTaskProgress(task);
          const categoryColor = getCategoryColor(task.category);
          const isClaimed = claimedTasks.includes(task.id);

          return (
            <View key={task.id} style={[styles.taskCard, { opacity: isCompleted && isClaimed ? 0.6 : 1 }]}>
              <View style={styles.taskHeader}>
                <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
                  <Icon name={task.icon} size={20} color="white" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskCategory}>{getCategoryName(task.category)}</Text>
                </View>
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsText}>+{task.points}</Text>
                  <Text style={styles.diamond}>💎</Text>
                </View>
              </View>

              {/* Barra de progreso */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress.percentage}%`,
                        backgroundColor: isCompleted ? '#10B981' : categoryColor
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {task.category === 'mixed'
                    ? `Progreso: ${progress.current}/${progress.target} objetivos` : `${progress.current} / ${progress.target} ${task.unit}`
                  }
                </Text>
              </View>

              {isCompleted && !isClaimed && (
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={() => claimTaskPoints(task)}
                >
                  <Icon name="gift" size={16} color="#FFD700" />
                  <Text style={styles.claimButtonText}>Reclamar {task.points} 💎</Text>
                </TouchableOpacity>
              )}

              {isClaimed && (
                <View style={styles.completedBadge}>
                  <Icon name="check" size={16} color="#10B981" />
                  <Text style={styles.completedText}>Reclamado</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default DailyTasks;