import { supabase } from './supabase.config';
import { getLocalDate, getLocalTime } from '../utils/time';

/**
 * SERVICIO DE GESTIÓN DE HÁBITOS Y ESTADO DE LA MASCOTA
 * 
 * Este archivo centraliza todas las consultas y mutaciones en Supabase relacionadas con:
 * 1. Registro de hábitos diarios (Agua, Sueño, Pausas Activas).
 * 2. Consulta de métricas para reportes (Día, Semana, Mes).
 * 3. Cálculo dinámico y actualización del estado físico/emocional de la mascota.
 */

// ==========================================
// 1. REGISTRO DE HÁBITOS (INSERTS)
// ==========================================

/**
 * Registra el consumo de agua del usuario.
 * @param {number} waterAmount - Cantidad de agua ingresada (ej. en mililitros).
 * @param {number} userId - ID del usuario en sesión.
 */
export const saveWaterLog = async (waterAmount, userId) => {
    try {
        const { error } = await supabase
            .from('habit_logs')
            .insert([{
                user_id: userId,
                habit_id: 1, // 1 representa Hidratación en la BD
                value: waterAmount,
                log_date: getLocalDate(),
                log_hour: getLocalTime(),
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error guardando registro de agua:', error);
        throw error;
    }
};

/**
 * Registra las horas de sueño del usuario.
 * @param {number} sleepHours - Cantidad de horas dormidas.
 * @param {number} userId - ID del usuario en sesión.
 */
export const saveSleepLog = async (sleepHours, userId) => {
    try {
        const { error } = await supabase
            .from('habit_logs')
            .insert([{
                user_id: userId,
                habit_id: 2, // 2 representa Sueño en la BD
                value: sleepHours,
                log_date: getLocalDate(),
                log_hour: getLocalTime(),
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error guardando registro de sueño:', error);
        throw error;
    }
};

/**
 * Registra la ejecución de una pausa activa realizada de manera exitosa.
 * @param {number} userId - ID del usuario en sesión.
 */
export const saveActiveBreakLog = async (userId) => {
    try {
        const { error } = await supabase
            .from('habit_logs')
            .insert([{
                user_id: userId,
                habit_id: 3, // 3 representa Pausa Activa en la BD
                value: 1, // Se contabiliza como una sesión completada
                log_date: getLocalDate(),
                log_hour: getLocalTime(),
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error guardando registro de pausa activa:', error);
        throw error;
    }
};

/**
 * Guarda el desglose detallado (duración y marcas de tiempo) de una sesión de pausa activa.
 * @param {object} sessionData - Contiene startTime, endTime y duration de la sesión.
 * @param {number} userId - ID del usuario.
 */
export const saveBreakSession = async (sessionData, userId) => {
  try {
    const { error } = await supabase
      .from('active_break_sessions')
      .insert([{
        user_id: userId,
        start_time: sessionData.startTime,
        end_time: sessionData.endTime,
        duration_seconds: sessionData.duration,
        completed_at: getLocalTime()
      }]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error guardando sesión de pausa activa:', error);
    throw error;
  }
};

/**
 * Función puente/soporte para mantener compatibilidad con componentes antiguos.
 * Delega el flujo automáticamente a la función específica requerida.
 */
export const saveHabits = async (data, userId) => {
  if (data.water) {
    return await saveWaterLog(data.water, userId);
  } else if (data.sleep_hours) {
    return await saveSleepLog(data.sleep_hours, userId);
  }
  throw new Error('Tipo de hábito no soportado en saveHabits');
};

export const saveBreak = async (data) => {
  try {
    const { error } = await supabase
      .from('breaks')
      .insert([data]);

    if (error) throw error;
    return true;
  } catch (err) {
    throw err;
  }
};


// ==========================================
// 2. CONSULTAS A LA BASE DE DATOS (SELECTS)
// ==========================================

/**
 * Recupera la lista maestra de hábitos saludables base definidos en el sistema.
 */
export const getHealthyHabits = async () => {
  const { data, error } = await supabase
    .from('healthy_habits')
    .select('id, name, type, unit, daily_goal, points_per_log');

  if (error) {
    console.error("Error obteniendo hábitos base:", error);
    throw new Error(`Error al conectar con Supabase: ${error.message}`);
  }
  return data || [];
};

/**
 * Obtiene los registros de hábitos guardados específicamente en la fecha del día de hoy.
 */
export const getDayHabits = async (userId) => {
  const localDate = getLocalDate();

  const { data, error } = await supabase
    .from('habit_logs')
    .select(`
      *,
      healthy_habits (name, type, unit, daily_goal)
    `)
    .eq('user_id', userId)
    .eq('log_date', localDate)
    .order('log_date', { ascending: false });

  if (error) {
    console.error("Error de Supabase al obtener hábitos del día:", error);
    throw new Error(`Error al conectar con Supabase: ${error.message}`);
  }
  return data || [];
};

/**
 * Recupera el histórico de hábitos acumulados durante los últimos 7 días.
 */
export const getWeekHabits = async (userId) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  
  const startDate = weekAgo.toLocaleDateString('en-CA');
  const endDate = today.toLocaleDateString('en-CA');

  const { data, error } = await supabase
    .from('habit_logs')
    .select(`
      *,
      healthy_habits (name, type, unit)
    `)
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) {
    console.error("Error obteniendo hábitos semanales:", error);
    throw new Error(`Error al conectar con Supabase: ${error.message}`);
  }
  return data || [];
};

/**
 * Recupera el histórico de hábitos acumulados durante los últimos 30 días.
 */
export const getMonthHabits = async (userId) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);
  
  const startDate = thirtyDaysAgo.toLocaleDateString('en-CA');
  const endDate = today.toLocaleDateString('en-CA');

  const { data, error } = await supabase
    .from('habit_logs')
    .select(`
      *,
      healthy_habits (name, type, unit)
    `)
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) {
    console.error("Error obteniendo hábitos mensuales:", error);
    throw new Error(`Error al conectar con Supabase: ${error.message}`);
  }
  return data || [];
};

/**
 * Consulta el perfil completo e información general de un usuario.
 */
export const getUserInfo = async (userId = 19) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error en getUserInfo:', error);
    throw error;
  }
};


// ==========================================
// 3. CONTROL DE ESTADO DE LA MASCOTA
// ==========================================

/**
 * Obtiene el estado emocional (mood) y físico (energy_level) actual de la mascota.
 */
export const getPetStatus = async (userId) => {
  const { data, error } = await supabase
    .from('pet_states')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error("Error obteniendo estado de la mascota:", error);
    throw new Error(`Error al conectar con Supabase: ${error.message}`);
  }
  return data;
};

export const updatePetMood = async (mood, userId = 19) => {
  try {
    const { error } = await supabase
      .from('pet_states')
      .update({ mood: mood })
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error en updatePetMood:', error);
    throw error;
  }
};

export const updatePetEnergy = async (energyLevel, userId = 19) => {
  try {
    const { error } = await supabase
      .from('pet_states')
      .update({ energy_level: energyLevel })
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error en updatePetEnergy:', error);
    throw error;
  }
};

/**
 * Función de utilidad interna para buscar el último log de hidratación del día.
 */
const getLastWaterLog = async (userId) => {
  try {
    const dayHabits = await getDayHabits(userId);
    const waterLogs = dayHabits.filter(log => log.healthy_habits?.type === 'hydration');
    if (waterLogs.length === 0) return null;
    return waterLogs.sort((a, b) => b.log_hour.localeCompare(a.log_hour))[0];
  } catch (error) {
    console.error('Error obteniendo último registro de agua:', error);
    return null;
  }
};

/**
 * Calcula cuántas horas han pasado desde la última vez que el usuario registró agua.
 */
const getTimeSinceLastWater = (lastLog) => {
  if (!lastLog) return Infinity;
  try {
    const currentDate = getLocalDate();
    const currentTime = getLocalTime();
    const now = new Date(`${currentDate}T${currentTime}`);
    const logTime = new Date(`${lastLog.log_date}T${lastLog.log_hour}`);
    return (now - logTime) / (1000 * 60 * 60);
  } catch (error) {
    console.error('Error calculando tiempo desde última toma:', error);
    return Infinity;
  }
};

/**
 * Evalúa si se debe activar el estado de sed ('thirsty') de la mascota
 * en el Frontend.
 *
 * Regla:
 * Pasaron >= 2.4 horas sin agua Y el progreso diario es menor al 80%.
 */
export const checkThirstyState = async (userId) => {
  try {
    const lastWaterLog = await getLastWaterLog(userId);
    const timeSinceLastWater = getTimeSinceLastWater(lastWaterLog);

    const waterInterval = 2.4;

    const dayHabits = await getDayHabits(userId);

    const totals = {
      hydration: 0,
      sleep: 0,
    };

    const goals = {
      hydration: 2500,
      sleep: 8,
    };

    dayHabits.forEach((log) => {
      const type = log.healthy_habits?.type;
      const goal = log.healthy_habits?.daily_goal;

      if (type && totals.hasOwnProperty(type)) {
        totals[type] += log.value ?? 0;

        if (goal) {
          goals[type] = goal;
        }
      }
    });

    const rates = {
      hydration: totals.hydration / goals.hydration,
      sleep: totals.sleep / goals.sleep,
    };

    const isThirsty =
      timeSinceLastWater >= waterInterval &&
      (rates.hydration < 0.8 ||
        (rates.hydration < 0.3 && rates.sleep >= 0.6));

    return {
      isThirsty,
      timeSinceLastWater,
    };
  } catch (error) {
    console.error("Error verificando thirsty state:", error);

    return {
      isThirsty: false,
      timeSinceLastWater: Infinity,
    };
  }
};

/**
 * ALGORITMO CORE:
 * Calcula el estado de ánimo y energía según el cumplimiento del día.
 *
 * Cambios aplicados:
 * - Se unificó la lógica duplicada para evitar colisiones en la BD.
 * - Puntuación de Energía: incrementa o reduce la energía
 *   en base a rangos de cumplimiento.
 * - Determinación del Mood: evalúa prioridades críticas.
 *   Ej: sueño insuficiente provoca estado 'sleepy'.
 */
export const calculateAndUpdatePetState = async (userId) => {
  try {
    const dayHabits = await getDayHabits(userId);
    const currentPetState = await getPetStatus(userId);

    const currentEnergy = currentPetState?.energy_level ?? 50;

    const totals = {
      hydration: 0,
      sleep: 0,
      active_break: 0,
    };

    const goals = {
      hydration: 2500,
      sleep: 8,
      active_break: 3,
    };

    dayHabits.forEach((log) => {
      const type = log.healthy_habits?.type;
      const goal = log.healthy_habits?.daily_goal;

      if (type && totals.hasOwnProperty(type)) {
        totals[type] += log.value ?? 0;

        if (goal) {
          goals[type] = goal;
        }
      }
    });

    const rates = {
      hydration: totals.hydration / goals.hydration,
      sleep: totals.sleep / goals.sleep,
      active_break: totals.active_break / goals.active_break,
    };

    // Variación del nivel de energía en base al desempeño diario
    let energyChange = 0;

    Object.values(rates).forEach((rate) => {
      if (rate >= 1) {
        energyChange += 15;
      } else if (rate >= 0.7) {
        energyChange += 10;
      } else if (rate >= 0.5) {
        energyChange += 5;
      } else if (rate >= 0.3) {
        energyChange -= 5;
      } else {
        energyChange -= 10;
      }
    });

    const newEnergy = Math.max(
      0,
      Math.min(100, currentEnergy + energyChange)
    );

    let newMood;

    // Clasificación de estados de ánimo por prioridades lógicas

    if (totals.sleep > 0 && totals.sleep < 5) {
      // Prioridad 1: Privación del sueño
      newMood = "sleepy";
    } else if (
      rates.hydration >= 0.8 &&
      rates.sleep >= 0.8 &&
      rates.active_break >= 0.8
    ) {
      // Prioridad 2: Excelente rendimiento global
      newMood = "happy";
    } else if (
      Object.values(rates).filter((r) => r >= 0.5).length >= 2
    ) {
      // Prioridad 3: Progreso aceptable en la mayoría
      newMood = "neutral";
    } else if (
      Object.values(rates).filter((r) => r >= 0.5).length < 1
    ) {
      // Prioridad 4: Incumplimiento generalizado
      newMood = "sad";
    } else {
      if (newEnergy >= 70) {
        newMood = "happy";
      } else if (newEnergy >= 40) {
        newMood = "neutral";
      } else {
        newMood = "sad";
      }
    }

    // Actualización simultánea en Supabase
    await updatePetMood(newMood, userId);
    await updatePetEnergy(newEnergy, userId);

    return {
      mood: newMood,
      energy_level: newEnergy,
    };
  } catch (error) {
    console.error("Error en calculateAndUpdatePetState:", error);
    throw error;
  }
};

// ==========================================
// 4. SISTEMA DE PUNTOS Y PENALIZACIONES
// ==========================================

export const updateUserPoints = async (points, userId = 19) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        total_points: points,
      })
      .eq("user_id", userId);

    if (error) throw error;

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error en updateUserPoints:", error);
    throw error;
  }
};

