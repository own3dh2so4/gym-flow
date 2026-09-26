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

export type MuscleId =
  | "pecs"
  | "frontDelt"
  | "sideDelt"
  | "rearDelt"
  | "triceps"
  | "biceps"
  | "brachialis"
  | "forearm"
  | "lats"
  | "midBack"
  | "traps"
  | "abs"
  | "obliques"
  | "erectors"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "adductors"
  | "abductors"
  | "calves";

export type Point = { x: number; y: number };

type LimbShape = { end?: number; scale?: number; lowerScale?: number };
export type FkLimb = LimbShape & { upper: number; lower: number };
export type IkLimb = LimbShape & { target: Point; bend: 1 | -1; frame?: "torso" };
export type LimbPose = FkLimb | IkLimb;

export type Pose = {
  pelvis: Point;
  torso: number;
  head?: number;
  armNear: LimbPose;
  armFar: LimbPose;
  legNear: LimbPose;
  legFar: LimbPose;
};

export type Joint =
  | "pelvis"
  | "neck"
  | "head"
  | "shoulderNear"
  | "shoulderFar"
  | "elbowNear"
  | "elbowFar"
  | "wristNear"
  | "wristFar"
  | "handNear"
  | "handFar"
  | "hipNear"
  | "hipFar"
  | "kneeNear"
  | "kneeFar"
  | "ankleNear"
  | "ankleFar"
  | "toeNear"
  | "toeFar";

export type Effort = "concentric" | "eccentric" | "isometric";

export type Keyframe = {
  pose: Pose;
  duration: number;
  hold?: number;
  holdLabel?: string;
  label: string;
  effort: Effort;
  active?: MuscleId[];
  arrow?: Joint;
  ease?: "linear" | "inOut";
};

export type Anchor =
  | Point
  | { joint: Joint; dx?: number; dy?: number }
  | { between: [Joint, Joint]; t: number; offset?: number };

export type PropTone = "ink" | "steel" | "light" | "pad" | "cable";

export type Prop = { layer?: "back" | "mid" | "front" } & (
  | { kind: "line"; from: Anchor; to: Anchor; width: number; tone: PropTone }
  | { kind: "rect"; at: Anchor; w: number; h: number; angle?: number; radius?: number; tone: PropTone }
  | { kind: "circle"; at: Anchor; r: number; tone: PropTone }
  | { kind: "polygon"; points: Point[]; tone: PropTone }
  | { kind: "barbell"; at: Anchor; span?: [Anchor, Anchor] }
  | { kind: "dumbbell"; at: Anchor; orient: "end" | "side" | "vertical" | "grip"; along?: [Joint, Joint] }
);

export type AnimationView = "side" | "front" | "back" | "top";

export type ExerciseAnimation = {
  exerciseId: string;
  view: AnimationView;
  summary: string;
  cue: string;
  props: Prop[];
  keyframes: Keyframe[];
  primary: MuscleId[];
  secondary: MuscleId[];
  arrow: Joint;
  arrowOffset?: Point;
  trace?: Joint;
  guide?: [Joint, Joint];
  floor?: number;
};
