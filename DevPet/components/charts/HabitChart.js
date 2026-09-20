import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { styles } from '../../styles/chartsStyles/HabitChart.styles';
import { getDayHabits, getWeekHabits, getMonthHabits } from '../../src/services/habits.service';
import DailyHabitCharts from './DailyHabitCharts';
import WeeklyHabitCharts from './WeeklyHabitCharts';
import MonthlyHabitCharts from './MonthlyHabitCharts';

// const { width } = Dimensions.get('window');

const TABS = [
    { key: 'day',   label: 'Día' },
    { key: 'week',  label: 'Semana' },
    { key: 'month', label: 'Mes' },
];

const PERIOD_TITLE = {
    day:   'Diario',
    week:  'Semanal',
    month: 'Mensual',
};

export default function HabitChart({ userId }) {
    const [activeTab, setActiveTab] = useState('day');
    const [selectedHabit, setSelectedHabit] = useState('hydration');
    const [habitLogs, setHabitLogs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [activeTab, userId]);
    
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            let habitLogs;
            if (activeTab === 'day') {
                habitLogs = await getDayHabits(userId);
                setHabitLogs(habitLogs);
            } else if (activeTab === 'week') {
                habitLogs = await getWeekHabits(userId);
            } else if (activeTab === 'month') {
                habitLogs = await getMonthHabits(userId);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>⚠️ Error de Conexión</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton} 
                        onPress={loadData}
                    >
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                        Cargando datos {PERIOD_TITLE[activeTab].toLowerCase()}...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Leyenda */}
            <View style={styles.legend}>
                <TouchableOpacity 
                    style={[styles.legendItem, selectedHabit === 'sleep' && styles.legendItemActive]}
                    onPress={() => setSelectedHabit('sleep')}
                >
                    <View style={[styles.legendDot, { backgroundColor: '#7C6FCD' }]} />
                    <Text style={[styles.legendText, selectedHabit === 'sleep' && styles.legendTextActive]}>Sueño</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.legendItem, selectedHabit === 'hydration' && styles.legendItemActive]}
                    onPress={() => setSelectedHabit('hydration')}
                >
                    <View style={[styles.legendDot, { backgroundColor: '#4B9FE1' }]} />
                    <Text style={[styles.legendText, selectedHabit === 'hydration' && styles.legendTextActive]}>Hidratación</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.legendItem, selectedHabit === 'active_break' && styles.legendItemActive]}
                    onPress={() => setSelectedHabit('active_break')}
                >
                    <View style={[styles.legendDot, { backgroundColor: '#4BC98A' }]} />
                    <Text style={[styles.legendText, selectedHabit === 'active_break' && styles.legendTextActive]}>Pausas activas</Text>
                </TouchableOpacity>
            </View>

            {/* Título */}
            <View style={styles.titleRow}>
                <Text style={styles.periodTitle}>
                    {PERIOD_TITLE[activeTab]}
                </Text>
            </View>

            {/* Gráfica */}
            {activeTab === 'day' ? (
                <DailyHabitCharts 
                    selectedHabit={selectedHabit} 
                    habitLogs={habitLogs} 
                />
            ) : activeTab === 'week' ? (
                <WeeklyHabitCharts 
                    selectedHabit={selectedHabit}
                    userId={userId}
                />
            ) : (
                <MonthlyHabitCharts 
                    selectedHabit={selectedHabit}
                    userId={userId}
                />
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