export const getTodayWaterTotal = async (userId = 19) => {
  const today = getLocalDate();

  const { data, error } = await supabase
    .from("habit_logs")
    .select("value")
    .eq("user_id", userId)
    .eq("habit_id", 1)
    .eq("log_date", today);

  if (error) return 0;

  return (data || []).reduce(
    (sum, log) => sum + (log.value || 0),
    0
  );
};

export const getTodaySleepHours = async (userId = 19) => {
  const today = getLocalDate();

  const { data, error } = await supabase
    .from("habit_logs")
    .select("value")
    .eq("user_id", userId)
    .eq("habit_id", 2)
    .eq("log_date", today);

  if (error) return null;

  if (!data || data.length === 0) {
    return null;
  }

  return data.reduce(
    (sum, log) => sum + (log.value || 0),
    0
  );
};

/**
 * Aplica una penalización de -15 puntos al usuario
 * si se encuentra en estado 'sleepy'.
 */
export const deductSleepyPoints = async (userId = 19) => {
  try {
    const {
      data: user,
      error: fetchError,
    } = await supabase
      .from("users")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = Math.max(
      0,
      (user.total_points || 0) - 15
    );

    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_points: newPoints,
      })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    return newPoints;
  } catch (err) {
    console.error("Error restando puntos sleepy:", err);
    throw err;
  }
};

