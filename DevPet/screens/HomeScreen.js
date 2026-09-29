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
  Modal,
  Alert,
} from "react-native";
import { localStyles } from "../styles/screensStyles/HomeScreen.styles";
import { SafeAreaView } from "react-native-safe-area-context";

// Iconos
import {
  BrainCog,
  ShoppingCart,
  ClipboardList,
  Droplet,
  BatteryMedium,
  Heart,
  Star,
} from "lucide-react-native";

// Componentes
import HabitChart from "../components/charts/HabitChart";
import Pet from "../components/pet/Pet";
import Sheet from "../components/Sheet";
import Break from "../components/habits/Break";
import Water from "../components/habits/Water";
import Sleep from "../components/habits/Sleep";
import MLCamera from "../components/ml/MLCamera";
import DailyTasks from "../components/tasks/DailyTasks";
import Shop from "../components/shop/Shop";

// Servicios y Utilidades
import { saveBreak, getUserInfo } from "../src/services/habits.service";
import { useAuth } from "../context/AuthContext";
// TODO: Habilitar sistema de recomendaciones en el futuro
// import { getRecommendation } from "../src/utils/recommendations";

/**
 * Subcomponente reutilizable para los botones de acción del footer.
 */
const ActionButton = ({ icon, onPress }) => (
  <TouchableOpacity style={localStyles.actionBtn} onPress={onPress}>
    {icon}
  </TouchableOpacity>
);

/**
 * Pantalla Principal (Home).
 * Gestiona la visualización de la mascota, los puntos de experiencia, 
 * y actúa como controlador de los modales de hábitos e inteligencia artificial.
 * 
 * @component
 */
