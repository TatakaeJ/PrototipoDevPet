import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { styles } from '../../styles/chartsStyles/WeeklyHanitCharts.styles';
import { LineChart } from 'react-native-gifted-charts';
import { getWeekHabits } from '../../src/services/habits.service';

const { width } = Dimensions.get('window');

/**
 * Propiedades esperadas por el componente WeeklyHabitCharts.
 * @typedef {Object} WeeklyHabitChartsProps
 * @property {string} selectedHabit - Tipo de hábito seleccionado ('sleep' 'hydration' 'active_break').
 * @property {string|number} userId - Identificador único del usuario para realizar la consulta en base de datos.
 */

/**
 * Componente WeeklyHabitCharts
 * Renderiza un gráfico de líneas que muestra la evolución semanal (últimos 7 días) del hábito seleccionado.
 *
 * @param {WeeklyHabitChartsProps} props - Propiedades pasadas al componente.
 * @returns {JSX.Element} Componente de visualización de gráfico semanal o estado de carga/sin datos.
 */
export default function WeeklyHabitCharts({ selectedHabit, userId }) {
    const [weeklyData, setWeeklyData] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Efecto de ciclo de vida que desencadena la carga de métricas semanales
     * cada vez que cambia el usuario activo o el hábito seleccionado.
     */
    useEffect(() => {
        loadWeeklyData();
    }, [selectedHabit, userId]);

    /**
     * Consulta asíncrona a la capa de servicios para obtener los registros semanales del usuario
     * y aplicar el formateo para la librería gráfica.
     *
     * @async
     * @returns {Promise<void>}
     */
    const loadWeeklyData = async () => {
        try {
            setLoading(true);
            const data = await getWeekHabits(userId);
            
            // Procesamiento de datos crudos según el hábito activo
            const processedData = processWeeklyData(data, selectedHabit);
            setWeeklyData(processedData);
        } catch (error) {
            console.error('Error cargando datos semanales:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Filtra, agrupa y calcula la suma diaria de los registros de hábitos durante los últimos 7 días.
     *
     * @param {Array<Object>} data - Lista de registros devueltos por el backend.
     * @param {string} habitType - Identificador del tipo de hábito a filtrar.
     * @returns {Array<{date: string, value: number, label: string}>} Estructura normalizada de datos para los últimos 7 días.
     */
    const processWeeklyData = (data, habitType) => {
        // 1. Filtrar registros por el tipo de hábito seleccionado
        const filteredData = data.filter(log => 
            log.healthy_habits?.type === habitType
        );

        // 2. Agrupar por fecha y acumular métricas por día
        const dailyData = {};
        filteredData.forEach(log => {
            const date = log.log_date;
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += log.value || 0;
        });

        // 3. Generar la secuencia para los últimos 7 días consecutivos
        const result = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
            
            result.push({
                date: dateStr,
                value: dailyData[dateStr] || 0,
                label: date.toLocaleDateString('es-ES', { weekday: 'short' }) // Nombre corto del día
            });
        }

        return result;
    };

    // Renderizado condicional en estado de carga
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando datos semanales...</Text>
            </View>
        );
    }

    // Renderizado condicional ante ausencia de datos
    if (!weeklyData || weeklyData.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos esta semana</Text>
            </View>
        );
    }

    // Mapeo de datos para configuración de puntos en el LineChart
    const chartData = weeklyData.map(day => ({
        value: day.value,
        dataPointColor: getChartColor(selectedHabit)
    }));

    const labels = weeklyData.map(day => day.label);

    // Mapeo del valor máximo para el escalado dinámico del eje Y
    const maxValue = Math.max(...weeklyData.map(day => day.value));
    const dynamicMaxY = getDynamicMaxY(selectedHabit, maxValue);

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartSubtitle}>
                {getChartTitle(selectedHabit)} (últimos 7 días)
            </Text>
            
            <LineChart
                data={chartData}
                width={width - 80}
                height={200}
                spacing={Math.floor((width - 80) / chartData.length)}
                
                color1={getChartColor(selectedHabit)}
                thickness={2}
                hideDataPoints={false}
                dataPointsRadius={3}
                
                xAxisLabelTexts={labels}
                xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                yAxisLabelSuffix={getUnitSuffix(selectedHabit)}
                maxValue={dynamicMaxY}
                noOfSections={selectedHabit === 'active_break' ? 7 : 4}
                
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
 * Obtiene el título correspondiente del gráfico según el hábito seleccionado.
 *
 * @param {string} habitType - Identificador del hábito.
 * @returns {string} Título descriptivo para la cabecera de la gráfica.
 */
function getChartTitle(habitType) {
    switch (habitType) {
        case 'sleep':
            return 'Sueño Semanal';
        case 'hydration':
            return 'Hidratación Semanal';
        case 'active_break':
            return 'Pausas Activas Semanales';
        default:
            return 'Gráfico Semanal';
    }
}

/**
 * Determina el color temático para las líneas y puntos del gráfico.
 *
 * @param {string} habitType - Identificador del hábito.
 * @returns {string} Código de color en formato Hexadecimal.
 */
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

/**
 * Retorna el sufijo de unidad de medida asociado al tipo de hábito.
 *
 * @param {string} habitType - Identificador del hábito.
 * @returns {string} Cadena con la unidad ('h', 'ml' o vacía).
 */
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
 * Retorna la precisión de decimales para las lecturas numéricas.
 *
 * @param {string} habitType - Identificador del hábito.
 * @returns {number} Número de posiciones decimales requeridas.
 */
function getDecimalPlaces(habitType) {
    switch (habitType) {
        case 'sleep':
            return 1; // 1 decimal para horas de sueño
        case 'hydration':
            return 0; // Sin decimales para volumen de mililitros
        case 'active_break':
            return 0; // Sin decimales para número de pausas
        default:
            return 0;
    }
}

/**
 * Calcula el valor límite máximo del eje Y con un margen superior predeterminado.
 *
 * @param {string} habitType - Identificador del hábito.
 * @param {number} maxValue - Valor máximo detectado entre los datos.
 * @returns {number} Límite superior recomendado para la escala gráfica.
 */
function getDynamicMaxY(habitType, maxValue) {
    switch (habitType) {
        case 'sleep':
            return Math.max(maxValue, 12); // Mínimo de escala a 12 horas
        case 'hydration':
            return Math.max(maxValue, 2500); // Mínimo de escala a 2500ml
        case 'active_break':
            return Math.max(maxValue, 7); // Mínimo de escala a 7 pausas
        default:
            return maxValue;
    }
}