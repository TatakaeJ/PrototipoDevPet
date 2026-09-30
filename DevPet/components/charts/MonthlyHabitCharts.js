import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { styles } from '../../styles/chartsStyles/MonthlyHabitCharts.styles';
import { LineChart } from 'react-native-gifted-charts';
import { getMonthHabits } from '../../src/services/habits.service';

const { width } = Dimensions.get('window');

/**
 * Componente para renderizar la gráfica de tendencias de hábitos de los últimos 30 días.
 *
 * @param {Object} props
 * @param {string} props.selectedHabit - Tipo de hábito activo ('hydration', 'sleep', 'active_break').
 * @param {number|string} props.userId - ID del usuario en sesión.
 */
export default function MonthlyHabitCharts({ selectedHabit, userId }) {
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMonthlyData();
    }, [selectedHabit, userId]);

    const loadMonthlyData = async () => {
        try {
            setLoading(true);
            const data = await getMonthHabits(userId);
            
            // Procesar datos según el hábito seleccionado
            const processedData = processMonthlyData(data, selectedHabit);
            setMonthlyData(processedData);
        } catch (error) {
            console.error('Error cargando datos mensuales:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Filtra y agrupa las métricas diarias para los últimos 30 días continuos.
     */
    const processMonthlyData = (data, habitType) => {
        // Filtrar datos por tipo de hábito
        const filteredData = data.filter(log => 
            log.healthy_habits?.type === habitType
        );

        // Agrupar por día y sumar valores acumulados
        const dailyData = {};
        filteredData.forEach(log => {
            const date = log.log_date;
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += log.value || 0;
        });

        // Generar un arreglo continuo de 30 días
        const result = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('en-CA');
            
            result.push({
                date: dateStr,
                value: dailyData[dateStr] || 0,
                label: date.getDate().toString() // Día del mes
            });
        }

        return result;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando datos mensuales...</Text>
            </View>
        );
    }

    if (!monthlyData || monthlyData.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos este mes</Text>
            </View>
        );
    }

    // Preparar puntos de datos para la gráfica
    const chartData = monthlyData.map(day => ({
        value: day.value,
        dataPointColor: getChartColor(selectedHabit)
    }));

    // Mostrar etiquetas cada 5 días para evitar la saturación visual
    const labels = monthlyData.map((day, index) => 
        index % 5 === 0 ? day.label : ''
    );

    const maxValue = Math.max(...monthlyData.map(day => day.value));
    const dynamicMaxY = getDynamicMaxY(selectedHabit, maxValue);

    const chartWidth = width - 80;
    const calculatedSpacing = chartData.length > 0 
        ? Math.max(10, Math.floor(chartWidth / chartData.length)) 
        : 20;

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartSubtitle}>
                {getChartTitle(selectedHabit)} (últimos 30 días)
            </Text>
            
            <LineChart
                data={chartData}
                width={chartWidth}
                height={200}
                spacing={calculatedSpacing}
                
                color1={getChartColor(selectedHabit)}
                thickness={2}
                hideDataPoints={false}
                dataPointsRadius={2}
                
                xAxisLabelTexts={labels}
                xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 8 }}
                yAxisTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisLabelSuffix={getUnitSuffix(selectedHabit)}
                maxValue={dynamicMaxY}
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

function getChartTitle(habitType) {
    switch (habitType) {
        case 'sleep':
            return 'Sueño Mensual';
        case 'hydration':
            return 'Hidratación Mensual';
        case 'active_break':
            return 'Pausas Activas Mensuales';
        default:
            return 'Gráfico Mensual';
    }
}
function getChartColor(habitType) {
    switch (habitType) {
        case 'sleep':
            return '#7C6FCD';
        case 'hydration':
            return '#4B9FE1';
        case 'active_break':
            return '#4BC98A';
        default:
            return '#4B9FE1';
    }
}
function getUnitSuffix(habitType) {
    switch (habitType) {
        case 'sleep':
            return 'h';
        case 'hydration':
            return 'ml';
        case 'active_break':
            return '';
        default:
            return '';
    }
}

/**
 * Establece el tope superior de la gráfica en función de la meta base o el valor más alto registrado.
 */
function getDynamicMaxY(habitType, maxValue) {
    switch (habitType) {
        case 'sleep':
            return Math.max(maxValue, 12);
        case 'hydration':
            return Math.max(maxValue, 2500);
        case 'active_break':
            return Math.max(maxValue, 7);
        default:
            return maxValue;
    }
}