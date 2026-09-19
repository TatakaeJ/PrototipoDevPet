// Base de 20 tareas cuantificables
export const ALL_TASKS = [
    // Tareas de Hidratación
    { id: 1, title: "Bebe 3 vasos de agua", category: "hydration", icon: "tint", points: 10, target: 3, unit: "vasos" },
    { id: 2, title: "Bebe 5 vasos de agua", category: "hydration", icon: "tint", points: 15, target: 5, unit: "vasos" },
    { id: 3, title: "Alcanza 1000ml de agua", category: "hydration", icon: "tint", points: 10, target: 1000, unit: "ml" },
    { id: 4, title: "Alcanza 1500ml de agua", category: "hydration", icon: "tint", points: 15, target: 1500, unit: "ml" },
    { id: 5, title: "Completa 8 vasos de agua", category: "hydration", icon: "tint", points: 20, target: 8, unit: "vasos" },
    
    // Tareas de Sueño
    { id: 6, title: "Duerme 6 horas hoy", category: "sleep", icon: "moon-o", points: 10, target: 6, unit: "horas" },
    { id: 7, title: "Duerme 7 horas hoy", category: "sleep", icon: "moon-o", points: 15, target: 7, unit: "horas" },
    { id: 8, title: "Duerme 8 horas hoy", category: "sleep", icon: "moon-o", points: 20, target: 8, unit: "horas" },
    { id: 9, title: "Duerme más de 5 horas", category: "sleep", icon: "moon-o", points: 5, target: 5, unit: "horas" },
    { id: 10, title: "Duerme más de 9 horas", category: "sleep", icon: "moon-o", points: 25, target: 9, unit: "horas" },
    
    // Tareas de Pausas Activas
    { id: 11, title: "Completa 2 ciclos de pomodoro", category: "break", icon: "clock-o", points: 10, target: 2, unit: "ciclos" },
    { id: 12, title: "Completa 3 ciclos de pomodoro", category: "break", icon: "clock-o", points: 15, target: 3, unit: "ciclos" },
    { id: 13, title: "Completa 5 ciclos de pomodoro", category: "break", icon: "clock-o", points: 25, target: 5, unit: "ciclos" },
    { id: 14, title: "Haz 3 pausas activas", category: "break", icon: "clock-o", points: 15, target: 3, unit: "pausas" },
    { id: 15, title: "Haz 5 pausas activas", category: "break", icon: "clock-o", points: 25, target: 5, unit: "pausas" },
    
    // Tareas Mixtas
    { id: 16, title: "Bebe 4 vasos Y duerme 6 horas", category: "mixed", icon: "coffee", points: 20, target: { water: 4, sleep: 6 }, unit: "mixto" },
    { id: 17, title: "Bebe 6 vasos Y haz 3 pausas", category: "mixed", icon: "clock-o", points: 25, target: { water: 6, breaks: 3 }, unit: "mixto" },
    { id: 18, title: "Duerme 7 horas Y haz 2 pausas", category: "mixed", icon: "moon-o", points: 25, target: { sleep: 7, breaks: 2 }, unit: "mixto" },
    { id: 19, title: "Completa 4 ciclos Y bebe 5 vasos", category: "mixed", icon: "clock-o", points: 30, target: { cycles: 4, water: 5 }, unit: "mixto" },
    { id: 20, title: "Duerme 8 horas Y bebe 6 vasos", category: "mixed", icon: "moon-o", points: 35, target: { sleep: 8, water: 6 }, unit: "mixto" }
];