// Calcular energy_level y actualizar pet_states según los 3 hábitos
export const calculateEnergyLevel = async (userId = 19) => {
    try {
        const today = getLocalDate();

        const { data: logs, error } = await supabase
            .from('habit_logs')
            .select(`value, healthy_habits(type, daily_goal)`)
            .eq('user_id', userId)
            .eq('log_date', today);

        if (error) throw error;

        // Agrupar totales por tipo
        const totals = { hydration: 0, sleep: 0, active_break: 0 };
        const goals  = { hydration: 2500, sleep: 8, active_break: 3 };

        (logs || []).forEach(log => {
            const type = log.healthy_habits?.type;
            const goal = log.healthy_habits?.daily_goal;
            if (type && totals.hasOwnProperty(type)) {
                totals[type] += log.value || 0;
                if (goal) goals[type] = goal;
            }
        });

        // Calcular tasa de cumplimiento por hábito (máximo 100%)
        const rates = {
            hydration:    Math.min(totals.hydration    / goals.hydration,    1),
            sleep:        Math.min(totals.sleep        / goals.sleep,        1),
            active_break: Math.min(totals.active_break / goals.active_break, 1),
        };

        // Promedio general = energy_level
        const energyLevel = Math.round(
            ((rates.hydration + rates.sleep + rates.active_break) / 3) * 100
        );

        // Determinar mood según energy_level
        let mood;
        if (energyLevel >= 70)      mood = 'happy';
        else if (energyLevel >= 40) mood = 'neutral';
        else                        mood = 'sad';

        // Guardar en pet_states
        await supabase
            .from('pet_states')
            .update({ mood, energy_level: energyLevel })
            .eq('user_id', userId);

        return { mood, energy_level: energyLevel };
    } catch (err) {
        console.error('Error calculando energy_level:', err);
        throw err;
    }
};

