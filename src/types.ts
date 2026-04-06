export interface DailyData {
  date: string;
  morningInput?: {
    agenda: string;
    tasks: string;
    energy: string;
    pending: string;
  };
  morningOutput?: string;
  noNegociables?: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  cognitiveChecklist: {
    [key: string]: boolean;
  };
  deepWorkSessions?: {
    startTime: number;
    duration: number; // minutes
    focusQuality: number; // 1-10
  }[];
  impactMatrix?: {
    taskId: string;
    impact: 'high' | 'low';
    effort: 'high' | 'low';
  }[];
  nightInput?: string;
  nightOutput?: string;
  score?: number; // Extracted score 1-5
  burnoutRisk?: number; // 0-100
}

export interface AppState {
  history: { [date: string]: DailyData };
  currentDate: string;
}

export const COGNITIVE_STEPS = [
  { 
    id: 'activation', 
    label: 'Activación Fisiológica', 
    phase: 'MAÑANA',
    description: 'Luz solar directa, gran vaso de agua y 3 min de Gateo Cruzado para sincronizar hemisferios.'
  },
  { 
    id: 'deep_work_1', 
    label: 'Trabajo Profundo 1', 
    phase: 'MAÑANA',
    description: '90 min ininterrumpidos. Cero redes sociales. Resolver los problemas más difíciles del día.'
  },
  { 
    id: 'pause_1', 
    label: 'Pausa Estratégica', 
    phase: 'MAÑANA',
    description: '20 min de descanso pasivo sin pantallas. El cerebro consolida lo aprendido a 20x velocidad.'
  },
  { 
    id: 'deep_work_2', 
    label: 'Trabajo Profundo 2', 
    phase: 'MAÑANA',
    description: '40 min de alta exigencia para creatividad y estrategia. Uso del método Look, Snap, Connect.'
  },
  { 
    id: 'mind_fuel', 
    label: 'Combustible MIND', 
    phase: 'MEDIODÍA',
    description: 'Vegetales de hoja verde, pescado/pollo, granos enteros. Evitar carbohidratos pesados.'
  },
  { 
    id: 'maintenance', 
    label: 'Mantenimiento y Gestión', 
    phase: 'MEDIODÍA',
    description: 'Tareas reactivas: emails, reuniones rutinarias, organizar agenda. Baja resistencia cognitiva.'
  },
  { 
    id: 'restart', 
    label: 'El "Re-Start"', 
    phase: 'TARDE',
    description: '5 min de escaleras o agua fría para bombear sangre al hipocampo y romper la letargia.'
  },
  { 
    id: 'learning', 
    label: 'Aprendizaje Deliberado', 
    phase: 'TARDE',
    description: 'Forzar el error en una habilidad nueva. Festejar la frustración como señal de plasticidad.'
  },
  { 
    id: 'schulte', 
    label: 'Tablas de Schulte', 
    phase: 'TARDE',
    description: '10 min de entrenamiento visual y funciones ejecutivas para acelerar el procesamiento.'
  },
  { 
    id: 'social', 
    label: 'Interacción Social', 
    phase: 'TARDE',
    description: 'Networking o colaboración creativa. Uso del circuito social como neuroprotección.'
  },
  { 
    id: 'exercise', 
    label: 'Ejercicio + Malabares', 
    phase: 'NOCHE',
    description: '40 min de deporte + 10 min de malabares para aumentar BDNF y materia blanca.'
  },
  { 
    id: 'mind_dinner', 
    label: 'Cena MIND', 
    phase: 'NOCHE',
    description: 'Cena ligera. Apagar pantallas brillantes a las 21:30 para iniciar la desaceleración.'
  },
  { 
    id: 'reading', 
    label: 'Lectura y Meditación', 
    phase: 'NOCHE',
    description: '15 min lectura en voz alta + 15 min meditación para bajar cortisol y estimular la prefrontal.'
  },
  { 
    id: 'sleep_prep', 
    label: 'Preparación Sueño', 
    phase: 'NOCHE',
    description: 'Entorno oscuro, frío y silencioso. Dormido a las 23:00 para el cableado neuronal.'
  },
];

export const DOCTRINA_OPERATIVA = `
1. El Filtro del «No» (Foco y Simplificación)
2. El Algoritmo del Fracaso (Mentalidad de Ensayo y Error)
3. Empatía Radical (Ponerse en los zapatos del cliente)
4. Liderazgo de Potenciación (El Equipo como Activo)
5. Mentalidad Global desde el «Día 1»
`;
