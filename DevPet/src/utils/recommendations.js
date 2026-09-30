/**
 * Motor de Reglas de Gamificación
 * Evalúa las métricas de bienestar del usuario para determinar el comportamiento y estado de la mascota.
 * 
 * @param {number} sleep - Horas de sueño registradas por el usuario.
 * @param {number} water - Vasos o litros de agua consumidos.
 * @param {number} breaks - Cantidad de pausas activas o descansos realizados.
 * @returns {Object} Un objeto con el texto de la recomendación y el estado visual ('mood') que adoptará el avatar.
 */
export const getRecommendation = (sleep, water, breaks) => {
  
  if (sleep < 5) {
    return {
      text: "Oye... necesitas descansar de verdad 😴. Tu cuerpo y mente lo necesitan.",
      mood: "sleepy", // Cambia el sprite de la mascota a un estado somnoliento
    };
  }

  if (water < 3) {
    return {
      text: "¡No olvides hidratarte! Toma un buen vaso de agua justo ahora 💧.",
      mood: "thirsty", // Cambia la mascota a un estado de sed/alerta
    };
  }

  if (breaks < 1) {
    return {
      text: "Llevas mucho tiempo enfocado. Desconéctate un momento y haz una pausa activa 🧘.",
      mood: "sad", // Cambia el avatar para reflejar cansancio o decaimiento por falta de breaks
    };
  }

  return {
    text: "¡Estás teniendo un rendimiento espectacular! Sigue cuidando tus hábitos 🚀.",
    mood: "happy", // Estado óptimo y feliz de la mascota
  };
};
