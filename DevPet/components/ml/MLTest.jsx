// import React from "react";
// import { View, Text, Button, Alert } from "react-native";

// /**
//  * Componente MLTest (Módulo de Pruebas y Simulación)
//  */
// const MLTest = ({ onDetectedSimulation }) => {

//   // Simulación de un acierto del modelo (Postura Correcta)
//   const triggerMockSuccess = () => {
//     console.log("[TEST - MOCK]: Simulando detección exitosa de postura...");
//     if (onDetectedSimulation) {
//       onDetectedSimulation(true);
//     } else {
//       Alert.alert("Entorno de Prueba", "Inferencia simulada: Postura Correcta (+5 pts)");
//     }
//   };

//   // Simulación de un fallo del modelo (Postura Incorrecta)
//   const triggerMockFailure = () => {
//     console.log("[TEST - MOCK]: Simulando fallo en validación de postura...");
//     Alert.alert(
//       "Entorno de Prueba", 
//       "Inferencia simulada: Postura Incorrecta. Notificación enviada al usuario."
//     );
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
//       <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" }}>
//         PetDev - Panel de Pruebas IA
//       </Text>
//       <Text style={{ fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 }}>
//         Módulo exclusivo de desarrollo para simular el comportamiento de los tensores matemáticos.
//       </Text>

//       <View style={{ width: "100%", gap: 10 }}>
//         <Button 
//           title="Simular Postura Correcta (Success)" 
//           onPress={triggerMockSuccess} 
//           color="#00C851" 
//         />
//         <Button 
//           title="Simular Postura Incorrecta (Failure)" 
//           onPress={triggerMockFailure} 
//           color="#ff4444" 
//         />
//       </View>
//     </View>
//   );
// };
// export default MLTest;