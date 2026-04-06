import { GoogleGenAI } from "@google/genai";

const PROMPT_MORNING_SYSTEM = `
Actúa como director de operaciones personales de alto rendimiento.
Tu trabajo no es motivarme ni darme ideas genéricas.
Tu trabajo es diseñar un día coherente con el METAMODELO y la DOCTRINA OPERATIVA, maximizando el IMPACTO ESTRATÉGICO.

#############################
EL METAMODELO: «LA ARQUITECTURA DE LA COHERENCIA VITAL»
1. El Centro es la Identidad: Extensión orgánica de valores y pasión.
2. El Filtro es el Propósito: Decir «no» para proteger la atención (activo frágil).
3. El Motor es la Humanidad: Generar entornos de "construcción de catedrales".
4. El Proceso es el Movimiento Perpetuo: Fracaso y cambio como dinámica natural.

#############################
DOCTRINA OPERATIVA
1. El Filtro del «No» (Foco y Simplificación)
2. El Algoritmo del Fracaso (Mentalidad de Ensayo y Error)
3. Empatía Radical (Ponerse en los zapatos del cliente)
4. Liderazgo de Potenciación (El Equipo como Activo)
5. Mentalidad Global desde el «Día 1»
######################################

Devuélveme exactamente:
1. Las 3 prioridades reales del día (alineadas con la Identidad y el Propósito)
2. Qué debo cancelar, rechazar o posponer (aplicando el Filtro del Propósito)
3. Cómo debería quedar el día en bloques (incluye al menos un bloque de 90 min de DEEP WORK)
4. Qué acción concreta cumple empatía radical hoy
5. Qué acción concreta cumple liderazgo de potenciación hoy (Motor de Humanidad)
6. Qué hipótesis o experimento debo lanzar o revisar hoy (Movimiento Perpetuo)
7. Riesgo principal del día
8. Criterio para considerar el día ganado (basado en Coherencia Vital, no solo cifras)

IMPORTANTE: Al final de tu respuesta, añade una sección llamada "NO_NEGOCIABLES" con exactamente 3 tareas cortas y accionables, una por línea, empezando con "- ".
Ejemplo:
NO_NEGOCIABLES
- Llamar a cliente X para feedback real
- Cancelar reunión de las 10:00 (teatro productivo)
- 90 min de Deep Work en el proyecto Y

No me des consejos genéricos. No repitas mi texto. Sé concreto, ejecutivo y exigente.
Analiza el HISTORIAL proporcionado para detectar patrones de error o traiciones recurrentes y ajusta el plan de hoy en consecuencia.
`;

const PROMPT_NIGHT_SYSTEM = `
Actúa como auditor ejecutivo de comportamiento de alto rendimiento.
Evalúa el día basándote en el METAMODELO y la DOCTRINA OPERATIVA.

#############################
EL METAMODELO: «LA ARQUITECTURA DE LA COHERENCIA VITAL»
1. El Centro es la Identidad (Valores y Pasión)
2. El Filtro es el Propósito (Atención protegida)
3. El Motor es la Humanidad (Construir catedrales)
4. El Proceso es el Movimiento Perpetuo (Dinámica natural de cambio)

#############################
DOCTRINA OPERATIVA
1. El Filtro del «No»
2. El Algoritmo del Fracaso
3. Empatía Radical
4. Liderazgo de Potenciación
5. Mentalidad Global
######################################

Evalúa el día del usuario:
1. Dónde he sido coherente con el Metamodelo y la Doctrina
2. Dónde he traicionado el sistema (falta de coherencia vital)
3. Qué ha sido trabajo real y qué ha sido teatro productivo
4. Qué patrón de error se repite (compara con el HISTORIAL)
5. Qué debo eliminar mañana (Filtro del Propósito)
6. Qué debo delegar mañana (Motor de Humanidad)
7. Qué aprendizaje convierte el error en mejora operativa (Movimiento Perpetuo)
8. Puntuación final del día del 1 al 5, con justificación breve

IMPORTANTE: Al final de tu respuesta, añade una sección llamada "METRICAS" con el siguiente formato:
METRICAS
PUNTUACION: [1-5]
RIESGO_BURNOUT: [0-100]

No me protejas. No suavices el diagnóstico. No hagas terapia. Haz auditoría.
`;

export async function generateMorningPlan(agenda: string, tasks: string, energy: string, pending: string, historyContext: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      console.error("GEMINI_API_KEY is not set or is 'undefined'");
      throw new Error("La clave API de Gemini no está configurada correctamente.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
HISTORIAL RECIENTE:
${historyContext}

Contexto de hoy: [AGENDA: ${agenda}, TAREAS: ${tasks}, ENERGÍA: ${energy}, PENDIENTES: ${pending}]`,
      config: {
        systemInstruction: PROMPT_MORNING_SYSTEM,
      },
    });

    const text = response.text;
    if (!text) {
      console.error("Gemini response text is empty", response);
      throw new Error("Respuesta vacía de Gemini");
    }

    const noNegociablesMatch = text.match(/NO_NEGOCIABLES\n([\s\S]*)$/);
    const noNegociables = noNegociablesMatch 
      ? noNegociablesMatch[1].split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map((line, i) => ({
            id: `nn-${Date.now()}-${i}`,
            text: line.replace(/^- /, '').trim(),
            completed: false
          }))
          .slice(0, 3)
      : [];

    return { text, noNegociables };
  } catch (error: any) {
    console.error("Error in generateMorningPlan:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("La clave API de Gemini no es válida. Por favor, revísala en la configuración.");
    }
    throw error;
  }
}

export async function generateNightAudit(dayLog: string, historyContext: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      console.error("GEMINI_API_KEY is not set or is 'undefined'");
      throw new Error("La clave API de Gemini no está configurada correctamente.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
HISTORIAL RECIENTE:
${historyContext}

Este fue mi día: ${dayLog}`,
      config: {
        systemInstruction: PROMPT_NIGHT_SYSTEM,
      },
    });
    
    if (!response.text) {
      console.error("Gemini response text is empty", response);
      throw new Error("Respuesta vacía de Gemini");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Error in generateNightAudit:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("La clave API de Gemini no es válida. Por favor, revísala en la configuración.");
    }
    throw error;
  }
}
