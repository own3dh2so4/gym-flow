import { MonthlyProgram, ProgressionWeek, Workout, WorkoutExercise } from "../domain/types";

type ExerciseSpec = [string, number, string, string?];

const movement = ([exerciseId, sets, reps, rest = "75 s"]: ExerciseSpec): WorkoutExercise => ({
  exerciseId,
  sets,
  reps,
  rest,
});

const workout = (
  month: number,
  day: number,
  name: string,
  focus: string,
  duration: number,
  specs: ExerciseSpec[],
): Workout => ({
  id: `m${month}d${day}`,
  name: `Día ${day} · ${name}`,
  focus,
  duration,
  warmup: ["5 min de cardio suave", "Movilidad dinámica de las articulaciones que vas a entrenar", "2 series de aproximación del primer ejercicio"],
  cooldown: ["3–5 min de vuelta a la calma", "Respiración lenta y movilidad suave, sin forzar"],
  exercises: specs.map(movement),
});

const progression: ProgressionWeek[] = [
  { week: 1, name: "Ajuste", rir: "RIR 3", setAdjustment: 0, guidance: "Encuentra cargas limpias y termina cada serie con unas 3 repeticiones posibles." },
  { week: 2, name: "Construcción", rir: "RIR 2", setAdjustment: 0, guidance: "Añade 1–2 repeticiones dentro del rango manteniendo la técnica." },
  { week: 3, name: "Progreso", rir: "RIR 1–2", setAdjustment: 0, guidance: "Cuando completes el rango alto, sube la carga un 2,5–5 %." },
  { week: 4, name: "Descarga", rir: "RIR 4", setAdjustment: -1, guidance: "Haz una serie menos por ejercicio y evita acercarte al fallo." },
];

const fullA: ExerciseSpec[] = [
  ["goblet-squat", 3, "8–12", "90 s"], ["chest-press", 3, "8–12", "90 s"],
  ["lat-pulldown", 3, "8–12", "90 s"], ["rdl", 3, "8–10", "120 s"],
  ["lateral-raise", 2, "12–15", "60 s"], ["biceps", 2, "10–15", "60 s"],
  ["triceps", 2, "10–15", "60 s"], ["plank", 3, "30–45 s", "45 s"],
];
const fullB: ExerciseSpec[] = [
  ["leg-press", 3, "10–12", "120 s"], ["incline-press", 3, "8–12", "90 s"],
  ["cable-row", 3, "8–12", "90 s"], ["hip-thrust", 3, "8–12", "120 s"],
  ["face-pull", 2, "12–15", "60 s"], ["leg-curl", 2, "10–15", "60 s"],
  ["calf-raise", 3, "12–15", "60 s"], ["dead-bug", 3, "8–10/lado", "45 s"],
];
const fullC: ExerciseSpec[] = [
  ["split-squat", 3, "8–10/lado", "90 s"], ["shoulder-press", 3, "8–12", "90 s"],
  ["chest-row", 3, "8–12", "90 s"], ["leg-curl", 3, "10–15", "75 s"],
  ["cable-fly", 2, "12–15", "60 s"], ["rear-delt", 2, "12–15", "60 s"],
  ["hammer-curl", 2, "10–15", "60 s"], ["pallof", 3, "10–12/lado", "45 s"],
];
const upperA: ExerciseSpec[] = [
  ["bench-press", 3, "6–10", "120 s"], ["lat-pulldown", 3, "8–12", "90 s"],
  ["incline-press", 3, "8–12", "90 s"], ["cable-row", 3, "8–12", "90 s"],
  ["lateral-raise", 3, "12–15", "60 s"], ["face-pull", 2, "12–15", "60 s"],
  ["biceps", 2, "10–15", "60 s"], ["triceps", 2, "10–15", "60 s"],
];
const upperB: ExerciseSpec[] = [
  ["pull-up", 3, "6–10", "120 s"], ["shoulder-press", 3, "8–10", "90 s"],
  ["chest-row", 3, "8–12", "90 s"], ["chest-press", 3, "10–12", "90 s"],
  ["rear-delt", 3, "12–15", "60 s"], ["cable-fly", 2, "12–15", "60 s"],
  ["hammer-curl", 2, "10–15", "60 s"], ["triceps", 2, "10–15", "60 s"],
];
const lowerA: ExerciseSpec[] = [
  ["back-squat", 3, "6–10", "150 s"], ["rdl", 3, "8–10", "120 s"],
  ["leg-press", 3, "10–12", "90 s"], ["leg-curl", 3, "10–15", "75 s"],
  ["calf-raise", 3, "12–15", "60 s"], ["pallof", 3, "10/lado", "45 s"],
  ["bike", 1, "8 min moderados", "—"],
];
const lowerB: ExerciseSpec[] = [
  ["hip-thrust", 3, "8–12", "120 s"], ["split-squat", 3, "8–10/lado", "90 s"],
  ["leg-extension", 3, "10–15", "75 s"], ["leg-curl", 3, "10–15", "75 s"],
  ["calf-raise", 3, "12–15", "60 s"], ["dead-bug", 3, "10/lado", "45 s"],
  ["rower", 1, "8 min moderados", "—"],
];
const push: ExerciseSpec[] = [
  ["bench-press", 3, "6–10", "120 s"], ["incline-press", 3, "8–12", "90 s"],
  ["shoulder-press", 3, "8–12", "90 s"], ["cable-fly", 2, "12–15", "60 s"],
  ["lateral-raise", 3, "12–15", "60 s"], ["triceps", 3, "10–15", "60 s"],
  ["plank", 3, "30–45 s", "45 s"],
];
const pull: ExerciseSpec[] = [
  ["pull-up", 3, "6–10", "120 s"], ["chest-row", 3, "8–12", "90 s"],
  ["lat-pulldown", 3, "10–12", "90 s"], ["face-pull", 3, "12–15", "60 s"],
  ["rear-delt", 2, "12–15", "60 s"], ["biceps", 3, "10–15", "60 s"],
  ["farmer-carry", 3, "30–40 m", "60 s"],
];
const legs: ExerciseSpec[] = [
  ["back-squat", 3, "6–10", "150 s"], ["rdl", 3, "8–10", "120 s"],
  ["leg-press", 3, "10–12", "90 s"], ["leg-curl", 3, "10–15", "75 s"],
  ["leg-extension", 2, "12–15", "60 s"], ["calf-raise", 3, "12–15", "60 s"],
  ["pallof", 3, "10/lado", "45 s"],
];
const conditioningA: ExerciseSpec[] = [
  ["goblet-squat", 3, "12–15", "60 s"], ["chest-press", 3, "10–15", "60 s"],
  ["cable-row", 3, "10–15", "60 s"], ["hip-thrust", 3, "12–15", "60 s"],
  ["lateral-raise", 2, "15–20", "45 s"], ["farmer-carry", 3, "40 m", "45 s"],
  ["bike", 1, "10 min: 40 s suave / 20 s vivo", "—"],
];
const conditioningB: ExerciseSpec[] = [
  ["split-squat", 3, "10/lado", "60 s"], ["lat-pulldown", 3, "10–15", "60 s"],
  ["incline-press", 3, "10–15", "60 s"], ["leg-curl", 3, "12–15", "60 s"],
  ["face-pull", 2, "15–20", "45 s"], ["dead-bug", 3, "10/lado", "45 s"],
  ["rower", 1, "10 min: 40 s suave / 20 s vivo", "—"],
];

