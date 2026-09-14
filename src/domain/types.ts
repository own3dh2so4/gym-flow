export type Split =
  | "Full body"
  | "Torso / pierna"
  | "A / B"
  | "Push / pull / legs"
  | "Fuerza"
  | "Hipertrofia"
  | "Fuerza-resistencia";

export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  level: "Base" | "Intermedio";
  cues: string[];
  steps: string[];
  mistakes: string[];
  breathing: string;
  substitution: string;
};

export type WorkoutExercise = {
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string;
  note?: string;
};

export type Workout = {
  id: string;
  name: string;
  focus: string;
  duration: number;
  warmup: string[];
  cooldown: string[];
  exercises: WorkoutExercise[];
};

export type ProgressionWeek = {
  week: number;
  name: string;
  rir: string;
  setAdjustment: number;
  guidance: string;
};

export type MonthlyProgram = {
  month: number;
  name: string;
  tagline: string;
  split: Split;
  days: number;
  color: string;
  description: string;
  goal: string;
  progression: ProgressionWeek[];
  workouts: Workout[];
};
