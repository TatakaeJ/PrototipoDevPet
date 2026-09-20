import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { styles } from '../../styles/tasksStyles/DailyTasks.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getDayHabits, getUserInfo, updateUserPoints } from '../../src/services/habits.service';
import { ALL_TASKS } from '../../src/constants/dailyTasks';

const DailyTasks = ({ userId, addPoints, onSaved }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedTasks, setClaimedTasks] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // Cargar o generar tareas diarias basadas en la fecha actual
  useEffect(() => {
    const initializeDailyTasks = async () => {
      await loadOrGenerateDailyTasks();
      await loadDayHabits();
      await loadUserInfo();
      await loadClaimedTasks();
    };
    initializeDailyTasks();
  }, [userId]);

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Guardar tareas del día actual
  const saveDailyTasks = async (tasks, date) => {
    try {
      const tasksData = {
        date: date,
        tasks: tasks,
        generatedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(tasksData));
    } catch (error) {
      console.error('Error guardando tareas diarias:', error);
    }
  };

  // Cargar tareas guardadas o generar nuevas si es un nuevo día
  const loadOrGenerateDailyTasks = async () => {
    setLoading(true);

    try {
      const currentDate = getCurrentDate();
      const savedData = await AsyncStorage.getItem('dailyTasks');

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Si las tareas guardadas son de hoy, usarlas
        if (parsedData.date === currentDate) {
          setDailyTasks(parsedData.tasks);
          setLoading(false);
          return;
        }
      }

      // Si no hay datos guardados o son de otro día, generar nuevas tareas
      const newTasks = generateNewDailyTasks();
      setDailyTasks(newTasks);

      // Limpiar el estado de tareas reclamadas ya que es un nuevo día
      setClaimedTasks([]);

      // Guardar las nuevas tareas para hoy
      await saveDailyTasks(newTasks, currentDate);

    } catch (error) {
      console.error('Error cargando tareas diarias:', error);
      // En caso de error, generar tareas aleatorias como fallback
      const fallbackTasks = generateNewDailyTasks();
      setDailyTasks(fallbackTasks);
      setClaimedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Generar 5 tareas aleatorias
  const generateNewDailyTasks = () => {
    // Mezclar array y seleccionar 5 tareas aleatorias
    const shuffled = [...ALL_TASKS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  // Cargar hábitos del día actual
  const loadDayHabits = async () => {
    try {
      const dayHabits = await getDayHabits(userId);
      setHabitLogs(dayHabits);
    } catch (error) {
      console.error('Error cargando hábitos del día:', error);
      setHabitLogs([]);
    }
  };

  // Cargar información del usuario
  const loadUserInfo = async () => {
    try {
      const userData = await getUserInfo(userId);
      setUserInfo(userData);
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  // Cargar tareas ya reclamadas hoy
  const loadClaimedTasks = async () => {
    try {
      const currentDate = getCurrentDate();
      const claimedData = await AsyncStorage.getItem('claimedTasks');
      if (claimedData) {
        const parsedData = JSON.parse(claimedData);
        if (parsedData.date === currentDate) {
          setClaimedTasks(parsedData.taskIds || []);
        } else {
          // Si la fecha es diferente, limpiar el estado de tareas reclamadas
          setClaimedTasks([]);
        }
      } else {
        // Si no hay datos guardados, limpiar el estado
        setClaimedTasks([]);
      }
    } catch (error) {
      console.error('Error cargando tareas reclamadas:', error);
      setClaimedTasks([]);
    }
  };

  // Guardar tareas reclamadas
  const saveClaimedTasks = async (taskIds) => {
    try {
      const currentDate = getCurrentDate();
      const claimedData = {
        date: currentDate,
        taskIds: taskIds
      };
      await AsyncStorage.setItem('claimedTasks', JSON.stringify(claimedData));
    } catch (error) {
      console.error('Error guardando tareas reclamadas:', error);
    }
  };

  // Reclamar puntos de una tarea completada
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

      // Actualizar estado local
      setUserInfo({ ...userInfo, total_points: newPoints });
      setClaimedTasks([...claimedTasks, task.id]);

      // Guardar en AsyncStorage
      await saveClaimedTasks([...claimedTasks, task.id]);

      // Actualizar puntos en el componente padre
      if (addPoints) {
        addPoints(newPoints);
      }

      Alert.alert(
        '¡Tarea Completada!',
        `Has ganado ${task.points} diamantes 💎`,
        [{ text: 'OK' }]
      );

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error reclamando puntos:', error);
      Alert.alert('Error', 'No se pudo reclamar los puntos');
    }
  };

  // Forzar generación de nuevas tareas (solo para testing o manual)
  const generateDailyTasks = async () => {
    setLoading(true);

    try {
      const newTasks = generateNewDailyTasks();
      const currentDate = getCurrentDate();

      setDailyTasks(newTasks);
      setClaimedTasks([]); // Limpiar tareas reclamadas
      await loadDayHabits(); // Recargar hábitos del día
      await saveDailyTasks(newTasks, currentDate);

    } catch (error) {
      console.error('Error generando nuevas tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si una tarea está completada basada en los registros reales de habit_logs
  const isTaskCompleted = (task) => {
    if (!habitLogs || habitLogs.length === 0) return false;

    // Calcular valores actuales basados en habit_logs
    let totalWater = 0;
    let totalSleep = 0;
    let totalBreaks = 0;
    let hasSleepData = false;

    habitLogs.forEach(log => {
      const habitType = log.healthy_habits?.type;
      
      switch (habitType) {
        case 'hydration':
          totalWater += log.value || 0;
          break;
        case 'sleep':
          if (!hasSleepData || log.value > totalSleep) {
            totalSleep = log.value || 0;
            hasSleepData = true;
          }
          break;
        case 'active_break':
          totalBreaks += 1;
          break;
      }
    });

    switch(task.category) {
      case 'hydration':
        if (task.unit === 'vasos') {
          return totalWater >= task.target * 250; // Convertir vasos a ml
        } else if (task.unit === 'ml') {
          return totalWater >= task.target;
        }
        break;
      case 'sleep':
        return totalSleep >= task.target;
      case 'break':
        if (task.unit === 'ciclos') {
          return totalBreaks >= task.target;
        } else if (task.unit === 'pausas') {
          return totalBreaks >= task.target;
        }
        break;
      case 'mixed':
        // Para tareas mixtas, verificar cada componente
        if (task.target.water && task.target.sleep) {
          return totalWater >= task.target.water * 250 && totalSleep >= task.target.sleep;
        } else if (task.target.water && task.target.breaks) {
          return totalWater >= task.target.water * 250 && totalBreaks >= task.target.breaks;
        } else if (task.target.sleep && task.target.breaks) {
          return totalSleep >= task.target.sleep && totalBreaks >= task.target.breaks;
        } else if (task.target.cycles && task.target.water) {
          return totalBreaks >= task.target.cycles && totalWater >= task.target.water * 250;
        }
        break;
      default:
        return false;
    }
    return false;
  };

  // Obtener progreso de una tarea basado en datos reales de habit_logs
  const getTaskProgress = (task) => {
    if (!habitLogs || habitLogs.length === 0) {
      return { current: 0, target: task.target, percentage: 0 };
    }

    // Calcular valores actuales basados en habit_logs
    let totalWater = 0;
    let totalSleep = 0;
    let totalBreaks = 0;
    let hasSleepData = false;

    habitLogs.forEach(log => {
      const habitType = log.healthy_habits?.type;
      
      switch (habitType) {
        case 'hydration':
          totalWater += log.value || 0;
          break;
        case 'sleep':
          if (!hasSleepData || log.value > totalSleep) {
            totalSleep = log.value || 0;
            hasSleepData = true;
          }
          break;
        case 'active_break':
          totalBreaks += 1;
          break;
      }
    });

    let current = 0;
    let target = task.target;

    switch(task.category) {
      case 'hydration':
        if (task.unit === 'vasos') {
          current = Math.floor(totalWater / 250);
        } else if (task.unit === 'ml') {
          current = totalWater;
        }
        break;
      case 'sleep':
        current = totalSleep;
        break;
      case 'break':
        current = totalBreaks;
        break;
      case 'mixed':
        // Para tareas mixtas, mostrar el progreso mínimo de todas las condiciones
        const progresses = [];
        if (task.target.water) {
          progresses.push(Math.floor(totalWater / 250));
        }
        if (task.target.sleep) {
          progresses.push(totalSleep);
        }
        if (task.target.breaks) {
          progresses.push(totalBreaks);
        }
        if (task.target.cycles) {
          progresses.push(totalBreaks);
        }
        current = Math.min(...progresses);
        target = Object.values(task.target)[0]; // Tomar el primer target como referencia
        break;
    }

    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return { current, target, percentage };
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando tareas...</Text>
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
                    ? `Progreso: ${progress.current}/${Object.keys(task.target).length} objetivos`
                    : `${progress.current} / ${progress.target} ${task.unit}`
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
