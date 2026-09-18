// A esta funcion se le pasara otros datos que no sean el resumen (summary ya no existe es innesesario)
export const getRecommendation = (summary) => {
  if (summary.sleep < 5) {
    return {
      text: "Oye... necesitas descansar 😴",
      mood: "sleep",
    };
  }

  if (summary.water < 3) {
    return {
      text: "Toma más agua 💧",
      mood: "water",
    };
  }

  if (summary.breaks < 1) {
    return {
      text: "Haz una pausa 🧘",
      mood: "break",
    };
  }

  return {
    text: "Todo en orden, sigue así 🚀",
    mood: "happy",
  };
};