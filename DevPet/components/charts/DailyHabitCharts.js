import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { styles } from '../../styles/chartsStyles/DailyHabitCharts.styles';
import { LineChart } from 'react-native-gifted-charts';
import { getHealthyHabits } from '../../src/services/habits.service';

const { width } = Dimensions.get('window');

/**
 * Componente principal para la visualización de gráficos y métricas diarias.
 * Renderiza el gráfico o tarjeta correspondiente según el hábito seleccionado.
 *
 * @param {Object} props
 * @param {string} props.selectedHabit - Identificador del hábito ('hydration', 'sleep', 'active_break').
 * @param {Array<Object>} props.habitLogs - Lista de registros del usuario para el día actual.
 */
export default function DailyHabitCharts({ selectedHabit, habitLogs }) {
    const [healthyHabits, setHealthyHabits] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealthyHabits();
    }, []);

    const loadHealthyHabits = async () => {
        try {
            setLoading(true);
            const habitsData = await getHealthyHabits();
            setHealthyHabits(habitsData);
        } catch (error) {
            console.error('Error cargando hábitos base:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando hábitos...</Text>
            </View>
        );
    }

    if (!selectedHabit || !healthyHabits) {
        return null;
    }

    // Buscar la configuración del hábito seleccionado
    const habitData = healthyHabits.find(habit => habit.type === selectedHabit);
    if (!habitData) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos disponibles</Text>
            </View>
        );
    }

    // Filtrar los registros para el hábito activo
    const selectedHabitLogs = habitLogs ? habitLogs.filter(log => 
        log.healthy_habits?.type === selectedHabit
    ) : [];

    switch (selectedHabit) {
        case 'hydration':
            return <HydrationChart habitLogs={selectedHabitLogs} dailyGoal={habitData.daily_goal} />;
        case 'sleep':
            return <SleepCard habitLogs={selectedHabitLogs} />;
        case 'active_break':
            return <ActiveBreaksCard habitLogs={selectedHabitLogs} dailyGoal={habitData.daily_goal} />;
        default:
            return null;
    }
}

/**
 * Gráfico acumulativo de consumo de agua durante el día.
 *
 * @param {Object} props
 * @param {Array<Object>} props.habitLogs - Lista de registros de hidratación.
 * @param {number} props.dailyGoal - Meta diaria de hidratación en ml.
 */
function HydrationChart({ habitLogs, dailyGoal }) {
    if (!habitLogs || habitLogs.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataTitle}>¡A hidratarse! 💧</Text>
                <Text style={styles.noDataSubtitle}>
                    No has registrado agua hoy. 
                    {"\n"}Tu meta es de {dailyGoal} ml diarios.
                </Text>
                <Text style={styles.noDataTip}>
                    💡 Bebe un vaso de agua ahora y registra tu progreso
                </Text>
            </View>
        );
    }

    // Ordenar registros por hora
    const sortedLogs = [...habitLogs].sort((a, b) => {
        return (a.log_hour || '').localeCompare(b.log_hour || '');
    });

    const chartData = [];
    const labels = [];
    let cumulativeSum = 0;

    sortedLogs.forEach(log => {
        cumulativeSum += log.value || 0;
        const timeLabel = log.log_hour || '00:00';
        
        chartData.push({
            value: cumulativeSum,
            dataPointColor: '#4B9FE1'
        });
        labels.push(timeLabel);
    });

    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : dailyGoal;
    const chartWidth = width - 80;
    const calculatedSpacing = chartData.length > 0 
        ? Math.max(15, Math.floor(chartWidth / chartData.length)) 
        : 30;

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Hidratación Diaria</Text>
            <Text style={styles.chartSubtitle}>Meta: {dailyGoal} ml</Text>
            
            <LineChart
                data={chartData}
                width={chartWidth}
                height={200}
                spacing={calculatedSpacing}
                
                color1="#4B9FE1"
                thickness={2}
                hideDataPoints={false}
                dataPointsRadius={3}
                
                xAxisLabelTexts={labels}
                xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisLabelSuffix="ml"
                maxValue={maxValue}
                noOfSections={4}
                
                xAxisColor="rgba(255,255,255,0.1)"
                yAxisColor="rgba(255,255,255,0.1)"
                rulesColor="rgba(255,255,255,0.08)"
                rulesType="solid"
                backgroundColor="transparent"
                
                curved
                curvature={0.2}
                areaChart={false}
                hideRules={false}
            />
        </View>
    );
}

/**
 * Tarjeta de resumen de horas de descanso diario.
 *
 * @param {Object} props
 * @param {Array<Object>} props.habitLogs - Registros de horas dormidas.
 */
function SleepCard({ habitLogs }) {
    if (!habitLogs || habitLogs.length === 0) {
        return (
            <View style={styles.noDataContainerSleep}>
                <Text style={[styles.noDataTitle, { color: '#8B5CF6' }]}>¡Hora de descansar! 😴</Text>
                <Text style={styles.noDataSubtitle}>
                    No has registrado tu sueño hoy. 
                    {"\n"}Recuerda dormir entre 7-9 horas para un buen descanso.
                </Text>
                <Text style={[styles.noDataTip, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                    💡 Establece una rutina nocturna y mejora tu calidad de sueño
                </Text>
            </View>
        );
    }

    const totalSleep = habitLogs.reduce((sum, log) => sum + (log.value || 0), 0);
    
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Sueño Diario</Text>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{totalSleep.toFixed(1)}</Text>
                <Text style={styles.cardUnit}>horas</Text>
            </View>
            <Text style={styles.cardDescription}>Total de sueño hoy</Text>
        </View>
    );
}

/**
 * Tarjeta de resumen de pausas activas completadas en el día.
 *
 * @param {Object} props
 * @param {Array<Object>} props.habitLogs - Registros de pausas ejecutadas.
 * @param {number} props.dailyGoal - Meta diaria de pausas.
 */
function ActiveBreaksCard({ habitLogs, dailyGoal }) {
    if (!habitLogs || habitLogs.length === 0) {
        return (
            <View style={styles.noDataContainerBreaks}>
                <Text style={[styles.noDataTitle, { color: '#10B981' }]}>¡Muévete y descansa! 🤸</Text>
                <Text style={styles.noDataSubtitle}>
                    No has hecho pausas activas hoy. 
                    {"\n"}Tu meta es de {dailyGoal} pausas para mantenerte energético.
                </Text>
                <Text style={[styles.noDataTip, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    💡 Levántate, estira y muévete cada hora para mejorar tu salud
                </Text>
            </View>
        );
    }

    const completedBreaks = habitLogs.length;
    
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Pausas Activas</Text>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{completedBreaks}</Text>
                <Text style={styles.cardUnit}>de {dailyGoal}</Text>
            </View>
            <Text style={styles.cardDescription}>Pausas completadas hoy</Text>
        </View>
    );
}