export default function HomeScreen({ navigation }) {
  const { userId } = useAuth();
  
  // Ref para refrescar el estado de la mascota desde el padre
  const petRef = useRef(null);

  // Estados visuales (Cámara)
  const [mlVisible, setMLVisible] = useState(false);
  
  // TODO: Estados de la burbuja deshabilitados temporalmente
  // const [showBubble, setShowBubble] = useState(false);
  // const [bubbleOpen, setBubbleOpen] = useState(false);

  // Estados lógicos
  const [summary, setSummary] = useState({ water: 0, sleep: 0, breaks: 0 });
  const [breakKey, setBreakKey] = useState(0);
  const [initialMode, setInitialMode] = useState("FOCUS");
  const [points, setPoints] = useState(0);
  const [userInfo, setUserInfo] = useState(null);

  // Control centralizado de modales tipo Sheet
  const [sheets, setSheets] = useState({
    states: false,
    shop: false,
    task: false,
    water: false,
    sleep: false,
    rest: false,
  });

  /**
   * Abre o cierra un modal específico.
   * @param {string} name - Nombre del modal ('water', 'sleep', 'states', etc.)
   * @param {boolean} visible - Estado deseado
   */
  const toggleSheet = useCallback((name, visible) => {
    setSheets((prev) => ({ ...prev, [name]: visible }));
  }, []);

  /**
   * Carga la información del usuario y sincroniza sus puntos.
   */
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

  /**
   * Procesa la validación exitosa de la postura desde la cámara de ML.
   * Guarda el hábito, otorga puntos y reactiva el contador Pomodoro.
   */
  const handleMLValidation = async () => {
    try {
      await saveBreak({
        user_id: userId, 
        completed_at: new Date().toISOString(),
      });

      setPoints((prev) => prev + 5);
      Alert.alert("¡Validado!", "Estiramiento completado, puntos sumados");
      
      setMLVisible(false);
      setInitialMode("BREAK");
      setBreakKey((prev) => prev + 1);
      toggleSheet("rest", true);

      if (petRef.current) {
        petRef.current.refreshPetState();
      }
    } catch (err) {
      console.log("Error al validar con IA:", err);
      Alert.alert("Error", "No se pudo guardar la validación");
    }
  };

  // TODO: Memorización de recomendaciones deshabilitada
  // const recommendation = useMemo(() => getRecommendation(summary), [summary]);

  // Calcula el nivel y experiencia actual basado en los puntos totales
  const { level, progress } = useMemo(() => ({
    level: Math.floor(points / 100) + 1,
    progress: points % 100,
  }), [points]);

  // TODO: Efecto de la burbuja de recomendación deshabilitado
  // useEffect(() => {
  //   setShowBubble(true);
  //   const timer = setTimeout(() => setShowBubble(false), 3000);
  //   return () => clearTimeout(timer);
  // }, [recommendation]);

  // Carga inicial de datos
  useEffect(() => {
    loadUserInfo();
    setSummary({ water: 2, sleep: 8, breaks: 0 });
  }, []);

  return (
    <ImageBackground
      source={require("../assets/petModel/RoomBedBackground.png")}
      style={localStyles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={localStyles.body}>
        {/* --- HEADER --- */}
        <View style={localStyles.topHeader}>
          <View style={localStyles.row}>
            <TouchableOpacity style={localStyles.miniBtn} onPress={() => toggleSheet("states", true)}>
              <BrainCog size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={localStyles.miniBtn} onPress={() => toggleSheet("shop", true)}>
              <ShoppingCart size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={localStyles.miniBtn} onPress={() => toggleSheet("task", true)}>
              <ClipboardList size={20} color="white" />
            </TouchableOpacity>
            
            {/* TODO: Botón de prueba IA deshabilitado para producción
            <TouchableOpacity onPress={() => setMLVisible(true)}>
              <Text>🧠 IA</Text>
            </TouchableOpacity>
            */}
          </View>

          <View style={localStyles.pointsContainer}>
            <Text>💎</Text>
            <Text style={localStyles.pointsText}>{points}</Text>
          </View>
        </View>

        {/* --- BARRA DE EXPERIENCIA (XP) --- */}
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

        {/* --- ÁREA CENTRAL (MASCOTA) --- */}
        <View style={localStyles.petContainer}>
          
          {/* TODO: Sistema de recomendaciones deshabilitado temporalmente
          <TouchableOpacity style={localStyles.bubbleButton} onPress={() => setBubbleOpen(!bubbleOpen)}>
            <Text style={{ color: "white" }}>💬</Text>
          </TouchableOpacity>

          {bubbleOpen && (
            <View style={localStyles.bubble}>
              <Text style={localStyles.bubbleText}>{recommendation?.text}</Text>
              <View style={localStyles.bubbleArrow} />
            </View>
          )}
          */}

          <Pet ref={petRef} userId={userId} />
        </View>

        {/* --- FOOTER (HÁBITOS) --- */}
        <View style={localStyles.actions_cont}>
          <ActionButton icon={<Droplet size={24} color="white" />} onPress={() => toggleSheet("water", true)} />
          <ActionButton icon={<BatteryMedium size={24} color="white" />} onPress={() => toggleSheet("sleep", true)} />
          <ActionButton icon={<Heart size={24} color="white" />} onPress={() => toggleSheet("rest", true)} />
        </View>
      </SafeAreaView>

      {/* ========================================== */}
      {/* SECCIÓN DE MODALES (SHEETS)                */}
      {/* ========================================== */}

      <Sheet visible={sheets.states} onClose={() => toggleSheet("states", false)} animation="slideDown">
        <HabitChart userId={userId} />
      </Sheet>

      <Sheet visible={sheets.shop} onClose={() => toggleSheet("shop", false)} animation="slideDown">
        <Shop 
          userId={userId} 
          currentPoints={points} 
          onPointsUpdate={setPoints} 
          onEquipSuccess={(newPetId) => {
            // Cuando equipamos una nueva mascota, recargamos la info y la vista principal
            loadUserInfo();
            if (petRef.current) {
              petRef.current.refreshPetState();
            }
          }}
        />
      </Sheet>

      <Sheet visible={sheets.task} onClose={() => toggleSheet("task", false)} animation="slideDown">
        <DailyTasks
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            loadUserInfo();
            if (petRef.current) petRef.current.refreshPetState();
          }}
        />
      </Sheet>

      <Sheet visible={sheets.water} onClose={() => toggleSheet("water", false)} sheetTop={80} animation="slideUp">
        <Water
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            toggleSheet("water", false);
            loadUserInfo();
            if (petRef.current) petRef.current.refreshPetState();
            setSummary((prev) => ({ ...prev, water: prev.water + 1 }));
          }}
        />
      </Sheet>

      <Sheet visible={sheets.sleep} onClose={() => toggleSheet("sleep", false)} sheetTop={80} animation="slideUp">
        <Sleep
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            toggleSheet("sleep", false);
            loadUserInfo();
            if (petRef.current) petRef.current.refreshPetState();
            setSummary((prev) => ({ ...prev, sleep: 8 }));
          }}
        />
      </Sheet>

      <Sheet visible={sheets.rest} onClose={() => toggleSheet("rest", false)} sheetTop={80} animation="slideUp">
        <Break
          key={breakKey}
          userId={userId}
          addPoints={setPoints}
          initialMode={initialMode}
          onSaved={() => {
            loadUserInfo();
            if (petRef.current) petRef.current.refreshPetState();
            setSummary((prev) => ({ ...prev, breaks: prev.breaks + 1 }));
          }}
          onCycleComplete={() => {
            console.log("Cerrando descanso y abriendo cámara...");
            toggleSheet("rest", false);
            setTimeout(() => setMLVisible(true), 600);
          }}
        />
      </Sheet>

      {/* MODAL IA (Cámara) */}
      <Modal visible={mlVisible} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <MLCamera onDetected={handleMLValidation} />
          <TouchableOpacity onPress={() => setMLVisible(false)} style={{ padding: 15, backgroundColor: "#111" }}>
            <Text style={{ color: "white", textAlign: "center" }}>Cerrar Cámara</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
}