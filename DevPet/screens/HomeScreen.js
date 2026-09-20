import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { localStyles } from "../styles/screensStyles/HomeScreen.styles";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes personalizados
import {
  BrainCog,
  ShoppingCart,
  ClipboardList,
  Droplet,
  BatteryMedium,
  Heart,
  Star,
} from "lucide-react-native";
import { Modal, Alert } from "react-native";
import HabitChart from "../components/charts/HabitChart";
import Pet from "../components/pet/Pet";
import Sheet from "../components/Sheet";
import Break from "../components/habits/Break";
import Water from "../components/habits/Water";
import Sleep from "../components/habits/Sleep";
import MLCamera from "../components/ml/MLCamera";
import DailyTasks from "../components/tasks/DailyTasks";
import {
  saveBreak,
  getUserInfo,
} from "../src/services/habits.service";
import { useAuth } from "../context/AuthContext";
import { getRecommendation } from "../src/utils/recommendations";

export default function HomeScreen({ navigation }) {
  const { userId } = useAuth();
  const [waterVisible, setWaterVisible] = useState(false);
  const [sleepVisible, setSleepVisible] = useState(false);
  const [breakVisible, setBreakVisible] = useState(false);
  const [mlVisible, setMLVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [summary, setSummary] = useState({
    water: 0,
    sleep: 0,
    breaks: 0,
  });
  const [breakKey, setBreakKey] = useState(0);
  const [initialMode, setInitialMode] = useState("FOCUS");

  // Estados de visibilidad para los Sheets (lo organicé mejor)
  const [sheets, setSheets] = useState({
    states: false,
    shop: false,
    task: false,
    water: false,
    sleep: false,
    rest: false,
  });

  // Información del usuario y puntos (diamantes)
  const [userInfo, setUserInfo] = useState(null);
  const [points, setPoints] = useState(0);

  // Ref para el componente Pet
  const petRef = useRef(null);

  // Cargar información del usuario desde la base de datos
  const loadUserInfo = async () => {
    try {
      const userData = await getUserInfo(userId);
      if (userData) {
        setUserInfo(userData);
        setPoints(userData.total_points || 0);
      }
    } catch (error) {
      console.error("Error cargando información del usuario:", error);
    }
  };

  const addPoints = (fn) => {
    setPoints(fn);
  };

  const onSaved = () => {
    loadUserInfo(); // Recargar información del usuario para obtener puntos actualizados
    // Actualizar estado de la mascota automáticamente
    if (petRef.current) {
      petRef.current.refreshPetState();
    }
  };

  const recommendation = useMemo(() => getRecommendation(summary), [summary]);

  // Memorizar cálculos de niveles
  const { level, progress } = useMemo(
    () => ({
      level: Math.floor(points / 100) + 1,
      progress: points % 100,
    }),
    [points],
  );

  // ML botón de validación
  const handleMLSuccess = async () => {
    try {
      await saveBreak({
        user_id: "demo-user",
        completed_at: new Date().toISOString(),
      });

      addPoints((prev) => prev + 5);

      Alert.alert("¡Buen trabajo!", "Estiramiento validado");

      setMLVisible(false);

      // Actualizar estado de la mascota después de validar con IA
      if (petRef.current) {
        petRef.current.refreshPetState();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSheet = useCallback((name, visible) => {
    setSheets((prev) => ({ ...prev, [name]: visible }));
  }, []);

  const handleBreakFinished = () => {
    setBreakVisible(false);
    setMLVisible(true);
  };

  const getIcon = () => {
    if (recommendation.mood === "sleep") return "😴";
    if (recommendation.mood === "water") return "💧";
    if (recommendation.mood === "break") return "🧘";
    return "💡";
  };

  useEffect(() => {
    setShowBubble(true);
    const timer = setTimeout(() => setShowBubble(false), 3000);
    return () => clearTimeout(timer);
  }, [recommendation]);

  useEffect(() => {
    loadUserInfo(); // Cargar información del usuario al montar
  }, []);

  useEffect(() => {
    setSummary({
      water: 2,
      sleep: 8,
      breaks: 0,
    });
  }, []);

  return (
    <ImageBackground
      source={require("../assets/petModel/RoomBedBackground.png")}
      style={localStyles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={localStyles.body}>
        {/* Header: Estados, Tienda, Tareas y PUNTOS (Mejor organizados, antes parecían un aceertijo)*/}
        <View style={localStyles.topHeader}>
          <View style={localStyles.row}>
            <TouchableOpacity
              style={localStyles.miniBtn}
              onPress={() => toggleSheet("states", true)}
            >
              <BrainCog size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyles.miniBtn}
              onPress={() => toggleSheet("shop", true)}
            >
              <ShoppingCart size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyles.miniBtn}
              onPress={() => toggleSheet("task", true)}
            >
              <ClipboardList size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMLVisible(true)}>
              <Text>🧠 IA</Text>
            </TouchableOpacity>
          </View>

          {/* Contador de diamantes pa' el free */}
          <View style={localStyles.pointsContainer}>
            <Text>💎</Text>
            <Text style={localStyles.pointsText}>{points}</Text>
          </View>
        </View>

        {/* XP */}
        <View style={localStyles.levelSection}>
          <View style={localStyles.levelRow}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={localStyles.levelLabel}>
              LVL {level} • {progress}/100 XP
            </Text>
          </View>
          <View style={localStyles.expTrack}>
            <View style={[localStyles.expFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Área Central: mascota y partículas */}
        <View style={localStyles.petContainer}>
          <TouchableOpacity
            style={localStyles.bubbleButton}
            onPress={() => setBubbleOpen(!bubbleOpen)}
          >
            <Text style={{ color: "white" }}>💬</Text>
          </TouchableOpacity>

          {bubbleOpen && (
            <View style={localStyles.bubble}>
              <Text style={localStyles.bubbleText}>{recommendation.text}</Text>
              <View style={localStyles.bubbleArrow} />
            </View>
          )}

          <Pet
            ref={petRef}
            userId={userId}
          />
        </View>

        {/* Footer: Acciones de hábitos */}
        <View style={localStyles.actions_cont}>
          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => setWaterVisible(true)} // Cambiado aquí
          >
            <Droplet size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => setSleepVisible(true)} // Cambiado aquí
          >
            <BatteryMedium size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => toggleSheet("rest", true)}
          >
            <Heart size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- sección de modales organizada--- */}

      <Sheet
        visible={sheets.states}
        onClose={() => toggleSheet("states", false)}
        animation="slideDown"
      >
        <HabitChart userId={userId} />
      </Sheet>

      <Sheet
        visible={sheets.shop}
        onClose={() => toggleSheet("shop", false)}
        animation="slideDown"
      >
        <Text style={localStyles.text_sheet}>Tienda de Items</Text>
      </Sheet>

      <Sheet
        visible={sheets.task}
        onClose={() => toggleSheet("task", false)}
        animation="slideDown"
      >
        <DailyTasks
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            loadUserInfo();
            if (petRef.current) {
              petRef.current.refreshPetState();
            }
          }}
        />
      </Sheet>

      {/* Registro de Hidratación */}
      <Sheet
        visible={waterVisible}
        onClose={() => setWaterVisible(false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Water
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            setWaterVisible(false);
            loadUserInfo();
            if (petRef.current) petRef.current.refreshPetState();
            setSummary((prev) => ({
              ...prev,
              water: prev.water + 1,
            }));
          }}
        />
      </Sheet>

      {/* Registro de Sueño */}
      <Sheet
        visible={sleepVisible}
        onClose={() => setSleepVisible(false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Sleep
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            setSleepVisible(false);
            loadUserInfo(); // Recargar puntos desde la base de datos
            if (petRef.current) {
              petRef.current.refreshPetState();
            }
            setSummary((prev) => ({
              ...prev,
              sleep: 8,
            }));
          }}
        />
      </Sheet>

      {/* Pausas Activas */}
      <Sheet
        visible={sheets.rest}
        onClose={() => toggleSheet("rest", false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Break
          key={breakKey}
          userId={userId}
          addPoints={setPoints}
          initialMode={initialMode}
          onSaved={() => {
            loadUserInfo();
            if (petRef.current) {
              petRef.current.refreshPetState();
            }

            setSummary((prev) => ({
              ...prev,
              breaks: prev.breaks + 1,
            }));
          }}
          onCycleComplete={() => {
            // Esta es la lógica para abrir la cámara
            console.log("Cerrando descanso y abriendo cámara...");

            toggleSheet("rest", false);

            setTimeout(() => {
              setMLVisible(true);
            }, 600);
          }}
        />
      </Sheet>

      {/* MODAL 2: ML */}
      <Modal visible={mlVisible} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <MLCamera
            onDetected={async () => {
              try {
                await saveBreak({
                  user_id: "demo-user",
                  completed_at: new Date().toISOString(),
                });

                addPoints((prev) => prev + 5);

                Alert.alert(
                  "¡Validado!",
                  "Estiramiento completado, puntos sumados",
                );

                setMLVisible(false);

                setInitialMode("BREAK");

                setBreakKey((prev) => prev + 1);

                toggleSheet("rest", true);

                if (petRef.current) {
                  petRef.current.refreshPetState();
                }
              } catch (err) {
                console.log("Error al validar:", err);
              }
            }}
          />
          <TouchableOpacity
            onPress={() => setMLVisible(false)}
            style={{ padding: 15, backgroundColor: "#111" }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Cerrar Cámara
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
}
// Limpieza, esto es un subcomponente
const ActionButton = ({ icon, onPress }) => (
  <TouchableOpacity style={localStyles.actionBtn} onPress={onPress}>
    {icon}
  </TouchableOpacity>
);