const program = (
  month: number,
  name: string,
  tagline: string,
  split: MonthlyProgram["split"],
  color: string,
  description: string,
  goal: string,
  sessions: Array<[string, string, number, ExerciseSpec[]]>,
): MonthlyProgram => ({
  month,
  name,
  tagline,
  split,
  color,
  description,
  goal,
  days: sessions.length,
  progression,
  workouts: sessions.map(([sessionName, focus, duration, specs], index) =>
    workout(month, index + 1, sessionName, focus, duration, specs)),
});

export const monthlyPrograms: MonthlyProgram[] = [
  program(1, "Base sólida", "Vuelve a moverte bien", "Full body", "coral", "Tres sesiones globales para recuperar técnica, tolerancia y constancia.", "Base técnica y acondicionamiento general", [["Base", "Piernas + empuje", 60, fullA], ["Equilibrio", "Cadena posterior + tracción", 60, fullB], ["Control", "Unilateral + hombros", 60, fullC]]),
  program(2, "Torso / pierna", "Construye frecuencia", "Torso / pierna", "lime", "Cuatro días para estimular cada gran grupo muscular dos veces por semana.", "Fuerza general e hipertrofia moderada", [["Torso A", "Pecho + espalda", 65, upperA], ["Pierna A", "Sentadilla + bisagra", 60, lowerA], ["Torso B", "Espalda + hombros", 65, upperB], ["Pierna B", "Glúteos + unilateral", 60, lowerB]]),
  program(3, "Alternancia A / B", "Simple y efectivo", "A / B", "sky", "Tres días globales alternando patrones para progresar sin acumular fatiga innecesaria.", "Dominio de movimientos básicos", [["A", "Fuerza global", 60, fullA], ["B", "Estabilidad global", 60, fullB], ["A+", "Volumen equilibrado", 60, fullC]]),
  program(4, "Empuja y tira", "Más trabajo, mejor repartido", "Push / pull / legs", "coral", "Un PPL adaptado con cuarto día global para repetir todos los grupos principales.", "Hipertrofia equilibrada", [["Push", "Pecho + hombros + tríceps", 60, push], ["Pull", "Espalda + bíceps", 60, pull], ["Legs", "Pierna completa", 65, legs], ["Full", "Segundo estímulo global", 60, fullB]]),
  program(5, "Fuerza útil", "Hazte fuerte sin perder control", "Fuerza", "lime", "Compuestos con descansos amplios y accesorios suficientes para mantener equilibrio articular.", "Mejorar fuerza en rangos moderados", [["Fuerza A", "Sentadilla + press", 65, fullA.map((item, index) => index < 4 ? [item[0], 3, "6–8", "120 s"] : item)], ["Fuerza B", "Bisagra + tracción", 65, fullB.map((item, index) => index < 4 ? [item[0], 3, "6–8", "120 s"] : item)], ["Fuerza C", "Unilateral + estabilidad", 60, fullC]]),
  program(6, "Volumen sostenible", "Suma sin agotarte", "Hipertrofia", "sky", "Cuatro sesiones de volumen moderado, lejos del fallo y con buena recuperación.", "Acumular unas 8–12 series semanales por grupo principal", [["Torso A", "Empuje horizontal", 65, upperA], ["Pierna A", "Dominante de rodilla", 60, lowerA], ["Torso B", "Tracción y hombro", 65, upperB], ["Pierna B", "Cadena posterior", 60, lowerB]]),
  program(7, "Full body atlético", "Muévete con energía", "Full body", "coral", "Fuerza de cuerpo completo combinada con trabajo cardiovascular breve y controlado.", "Condición física general", [["Potencia base", "Cuerpo completo", 60, [...fullA.slice(0, 6), ["bike", 1, "8 min moderados", "—"]]], ["Capacidad", "Cuerpo completo", 60, conditioningB], ["Resistencia", "Cuerpo completo", 60, conditioningA]]),
  program(8, "Torso / pierna 2.0", "Consolida tus marcas", "Torso / pierna", "lime", "Una segunda exposición al split con variantes para evitar estancamiento.", "Progresar cargas manteniendo la técnica", [["Torso mixto", "Pecho + espalda", 65, upperB], ["Pierna posterior", "Glúteos + isquios", 60, lowerB], ["Torso completo", "Espalda + empuje", 65, upperA], ["Pierna completa", "Cuádriceps + core", 60, lowerA]]),
  program(9, "Fuerza equilibrada", "Fuerte de arriba abajo", "Torso / pierna", "sky", "Cuatro días completos con ocho ejercicios de torso y siete de pierna para progresar todo el mes.", "Fuerza e hipertrofia con frecuencia dos", [["Torso fuerte", "Pecho + espalda + brazos", 70, upperA], ["Pierna fuerte", "Sentadilla + cadena posterior", 65, lowerA], ["Torso volumen", "Espalda + hombros + pecho", 70, upperB], ["Pierna volumen", "Glúteos + cuádriceps + core", 65, lowerB]]),
  program(10, "A / B progresivo", "Menos días, máxima cobertura", "A / B", "coral", "Tres sesiones amplias que cubren todos los patrones y encajan en semanas ocupadas.", "Mantener fuerza y masa muscular", [["A", "Rodilla + empuje", 60, fullA], ["B", "Cadera + tracción", 60, fullB], ["C", "Unilateral + estabilidad", 60, fullC]]),
  program(11, "Fuerza-resistencia", "Trabaja y respira", "Fuerza-resistencia", "lime", "Descansos moderados, rangos amplios y cardio breve sin convertir la técnica en una carrera.", "Capacidad de trabajo y salud cardiovascular", [["Circuito controlado A", "Global + bicicleta", 60, conditioningA], ["Circuito controlado B", "Global + remo", 60, conditioningB], ["Fuerza de apoyo", "Compuestos y core", 60, fullC]]),
  program(12, "Cierre del ciclo", "Mide cuánto has avanzado", "Full body", "sky", "Repite patrones conocidos, registra cargas limpias y termina el año con una descarga real.", "Consolidación y revisión de progreso", [["Referencia A", "Repite tus básicos", 60, fullA], ["Referencia B", "Repite tus variantes", 60, fullB], ["Referencia C", "Equilibrio final", 60, fullC]]),
];

export const getCurrentProgram = (): MonthlyProgram =>
  monthlyPrograms[new Date().getMonth()] ?? monthlyPrograms[0];