// ==========================================
// FUNCIONES DE LA TIENDA (SHOP)
// ==========================================

// Obtener el inventario de mascotas del usuario (las que ya compró)
export const getUserInventory = async (userId = 19) => {
    try {
        const { data, error } = await supabase
            .from('user_pets')
            .select('pet_id')
            .eq('user_id', userId);

        if (error) {
            console.error("Error obteniendo inventario:", error);
            throw new Error(`Error al conectar con Supabase: ${error.message}`);
        }

        // Retornamos un array simple con los IDs de las mascotas compradas (ej: ['conejo', 'dragon'])
        return data ? data.map(item => item.pet_id) : [];
    } catch (error) {
        console.error('Error en getUserInventory:', error);
        throw error;
    }
};

// Comprar una nueva mascota
export const purchasePet = async (petId, price, userId = 19) => {
    try {
        // 1. Verificamos los puntos actuales del usuario
        const userInfo = await getUserInfo(userId);
        const currentPoints = userInfo?.total_points || 0;

        if (currentPoints < price) {
            throw new Error('No tienes suficientes diamantes 💎 para esta mascota.');
        }

        // 2. Insertamos la mascota en el inventario (user_pets)
        const { error: insertError } = await supabase
            .from('user_pets')
            .insert([{
                user_id: userId,
                pet_id: petId
            }]);

        if (insertError) {
            // Si el código de error es 23505 (Unique violation), es porque ya la tiene
            if (insertError.code === '23505') {
                 throw new Error('Ya posees esta mascota.');
            }
            throw new Error(`Error guardando mascota: ${insertError.message}`);
        }

        // 3. Restamos los puntos al usuario
        const newPoints = currentPoints - price;
        await updateUserPoints(newPoints, userId);

        return { success: true, newPoints };
    } catch (error) {
        console.error('Error en purchasePet:', error);
        throw error;
    }
};

// Equipar una mascota
export const equipPet = async (petId, userId = 19) => {
    try {
        console.log(`Equipando mascota ${petId} para usuario ${userId}`);

        const { error } = await supabase
            .from('users')
            .update({ equipped_pet: petId })
            .eq('user_id', userId);

        if (error) {
            console.error("Error equipando mascota:", error);
            throw new Error(`Error al equipar en Supabase: ${error.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error en equipPet:', error);
        throw error;
    }
};