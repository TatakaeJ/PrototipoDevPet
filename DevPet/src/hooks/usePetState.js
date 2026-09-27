import { useState, useEffect, useCallback, useRef } from 'react';
import {
    calculateEnergyLevel,
    getTodayWaterTotal,
    getTodaySleepHours,
} from '../services/habits.service';

// Importamos las metas globales centralizadas
import { APP_GOALS } from '../constants/dailyTasks';

/**
 * Custom Hook para gestionar los estados dinámicos de la mascota virtual.
 * Controla el estado de ánimo base, la aparición aleatoria de sueño y 
 * los recordatorios dinámicos de hidratación basados en temporizadores.
 * 
 * @param {string|number} userId - Identificador del usuario actual.
 * @returns {Object} Estados visuales (baseMood, isSleepy, isThirsty) y función de refresco.
 */
export const usePetState = (userId) => {
    // Estados visuales expuestos al componente Pet
    const [baseMood, setBaseMood] = useState('neutral');
    const [energyLevel, setEnergyLevel] = useState(50);
    const [isSleepy, setIsSleepy] = useState(false);
    const [isThirsty, setIsThirsty] = useState(false);
    
    // Estado interno para saber si el ciclo de sueño debe estar corriendo
    const [sleepyActive, setSleepyActive] = useState(false);
    
    // Referencias para limpiar los temporizadores y evitar fugas de memoria
    const sleepyTimerRef = useRef(null);
    const sleepyIntervalRef = useRef(null);
    const thirstyTimerRef = useRef(null);

    // ==========================================
    // LÓGICA DE SUEÑO (SLEEPY)
    // ==========================================

    /**
     * Verifica en la base de datos si el usuario durmió menos de lo recomendado.
     * Si es así, activa el ciclo de siestas aleatorias.
     */
    const checkSleepy = useCallback(async () => {
        const hours = await getTodaySleepHours(userId);
        
        if (hours === null) {
            setSleepyActive(false);
            return;
        }

        // Usamos la meta mínima de sueño definida en las constantes
        if (hours < APP_GOALS.SLEEP_MIN_HOURS) {
            setSleepyActive(true);
            
            /* 
             * TODO: Implementar el sistema de penalización de puntos en futuras fases.
             * Lógica comentada para evitar pérdida de puntos en el prototipo actual:
             * 
             * if (!sleepyPenaltyDone) {
             *     try {
             *         const newPoints = await deductSleepyPoints(userId);
             *         if (onPointsChange) onPointsChange(newPoints);
             *         setSleepyPenaltyDone(true);
             *     } catch (err) {
             *         console.error('Error penalización sleepy:', err);
             *     }
             * }
             */
        } else {
            setSleepyActive(false);
            setIsSleepy(false);
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
        }
    }, [userId]);

    /**
     * Programa una siesta aleatoria para la mascota (entre 8 y 20 segundos de espera).
     * La siesta durará entre 3 y 10 segundos antes de despertar y reprogramarse.
     */
    const scheduleSleepyNap = useCallback(() => {
        clearTimeout(sleepyIntervalRef.current);
        const waitMs = Math.random() * 12000 + 8000;
        
        sleepyIntervalRef.current = setTimeout(() => {
            setIsSleepy(true);
            const napMs = Math.random() * 7000 + 3000;
            
            sleepyTimerRef.current = setTimeout(() => {
                setIsSleepy(false);
                scheduleSleepyNap(); // Ciclo infinito mientras sleepyActive sea true
            }, napMs);
        }, waitMs);
    }, []);

    // Efecto para arrancar o detener el ciclo de siestas cuando cambia sleepyActive
    useEffect(() => {
        if (sleepyActive) {
            scheduleSleepyNap();
        } else {
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
            setIsSleepy(false);
        }
        
        return () => {
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
        };
    }, [sleepyActive, scheduleSleepyNap]);

    // ==========================================
    // LÓGICA DE HIDRATACIÓN (THIRSTY)
    // ==========================================

    /**
     * Calcula cuántos milisegundos deben pasar antes de que la mascota pida agua,
     * distribuyendo el agua restante entre las horas que le quedan al día.
     */
    const calcThirstyInterval = useCallback((accumMl) => {
        // Usamos la meta de agua definida en las constantes
        const remaining = Math.max(0, APP_GOALS.WATER_GOAL_ML - accumMl);
        if (remaining <= 0) return null; // Meta cumplida
        
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 0);
        
        const hoursLeft = Math.max(1, (endOfDay - now) / (1000 * 60 * 60));
        
        // Usamos la capacidad estándar del vaso definida en las constantes
        const glassesLeft = Math.ceil(remaining / APP_GOALS.WATER_GLASS_ML);
        
        return Math.max(1, hoursLeft / glassesLeft) * 60 * 60 * 1000;
    }, []);

    /**
     * Programa el temporizador para que la mascota muestre sed.
     */
    const scheduleThirsty = useCallback((accumMl) => {
        clearTimeout(thirstyTimerRef.current);
        const intervalMs = calcThirstyInterval(accumMl);
        
        if (intervalMs === null) {
            setIsThirsty(false);
            return;
        }
        
        thirstyTimerRef.current = setTimeout(() => setIsThirsty(true), intervalMs);
    }, [calcThirstyInterval]);

    /**
     * Verifica el progreso de hidratación del usuario y reprograma el estado de sed.
     */
    const checkThirsty = useCallback(async () => {
        const accum = await getTodayWaterTotal(userId);
        
        if (accum === 0) {
            setIsThirsty(true);
            return;
        }
        
        // Comparamos contra la meta global
        if (accum >= APP_GOALS.WATER_GOAL_ML) {
            setIsThirsty(false);
            clearTimeout(thirstyTimerRef.current);
            return;
        }
        
        setIsThirsty(false);
        scheduleThirsty(accum);
    }, [userId, scheduleThirsty]);

    // ==========================================
    // ESTADO DE ÁNIMO BASE Y REFRESCO
    // ==========================================

    /**
     * Carga el estado de ánimo general (Feliz, Neutral, Triste) desde la base de datos.
     */
    const loadBaseMood = useCallback(async () => {
        try {
            const result = await calculateEnergyLevel(userId);
            setBaseMood(result.mood);
            setEnergyLevel(result.energy_level);
        } catch (err) {
            console.error('Error cargando mood base:', err);
        }
    }, [userId]);

    /**
     * Función principal para recalcular todos los estados de la mascota al mismo tiempo.
     * Expuesta al exterior para ser llamada cuando el usuario registra un nuevo hábito.
     */
    const refreshPetState = useCallback(async () => {
        await Promise.all([loadBaseMood(), checkSleepy(), checkThirsty()]);
    }, [loadBaseMood, checkSleepy, checkThirsty]);

    // Efecto de inicialización y limpieza al montar/desmontar el hook
    useEffect(() => {
        refreshPetState();
        return () => {
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
            clearTimeout(thirstyTimerRef.current);
        };
    }, [refreshPetState]);

    return { baseMood, isSleepy, isThirsty, refreshPetState };
};