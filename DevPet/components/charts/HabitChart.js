import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/chartsStyles/HabitChart.styles';
import { getDayHabits, getWeekHabits, getMonthHabits } from '../../src/services/habits.service';
import DailyHabitCharts from './DailyHabitCharts';
import WeeklyHabitCharts from './WeeklyHabitCharts';
import MonthlyHabitCharts from './MonthlyHabitCharts';

// Configuración de pestañas de navegación interna del módulo de analíticas
const TABS = [
    { key: 'day',   label: 'Día' },
    { key: 'week',  label: 'Semana' },
    { key: 'month', label: 'Mes' },
];

// Mapeotítulos dinámicos según el estado de la pestaña activa
const PERIOD_TITLE = {
    day:   'Diario',
    week:  'Semanal',
    month: 'Mensual',
};

export default function HabitChart({ userId }) {
    // Estados de control de navegación e interactividad del usuario
    const [activeTab, setActiveTab] = useState('day');
    const [selectedHabit, setSelectedHabit] = useState('hydration');
    
    // Estados de control de flujo de datos asíncronos provenientes del backend (supa)
    const [habitLogs, setHabitLogs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Efecto secundario controlado que dispara la sincronización de datos cada vez que cambia el usuario o el periodo
    useEffect(() => {
        loadData();
    }, [activeTab, userId]);
    
    /**
     * Orquestador de peticiones asíncronas hacia la capa de servicios (habits.service.js)
     */
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            let fetchedLogs = null;

            // Evaluación condicional del periodo activo para determinar el endpoint de Supabase correspondiente
            if (activeTab === 'day') {
                fetchedLogs = await getDayHabits(userId);
            } else if (activeTab === 'week') {
                fetchedLogs = await getWeekHabits(userId);
            } else if (activeTab === 'month') {
                fetchedLogs = await getMonthHabits(userId);
            }

            // CORRECCIÓN DE BUG: Guardamos los datos obtenidos globalmente sin importar la pestaña
            setHabitLogs(fetchedLogs);

        } catch (err) {
            console.error('Error crítico cargando datos en HabitChart:', err);
            setError(err.message || 'Error desconocido al procesar métricas.');
        } finally {
            setLoading(false);
        }
    };

    // vista de contingencia en caso de fallos de red o base de datos
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>⚠️ Error de Conexión</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // RENDERIZADO DE Transición: Estado de carga (Skeleton/Loader feedback)
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
            {/* 1. SECCIÓN DE LEYENDA / FILTRO DE HÁBITOS */}
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

            {/* 2. CABECERA DINÁMICA */}
            <View style={styles.titleRow}>
                <Text style={styles.periodTitle}>
                    {PERIOD_TITLE[activeTab]}
                </Text>
            </View>

            {/* 3. CAPA DE INYECCIÓN DE GRÁFICAS (Patrón de Renderizado Condicional basado en el Tab de tiempo activo) */}
            {activeTab === 'day' ? (
                <DailyHabitCharts selectedHabit={selectedHabit} habitLogs={habitLogs} />
            ) : activeTab === 'week' ? (
                <WeeklyHabitCharts selectedHabit={selectedHabit} habitLogs={habitLogs} userId={userId} />
            ) : (
                <MonthlyHabitCharts selectedHabit={selectedHabit} habitLogs={habitLogs} userId={userId} />
            )}

            {/* 4. BARRA DE NAVEGACIÓN INFERIOR (Tabs controladores de la vista temporal) */}
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
