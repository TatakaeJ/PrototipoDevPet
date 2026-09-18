import { useState, useEffect, useCallback, useRef } from 'react';
import {
    calculateEnergyLevel,
    getTodayWaterTotal,
    getTodaySleepHours,
} from '../services/habits.service'; // Ajusta la extensión si le pusiste .services

const WATER_GOAL = 2500;

export const usePetState = (userId) => {
    const [baseMood, setBaseMood] = useState('neutral');
    const [energyLevel, setEnergyLevel] = useState(50);
    const [isSleepy, setIsSleepy] = useState(false);
    const [sleepyActive, setSleepyActive] = useState(false);
    const [isThirsty, setIsThirsty] = useState(false);
    
    const sleepyTimerRef = useRef(null);
    const sleepyIntervalRef = useRef(null);
    const thirstyTimerRef = useRef(null);

    // LÓGICA SLEEPY
    const checkSleepy = async () => {
        const hours = await getTodaySleepHours(userId);
        if (hours === null) {
            setSleepyActive(false);
            return;
        }
        if (hours < 5) {
            setSleepyActive(true);
            // Penalización solo una vez por día (se debe revisar el sitema de penalizaciones)
            // if (!sleepyPenaltyDone) {
            //     try {
            //         const newPoints = await deductSleepyPoints(userId);
            //         if (onPointsChange) onPointsChange(newPoints);
            //         setSleepyPenaltyDone(true);
            //     } catch (err) {
            //         console.error('Error penalización sleepy:', err);
            //     }
            // }
        } else {
            setSleepyActive(false);
            setIsSleepy(false);
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
        }
    };

    const scheduleSleepyNap = useCallback(() => {
        clearTimeout(sleepyIntervalRef.current);
        const waitMs = Math.random() * 12000 + 8000;
        sleepyIntervalRef.current = setTimeout(() => {
            setIsSleepy(true);
            const napMs = Math.random() * 7000 + 3000;
            sleepyTimerRef.current = setTimeout(() => {
                setIsSleepy(false);
                scheduleSleepyNap();
            }, napMs);
        }, waitMs);
    }, []);

    useEffect(() => {
        if (sleepyActive) scheduleSleepyNap();
        else {
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
            setIsSleepy(false);
        }
        return () => {
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
        };
    }, [sleepyActive, scheduleSleepyNap]);

    // LÓGICA THIRSTY
    const calcThirstyInterval = (accumMl) => {
        const remaining = Math.max(0, WATER_GOAL - accumMl);
        if (remaining <= 0) return null;
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 0);
        const hoursLeft = Math.max(1, (endOfDay - now) / (1000 * 60 * 60));
        const glassesLeft = Math.ceil(remaining / 250);
        return Math.max(1, hoursLeft / glassesLeft) * 60 * 60 * 1000;
    };

    const scheduleThirsty = useCallback((accumMl) => {
        clearTimeout(thirstyTimerRef.current);
        const intervalMs = calcThirstyInterval(accumMl);
        if (intervalMs === null) {
            setIsThirsty(false);
            return;
        }
        thirstyTimerRef.current = setTimeout(() => setIsThirsty(true), intervalMs);
    }, []);

    const checkThirsty = async () => {
        const accum = await getTodayWaterTotal(userId);
        if (accum === 0) {
            setIsThirsty(true);
            return;
        }
        if (accum >= WATER_GOAL) {
            setIsThirsty(false);
            clearTimeout(thirstyTimerRef.current);
            return;
        }
        setIsThirsty(false);
        scheduleThirsty(accum);
    };

    // MOOD BASE
    const loadBaseMood = async () => {
        try {
            const result = await calculateEnergyLevel(userId);
            setBaseMood(result.mood);
            setEnergyLevel(result.energy_level);
        } catch (err) {
            console.error('Error cargando mood base:', err);
        }
    };

    const refreshPetState = async () => {
        await Promise.all([loadBaseMood(), checkSleepy(), checkThirsty()]);
    };

    useEffect(() => {
        refreshPetState();
        return () => {
            clearTimeout(sleepyTimerRef.current);
            clearTimeout(sleepyIntervalRef.current);
            clearTimeout(thirstyTimerRef.current);
        };
    }, []);

    // Retornamos solo lo que la interfaz visual necesita saber
    return { baseMood, isSleepy, isThirsty, refreshPetState };
};