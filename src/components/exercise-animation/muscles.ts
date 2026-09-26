import { AnimationView, MuscleId } from "../../domain/types";

export type BodySegment = "torso" | "upperArm" | "forearm" | "thigh" | "shin";

export type MusclePatch = {
  muscle: MuscleId;
  segment: BodySegment;
  t0: number;
  t1: number;
  side: number;
  width: number;
};

type PatchSpec = [MuscleId, BodySegment, number, number, number, number];

const patches = (specs: PatchSpec[]): MusclePatch[] =>
  specs.map(([muscle, segment, t0, t1, side, width]) => ({ muscle, segment, t0, t1, side, width }));

export const musclePatches: Record<AnimationView, MusclePatch[]> = {
  side: patches([
    ["glutes", "torso", -0.14, 0.22, -0.75, 1.1],
    ["glutes", "thigh", -0.08, 0.3, -0.5, 1.3],
    ["hamstrings", "thigh", 0.22, 0.95, -0.42, 1.0],
    ["quads", "thigh", 0.2, 0.94, 0.38, 1.1],
    ["adductors", "thigh", 0.12, 0.6, -0.02, 0.55],
    ["abductors", "torso", -0.12, 0.16, -0.25, 0.9],
    ["calves", "shin", 0.06, 0.58, -0.45, 1.35],
    ["erectors", "torso", 0.04, 0.62, -0.72, 0.6],
    ["abs", "torso", 0.1, 0.62, 0.6, 0.9],
    ["obliques", "torso", 0.14, 0.56, 0.05, 0.8],
    ["lats", "torso", 0.36, 0.84, -0.35, 0.95],
    ["midBack", "torso", 0.6, 0.92, -0.72, 0.75],
    ["traps", "torso", 0.84, 1.08, -0.55, 0.9],
    ["pecs", "torso", 0.64, 0.93, 0.62, 1.0],
    ["frontDelt", "upperArm", -0.12, 0.36, 0.45, 1.2],
    ["sideDelt", "upperArm", -0.14, 0.34, 0, 1.3],
    ["rearDelt", "upperArm", -0.12, 0.36, -0.45, 1.2],
    ["biceps", "upperArm", 0.3, 0.9, 0.42, 1.1],
    ["triceps", "upperArm", 0.24, 0.94, -0.45, 1.1],
    ["brachialis", "upperArm", 0.55, 0.98, 0.12, 0.75],
    ["brachialis", "forearm", -0.02, 0.28, 0.3, 0.9],
    ["forearm", "forearm", 0.02, 0.64, 0.15, 1.4],
  ]),
  front: patches([
    ["quads", "thigh", 0.16, 0.9, 0.08, 1.2],
    ["quads", "thigh", 0.6, 0.94, -0.45, 0.85],
    ["adductors", "thigh", 0.04, 0.55, -0.62, 0.8],
    ["abductors", "torso", -0.14, 0.12, 0.88, 0.45],
    ["abductors", "thigh", -0.05, 0.35, 0.62, 0.7],
    ["calves", "shin", 0.08, 0.5, -0.55, 0.75],
    ["calves", "shin", 0.1, 0.45, 0.55, 0.6],
    ["abs", "torso", 0.1, 0.68, 0, 0.75],
    ["obliques", "torso", 0.14, 0.58, 0.72, 0.45],
    ["lats", "torso", 0.42, 0.84, 0.86, 0.5],
    ["pecs", "torso", 0.66, 0.93, 0.45, 0.8],
    ["traps", "torso", 0.9, 1.1, 0.5, 0.45],
    ["frontDelt", "upperArm", -0.14, 0.32, -0.25, 1.2],
    ["sideDelt", "upperArm", -0.16, 0.32, 0.45, 1.2],
    ["biceps", "upperArm", 0.26, 0.9, 0, 1.1],
    ["brachialis", "upperArm", 0.6, 0.96, 0.5, 0.6],
    ["triceps", "upperArm", 0.26, 0.9, 0.72, 0.6],
    ["forearm", "forearm", 0.02, 0.62, 0, 1.4],
  ]),
  top: patches([
    ["frontDelt", "upperArm", -0.16, 0.3, 0, 1.3],
    ["sideDelt", "upperArm", -0.16, 0.3, 0, 1.3],
    ["rearDelt", "upperArm", -0.16, 0.3, 0, 1.3],
    ["biceps", "upperArm", 0.3, 0.9, 0, 1],
    ["triceps", "upperArm", 0.3, 0.9, 0, 1],
    ["forearm", "forearm", 0.02, 0.6, 0, 1.3],
  ]),
  back: patches([
    ["traps", "torso", 0.72, 1.1, 0, 1.0],
    ["midBack", "torso", 0.58, 0.88, 0.38, 0.45],
    ["lats", "torso", 0.34, 0.8, 0.6, 0.7],
    ["erectors", "torso", 0.04, 0.56, 0.16, 0.3],
    ["glutes", "torso", -0.16, 0.16, 0.5, 0.9],
    ["abductors", "torso", -0.1, 0.18, 0.82, 0.45],
    ["obliques", "torso", 0.14, 0.5, 0.85, 0.3],
    ["rearDelt", "upperArm", -0.16, 0.32, 0.1, 1.3],
    ["sideDelt", "upperArm", -0.16, 0.3, 0.6, 1.0],
    ["triceps", "upperArm", 0.2, 0.92, 0, 1.1],
    ["forearm", "forearm", 0.02, 0.62, 0, 1.3],
    ["hamstrings", "thigh", 0.16, 0.92, 0, 1.2],
    ["calves", "shin", 0.04, 0.52, 0, 1.3],
  ]),
};

type Spot = [across: number, forward: number, rx: number, ry: number];

export const topTorsoSpots: Partial<Record<MuscleId, Spot>> = {
  pecs: [7.5, 5, 7, 4.5],
  abs: [0, 8.5, 4.5, 2.5],
  obliques: [16, 3, 4, 4],
  lats: [16, -4, 4, 4.5],
  midBack: [6, -6, 5, 3.5],
  traps: [8, -2, 6, 4],
  erectors: [2.5, -9, 2, 2.5],
};

export const muscleNames: Record<MuscleId, string> = {
  pecs: "Pectoral",
  frontDelt: "Deltoides anterior",
  sideDelt: "Deltoides lateral",
  rearDelt: "Deltoides posterior",
  triceps: "Tríceps",
  biceps: "Bíceps",
  brachialis: "Braquial",
  forearm: "Antebrazo",
  lats: "Dorsal ancho",
  midBack: "Romboides y trapecio medio",
  traps: "Trapecio",
  abs: "Recto abdominal",
  obliques: "Oblicuos",
  erectors: "Erectores espinales",
  glutes: "Glúteos",
  quads: "Cuádriceps",
  hamstrings: "Isquiotibiales",
  adductors: "Aductores",
  abductors: "Glúteo medio",
  calves: "Gemelos y sóleo",
};
