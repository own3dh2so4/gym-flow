import { Effort, ExerciseAnimation, FkLimb, IkLimb, Keyframe, Point, Pose, Prop } from "../domain/types";

const FLOOR = 222;
const ANKLE = FLOOR - 8;
const CCW = 1;
const CW = -1;

type LimbExtra = Pick<FkLimb, "end" | "scale" | "lowerScale">;

const fk = (upper: number, lower: number, extra: LimbExtra = {}): FkLimb => ({ upper, lower, ...extra });
const ik = (x: number, y: number, bend: 1 | -1, extra: LimbExtra = {}): IkLimb => ({ target: { x, y }, bend, ...extra });
const grip = (x: number, y: number, bend: 1 | -1, extra: LimbExtra = {}): IkLimb => ({ ...ik(x, y, bend, extra), frame: "torso" });

const keyframe = (
  pose: Pose,
  duration: number,
  label: string,
  effort: Effort,
  extra: Partial<Omit<Keyframe, "pose" | "duration" | "label" | "effort">> = {},
): Keyframe => ({ pose, duration, label, effort, ...extra });

const at = (x: number, y: number): Point => ({ x, y });

const bench = (x: number, top: number, width: number, height = FLOOR - top): Prop[] => [
  { kind: "line", from: at(x - width / 2 + 8, top + 4), to: at(x - width / 2 + 8, FLOOR), width: 4, tone: "steel" },
  { kind: "line", from: at(x + width / 2 - 8, top + 4), to: at(x + width / 2 - 8, FLOOR), width: 4, tone: "steel" },
  { kind: "rect", at: at(x, top + Math.min(height, 10) / 2), w: width, h: Math.min(height, 10), radius: 3, tone: "pad" },
];

const column = (x: number, pulleyY: number): Prop[] => [
  { kind: "rect", at: at(x, 120), w: 12, h: 204, radius: 2, tone: "light" },
  { kind: "circle", at: at(x - 8, pulleyY), r: 5, tone: "steel" },
];

const squatStand: Pose = {
  pelvis: at(153, 139),
  torso: 178,
  head: 180,
  armNear: grip(-10, 1, CCW, { scale: 0.8, lowerScale: 0.8 }),
  armFar: grip(-10, 1, CCW, { scale: 0.8, lowerScale: 0.8 }),
  legNear: ik(157, ANKLE, CCW),
  legFar: ik(154, ANKLE, CCW),
};

const backSquat: ExerciseAnimation = {
  exerciseId: "back-squat",
  view: "side",
  summary: "Sentadilla con barra vista de lado: la cadera baja hacia atrás y abajo hasta que el muslo queda paralelo mientras la barra baja en línea recta sobre el mediopié.",
  cue: "Rodillas en la línea de los pies, pecho alto",
  props: [
    { kind: "line", from: at(208, 60), to: at(208, FLOOR), width: 5, tone: "light" },
    { kind: "line", from: at(200, 124), to: at(212, 124), width: 4, tone: "steel" },
    { kind: "barbell", at: { joint: "handNear" } },
  ],
  keyframes: [
    keyframe(squatStand, 2.8, "Baja · 3 s", "eccentric", { hold: 0.5, holdLabel: "Fija el tronco" }),
    keyframe(
      { ...squatStand, pelvis: at(134, 179), torso: 136, head: 158 },
      1.3,
      "Sube empujando el suelo",
      "concentric",
      { hold: 0.2 },
    ),
  ],
  primary: ["quads", "glutes"],
  secondary: ["adductors", "erectors"],
  arrow: "pelvis",
  trace: "handNear",
};

const gobletStand: Pose = {
  pelvis: at(153, 139),
  torso: 180,
  head: 180,
  armNear: grip(20, -10, CW),
  armFar: grip(20, -10, CW),
  legNear: ik(157, ANKLE, CCW),
  legFar: ik(154, ANKLE, CCW),
};

const gobletSquat: ExerciseAnimation = {
  exerciseId: "goblet-squat",
  view: "side",
  summary: "Sentadilla goblet vista de lado: la mancuerna se mantiene pegada al pecho y la cadera baja entre los talones con el tronco erguido.",
  cue: "Pecho alto, codos entre las rodillas",
  props: [{ kind: "dumbbell", at: { joint: "handNear", dx: 2 }, orient: "vertical", layer: "front" }],
  keyframes: [
    keyframe(gobletStand, 2.8, "Baja · 3 s", "eccentric", { hold: 0.4 }),
    keyframe({ ...gobletStand, pelvis: at(141, 181), torso: 156, head: 170 }, 1.3, "Sube con el pecho alto", "concentric", {
      hold: 0.8,
      holdLabel: "Pausa abajo",
    }),
  ],
  primary: ["quads", "glutes"],
  secondary: ["adductors", "abs"],
  arrow: "pelvis",
  trace: "handNear",
};

const legPressTop: Pose = {
  pelvis: at(112, 176),
  torso: 228,
  head: 205,
  armNear: ik(110, 182, CW),
  armFar: ik(108, 182, CW),
  legNear: ik(160, 118, CCW, { end: 225 }),
  legFar: ik(157, 120, CCW, { end: 225 }),
};

const legPress: ExerciseAnimation = {
  exerciseId: "leg-press",
  view: "side",
  summary: "Prensa de piernas a 45 grados vista de lado: la plataforma baja por el raíl hasta flexionar las rodillas unos 90 grados con la pelvis apoyada, y vuelve a subir sin bloquear las rodillas.",
  cue: "Pelvis pegada al respaldo, empuja con todo el pie",
  props: [
    { kind: "line", from: at(150, 160), to: at(236, 74), width: 5, tone: "steel" },
    { kind: "line", from: at(236, 74), to: at(236, FLOOR), width: 6, tone: "light" },
    { kind: "line", from: at(118, 196), to: at(118, FLOOR), width: 6, tone: "light" },
    { kind: "line", from: at(60, FLOOR), to: at(240, FLOOR), width: 6, tone: "steel" },
    { kind: "line", from: at(106, 190), to: at(64, 150), width: 11, tone: "pad" },
    { kind: "line", from: at(104, 191), to: at(134, 194), width: 9, tone: "pad" },
    { kind: "rect", at: { between: ["ankleNear", "toeNear"], t: 0.4, offset: -12 }, w: 7, h: 44, angle: -45, radius: 2, tone: "ink", layer: "front" },
  ],
  keyframes: [
    keyframe(legPressTop, 2.8, "Baja · 3 s", "eccentric", { hold: 0.3 }),
    keyframe(
      { ...legPressTop, legNear: ik(142, 137, CCW, { end: 225 }), legFar: ik(139, 139, CCW, { end: 225 }) },
      1.3,
      "Empuja sin bloquear las rodillas",
      "concentric",
      { hold: 0.2 },
    ),
  ],
  primary: ["quads", "glutes"],
  secondary: ["adductors"],
  arrow: "ankleNear",
};

const splitTop: Pose = {
  pelvis: at(152, 146),
  torso: 172,
  head: 178,
  armNear: fk(2, 2),
  armFar: fk(-2, -1),
  legNear: ik(186, ANKLE, CCW),
  legFar: ik(90, 170, CCW, { end: -60 }),
};

const splitSquat: ExerciseAnimation = {
  exerciseId: "split-squat",
  view: "side",
  summary: "Sentadilla búlgara vista de lado: el pie trasero apoya el empeine en el banco y la cadera baja en vertical sobre la pierna delantera.",
  cue: "Baja recto, empuja con el talón delantero",
  props: [
    ...bench(78, 176, 64),
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "side" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "side", layer: "front" },
  ],
  keyframes: [
    keyframe(splitTop, 2.8, "Baja recto · 3 s", "eccentric", { hold: 0.3 }),
    keyframe({ ...splitTop, pelvis: at(148, 177), torso: 166, head: 174 }, 1.3, "Sube empujando con el pie delantero", "concentric", {
      hold: 0.2,
    }),
  ],
  primary: ["quads", "glutes"],
  secondary: ["adductors", "hamstrings"],
  arrow: "pelvis",
  arrowOffset: at(-28, -10),
};

const extensionStart: Pose = {
  pelvis: at(128, 162),
  torso: 186,
  head: 182,
  armNear: ik(134, 166, CW),
  armFar: ik(132, 166, CW),
  legNear: fk(88, 2),
  legFar: fk(88, 0),
};

const legExtension: ExerciseAnimation = {
  exerciseId: "leg-extension",
  view: "side",
  summary: "Extensión de cuádriceps en máquina vista de lado: con la cadera fija en el asiento, la rodilla se extiende hasta casi estirar la pierna y baja despacio.",
  cue: "Estira y aprieta el cuádriceps sin levantar la cadera",
  props: [
    { kind: "rect", at: at(98, 150), w: 10, h: 70, radius: 3, tone: "pad", angle: 6 },
    { kind: "rect", at: at(136, 176), w: 64, h: 10, radius: 3, tone: "pad" },
    { kind: "line", from: at(136, 181), to: at(136, FLOOR), width: 6, tone: "steel" },
    { kind: "line", from: at(96, FLOOR), to: at(186, FLOOR), width: 5, tone: "steel" },
    { kind: "line", from: { joint: "kneeNear" }, to: { between: ["kneeNear", "ankleNear"], t: 1.05, offset: 9 }, width: 4, tone: "steel", layer: "front" },
    { kind: "circle", at: { between: ["kneeNear", "ankleNear"], t: 0.92, offset: 8 }, r: 6, tone: "pad", layer: "front" },
    { kind: "circle", at: { joint: "kneeNear" }, r: 3, tone: "ink", layer: "front" },
  ],
  keyframes: [
    keyframe(extensionStart, 1.3, "Extiende la rodilla", "concentric", { hold: 0.3 }),
    keyframe({ ...extensionStart, legNear: fk(88, 80), legFar: fk(88, 78) }, 2.8, "Baja lento · 3 s", "eccentric", {
      hold: 1,
      holdLabel: "Aprieta 1 s",
    }),
  ],
  primary: ["quads"],
  secondary: [],
  arrow: "ankleNear",
};

const rdlStand: Pose = {
  pelvis: at(151, 138),
  torso: 178,
  head: 180,
  armNear: fk(0, 0),
  armFar: fk(-2, -2),
  legNear: ik(155, ANKLE, CCW),
  legFar: ik(152, ANKLE, CCW),
};

const rdl: ExerciseAnimation = {
  exerciseId: "rdl",
  view: "side",
  summary: "Peso muerto rumano visto de lado: las rodillas quedan fijas y ligeramente flexionadas, la cadera se desplaza hacia atrás con la espalda neutra y la barra baja pegada a las piernas.",
  cue: "Cadera atrás, barra pegada a las piernas",
  props: [{ kind: "barbell", at: { joint: "handNear" } }],
  keyframes: [
    keyframe(rdlStand, 3, "Cadera atrás · 3 s", "eccentric", { hold: 0.4 }),
    keyframe(
      { ...rdlStand, pelvis: at(124, 145), torso: 108, head: 116, armNear: fk(-10, -10), armFar: fk(-12, -12) },
      1.3,
      "Cadera al frente, aprieta glúteos",
      "concentric",
      { hold: 0.8, holdLabel: "Siente el estiramiento" },
    ),
  ],
  primary: ["hamstrings", "glutes"],
  secondary: ["erectors"],
  arrow: "pelvis",
  arrowOffset: at(-16, -32),
  trace: "handNear",
};

const thrustBottom: Pose = {
  pelvis: at(119, 205),
  torso: 228,
  head: 205,
  armNear: grip(16, -40, CW),
  armFar: grip(16, -40, CW),
  legNear: ik(170, ANKLE, CCW),
  legFar: ik(167, ANKLE, CCW),
};

const hipThrust: ExerciseAnimation = {
  exerciseId: "hip-thrust",
  view: "side",
  summary: "Hip thrust visto de lado: la parte alta de la espalda apoya en el banco y la cadera sube hasta dejar el tronco horizontal con las tibias verticales.",
  cue: "Costillas abajo, mentón recogido, aprieta glúteos",
  props: [...bench(62, 184, 64), { kind: "barbell", at: { between: ["pelvis", "neck"], t: 0.02, offset: -14 } }],
  keyframes: [
    keyframe(thrustBottom, 1.2, "Sube empujando con los talones", "concentric", { hold: 0.3 }),
    keyframe({ ...thrustBottom, pelvis: at(131, 178), torso: 268, head: 232 }, 2, "Baja con control", "eccentric", {
      hold: 1.5,
      holdLabel: "Aprieta glúteos arriba",
    }),
  ],
  primary: ["glutes"],
  secondary: ["hamstrings"],
  arrow: "pelvis",
  arrowOffset: at(27, 12),
};

const curlStart: Pose = {
  pelvis: at(126, 164),
  torso: 188,
  head: 184,
  armNear: ik(134, 166, CW),
  armFar: ik(132, 166, CW),
  legNear: fk(88, 78),
  legFar: fk(88, 76),
};

const legCurl: ExerciseAnimation = {
  exerciseId: "leg-curl",
  view: "side",
  summary: "Curl femoral sentado visto de lado: con el muslo sujeto bajo el rodillo, la rodilla se flexiona llevando los talones hacia atrás y vuelve despacio.",
  cue: "Talones hacia el glúteo, cadera quieta",
  props: [
    { kind: "rect", at: at(96, 150), w: 10, h: 70, radius: 3, tone: "pad", angle: 8 },
    { kind: "rect", at: at(134, 178), w: 64, h: 10, radius: 3, tone: "pad" },
    { kind: "line", from: at(134, 183), to: at(134, FLOOR), width: 6, tone: "steel" },
    { kind: "line", from: at(94, FLOOR), to: at(176, FLOOR), width: 5, tone: "steel" },
    { kind: "rect", at: { between: ["pelvis", "kneeNear"], t: 0.82, offset: -12 }, w: 18, h: 9, radius: 4, tone: "pad", layer: "front" },
    { kind: "line", from: { joint: "kneeNear" }, to: { between: ["kneeNear", "ankleNear"], t: 1.05, offset: -9 }, width: 4, tone: "steel", layer: "front" },
    { kind: "circle", at: { between: ["kneeNear", "ankleNear"], t: 0.92, offset: -8 }, r: 6, tone: "pad", layer: "front" },
    { kind: "circle", at: { joint: "kneeNear" }, r: 3, tone: "ink", layer: "front" },
  ],
  keyframes: [
    keyframe(curlStart, 1.3, "Talones hacia atrás", "concentric", { hold: 0.3 }),
    keyframe({ ...curlStart, legNear: fk(88, -26), legFar: fk(88, -28) }, 2.8, "Vuelve lento · 3 s", "eccentric", {
      hold: 0.5,
      holdLabel: "Aprieta",
    }),
  ],
  primary: ["hamstrings"],
  secondary: ["calves"],
  arrow: "ankleNear",
};

const calfPose = (ankle: Point, end: number): Pose => ({
  pelvis: at(ankle.x - 3, ankle.y - 76),
  torso: 180,
  head: 180,
  armNear: grip(14, -4, CW),
  armFar: grip(14, -4, CW),
  legNear: ik(ankle.x, ankle.y, CCW, { end }),
  legFar: ik(ankle.x - 2, ankle.y, CCW, { end }),
});

const calfRaise: ExerciseAnimation = {
  exerciseId: "calf-raise",
  view: "side",
  summary: "Elevación de gemelos en máquina vista de lado: con las rodillas estiradas, el talón baja por debajo del escalón y después sube al máximo sobre la punta del pie.",
  cue: "Rodillas estiradas: baja el talón y sube alto",
  props: [
    { kind: "rect", at: at(144, 213), w: 54, h: 18, radius: 2, tone: "light" },
    { kind: "line", from: at(214, 30), to: at(214, FLOOR), width: 8, tone: "light" },
    { kind: "line", from: { joint: "shoulderNear", dx: 4, dy: -8 }, to: at(214, 64), width: 5, tone: "steel", layer: "mid" },
    { kind: "rect", at: { joint: "shoulderNear", dy: -8 }, w: 18, h: 8, radius: 4, tone: "pad", layer: "mid" },
  ],
  keyframes: [
    keyframe(calfPose(at(157, 204), 110), 1, "Sube al máximo", "concentric", { hold: 1, holdLabel: "Estira abajo · 1 s" }),
    keyframe(calfPose(at(163, 193), 55), 2, "Baja lento · 2 s", "eccentric", { hold: 1, holdLabel: "Pausa arriba" }),
  ],
  primary: ["calves"],
  secondary: [],
  arrow: "head",
};

const benchTop: Pose = {
  pelvis: at(172, 174),
  torso: 272,
  head: 270,
  armNear: ik(128, 125, CW),
  armFar: ik(126, 125, CW),
  legNear: ik(214, ANKLE, CCW),
  legFar: ik(210, ANKLE, CCW),
};

const benchPress: ExerciseAnimation = {
  exerciseId: "bench-press",
  view: "side",
  summary: "Press de banca visto de lado: la barra baja desde encima de los hombros hasta la parte media del pecho con los antebrazos verticales y vuelve a subir.",
  cue: "Escápulas atrás, antebrazos verticales",
  props: [
    { kind: "line", from: at(104, 80), to: at(104, FLOOR), width: 5, tone: "light" },
    { kind: "line", from: at(96, 112), to: at(112, 112), width: 4, tone: "steel" },
    ...bench(150, 184, 116),
    { kind: "barbell", at: { joint: "handNear" } },
  ],
  keyframes: [
    keyframe(benchTop, 2.8, "Baja al pecho · 3 s", "eccentric", { hold: 0.3 }),
    keyframe(
      { ...benchTop, armNear: ik(138, 162, CW, { scale: 0.52 }), armFar: ik(136, 162, CW, { scale: 0.52 }) },
      1.3,
      "Empuja la barra arriba",
      "concentric",
      { hold: 0.2 },
    ),
  ],
  primary: ["pecs"],
  secondary: ["triceps", "frontDelt"],
  arrow: "handNear",
  trace: "handNear",
};

const inclineTop: Pose = {
  pelvis: at(168, 176),
  torso: 236,
  head: 228,
  armNear: ik(133, 104, CW),
  armFar: ik(131, 104, CW),
  legNear: ik(214, ANKLE, CCW),
  legFar: ik(210, ANKLE, CCW),
};

const inclinePress: ExerciseAnimation = {
  exerciseId: "incline-press",
  view: "side",
  summary: "Press inclinado con mancuernas visto de lado: en un banco de unos 30 grados las mancuernas bajan junto a la parte alta del pecho y suben hasta quedar sobre los hombros.",
  cue: "Empuja arriba y junta sin chocar",
  props: [
    { kind: "line", from: at(158, 190), to: at(112, 156), width: 10, tone: "pad" },
    { kind: "line", from: at(156, 190), to: at(186, 190), width: 9, tone: "pad" },
    { kind: "line", from: at(164, 194), to: at(164, FLOOR), width: 5, tone: "steel" },
    { kind: "line", from: at(126, 170), to: at(140, FLOOR), width: 4, tone: "steel" },
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "end" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "end", layer: "front" },
  ],
  keyframes: [
    keyframe(inclineTop, 2.8, "Baja junto al pecho · 3 s", "eccentric", { hold: 0.3 }),
    keyframe(
      { ...inclineTop, armNear: ik(142, 139, CW, { scale: 0.55 }), armFar: ik(140, 139, CW, { scale: 0.55 }) },
      1.3,
      "Empuja arriba",
      "concentric",
      { hold: 0.2 },
    ),
  ],
  primary: ["pecs"],
  secondary: ["frontDelt", "triceps"],
  arrow: "handNear",
};

const chestPressStart: Pose = {
  pelvis: at(124, 170),
  torso: 188,
  head: 182,
  armNear: ik(134, 134, CW, { scale: 0.75 }),
  armFar: ik(132, 134, CW, { scale: 0.75 }),
  legNear: ik(178, ANKLE, CCW),
  legFar: ik(174, ANKLE, CCW),
};

const chestPress: ExerciseAnimation = {
  exerciseId: "chest-press",
  view: "side",
  summary: "Press de pecho en máquina visto de lado: con la espalda apoyada, las manos empujan los agarres desde la altura del pecho hasta casi estirar los brazos.",
  cue: "Empuja sin despegar la espalda del respaldo",
  props: [
    { kind: "rect", at: at(104, 138), w: 10, h: 74, radius: 3, tone: "pad", angle: 8 },
    { kind: "rect", at: at(128, 184), w: 56, h: 10, radius: 3, tone: "pad" },
    { kind: "line", from: at(126, 189), to: at(126, FLOOR), width: 6, tone: "steel" },
    { kind: "line", from: at(90, FLOOR), to: at(200, FLOOR), width: 5, tone: "steel" },
    { kind: "line", from: at(96, 40), to: at(96, FLOOR), width: 7, tone: "light" },
    { kind: "line", from: { joint: "handNear" }, to: at(162, 36), width: 5, tone: "steel" },
    { kind: "rect", at: { joint: "handNear" }, w: 5, h: 14, radius: 2, tone: "ink", layer: "front" },
  ],
  keyframes: [
    keyframe(chestPressStart, 1.3, "Empuja sin adelantar los hombros", "concentric", { hold: 0.3 }),
    keyframe({ ...chestPressStart, armNear: ik(166, 131, CW), armFar: ik(164, 131, CW) }, 2.8, "Vuelve · 3 s", "eccentric", {
      hold: 0.3,
    }),
  ],
  primary: ["pecs"],
  secondary: ["triceps", "frontDelt"],
  arrow: "handNear",
};

const topStance = (near: number, far: number, scale = 0.2) => ({
  legNear: fk(near, near, { scale }),
  legFar: fk(far, far, { scale }),
});

const flyOpen: Pose = {
  pelvis: at(160, 140),
  torso: 180,
  armNear: ik(98, 146, CCW),
  armFar: ik(222, 146, CW),
  ...topStance(180, 0),
};

const cableFly: ExerciseAnimation = {
  exerciseId: "cable-fly",
  view: "top",
  summary: "Apertura en polea vista desde arriba: los brazos, con los codos ligeramente flexionados y fijos, describen un arco desde los lados hasta juntar las manos delante del pecho.",
  cue: "Abraza un árbol, codos fijos",
  props: [
    { kind: "rect", at: at(72, 152), w: 16, h: 16, radius: 2, tone: "light" },
    { kind: "rect", at: at(248, 152), w: 16, h: 16, radius: 2, tone: "light" },
    { kind: "line", from: at(78, 152), to: { joint: "handNear" }, width: 1.4, tone: "cable" },
    { kind: "line", from: at(242, 152), to: { joint: "handFar" }, width: 1.4, tone: "cable" },
  ],
  keyframes: [
    keyframe(flyOpen, 1.3, "Junta las manos en arco", "concentric", { hold: 0.3 }),
    keyframe({ ...flyOpen, armNear: ik(156, 100, CCW), armFar: ik(164, 100, CW) }, 2.8, "Abre lento · 3 s", "eccentric", {
      hold: 1,
      holdLabel: "Aprieta el pecho",
    }),
  ],
  primary: ["pecs"],
  secondary: ["frontDelt"],
  arrow: "handNear",
};

const seatedFrontLegs = {
  legNear: fk(0, 0, { scale: 0.28, lowerScale: 1 }),
  legFar: fk(0, 0, { scale: 0.28, lowerScale: 1 }),
};

const pulldownTop: Pose = {
  pelvis: at(160, 166),
  torso: 180,
  head: 180,
  armNear: ik(116, 80, CCW),
  armFar: ik(204, 80, CW),
  ...seatedFrontLegs,
};


const latPulldown: ExerciseAnimation = {
  exerciseId: "lat-pulldown",
  view: "front",
  summary: "Jalón al pecho visto de frente: la barra baja desde arriba hasta la parte alta del pecho llevando los codos hacia las costillas.",
  cue: "Codos a los bolsillos, pecho alto",
  props: [
    { kind: "line", from: { between: ["handNear", "handFar"], t: 0.5 }, to: at(160, 8), width: 1.4, tone: "cable" },
    { kind: "line", from: { joint: "handNear", dx: -14 }, to: { joint: "handFar", dx: 14 }, width: 4, tone: "ink", layer: "front" },
    { kind: "rect", at: at(160, 176), w: 70, h: 9, radius: 3, tone: "pad", layer: "mid" },
  ],
  keyframes: [
    keyframe(pulldownTop, 1.3, "Codos hacia las costillas", "concentric", { hold: 0.3 }),
    keyframe({ ...pulldownTop, armNear: ik(124, 122, CCW), armFar: ik(196, 122, CW) }, 2.8, "Sube controlado · 3 s", "eccentric", {
      hold: 0.6,
      holdLabel: "Aprieta la espalda",
    }),
  ],
  primary: ["lats"],
  secondary: ["biceps", "midBack"],
  arrow: "elbowNear",
};

const pullHang: Pose = {
  pelvis: at(160, 130),
  torso: 180,
  head: 180,
  armNear: ik(116, 46, CCW),
  armFar: ik(204, 46, CW),
  legNear: fk(0, 0, { lowerScale: 0.22 }),
  legFar: fk(0, 0, { lowerScale: 0.22 }),
};

const pullUp: ExerciseAnimation = {
  exerciseId: "pull-up",
  view: "back",
  summary: "Dominada asistida vista de espaldas: de rodillas sobre la plataforma, el cuerpo sube con los codos hacia abajo hasta acercar el pecho a la barra y baja controlado.",
  cue: "Pecho a la barra, codos abajo",
  props: [
    { kind: "line", from: at(82, 42), to: at(238, 42), width: 5, tone: "ink" },
    { kind: "line", from: at(84, 20), to: at(84, FLOOR), width: 7, tone: "light" },
    { kind: "line", from: at(236, 20), to: at(236, FLOOR), width: 7, tone: "light" },
    { kind: "line", from: { between: ["kneeNear", "kneeFar"], t: 0.5, offset: -2 }, to: at(160, FLOOR), width: 5, tone: "steel" },
    { kind: "rect", at: { between: ["kneeNear", "kneeFar"], t: 0.5, offset: -5 }, w: 54, h: 8, radius: 3, tone: "pad", layer: "front" },
  ],
  keyframes: [
    keyframe(pullHang, 1.4, "Sube con los codos abajo", "concentric", { hold: 0.3 }),
    keyframe({ ...pullHang, pelvis: at(160, 99) }, 2.8, "Baja controlado · 3 s", "eccentric", { hold: 0.4 }),
  ],
  primary: ["lats"],
  secondary: ["biceps", "midBack"],
  arrow: "pelvis",
};

const rowStart: Pose = {
  pelvis: at(116, 190),
  torso: 166,
  head: 172,
  armNear: ik(176, 148, CW),
  armFar: ik(174, 148, CW),
  legNear: ik(188, 197, CCW),
  legFar: ik(185, 197, CCW),
};

const cableRow: ExerciseAnimation = {
  exerciseId: "cable-row",
  view: "side",
  summary: "Remo sentado en polea visto de lado: con el tronco alto, el agarre se lleva hacia las costillas juntando las escápulas y los brazos vuelven a extenderse sin redondear la espalda.",
  cue: "Codos atrás, junta las escápulas",
  props: [
    { kind: "rect", at: at(110, 206), w: 110, h: 10, radius: 3, tone: "pad" },
    { kind: "line", from: at(70, 211), to: at(70, FLOOR), width: 5, tone: "steel" },
    { kind: "line", from: at(150, 211), to: at(150, FLOOR), width: 5, tone: "steel" },
    { kind: "rect", at: at(204, 202), w: 7, h: 30, radius: 2, tone: "ink", angle: -14 },
    { kind: "rect", at: at(246, 150), w: 30, h: 148, radius: 2, tone: "light" },
    { kind: "circle", at: at(228, 196), r: 5, tone: "steel" },
    { kind: "line", from: at(228, 196), to: { joint: "handNear" }, width: 1.4, tone: "cable", layer: "front" },
    { kind: "rect", at: { joint: "handNear" }, w: 5, h: 13, radius: 2, tone: "ink", layer: "front" },
  ],
  keyframes: [
    keyframe(rowStart, 1.5, "Codos atrás", "concentric", { hold: 0.3 }),
    keyframe(
      { ...rowStart, torso: 181, head: 180, armNear: ik(131, 165, CW), armFar: ik(129, 165, CW) },
      2,
      "Extiende sin redondear",
      "eccentric",
      { hold: 1, holdLabel: "Junta escápulas 1 s" },
    ),
  ],
  primary: ["midBack", "lats"],
  secondary: ["biceps"],
  arrow: "handNear",
};

const chestRowHang: Pose = {
  pelvis: at(120, 140),
  torso: 132,
  head: 124,
  armNear: ik(152, 160, CW),
  armFar: ik(150, 160, CW),
  legNear: ik(102, ANKLE, CCW),
  legFar: ik(98, ANKLE, CCW),
};

const chestRow: ExerciseAnimation = {
  exerciseId: "chest-row",
  view: "side",
  summary: "Remo con pecho apoyado visto de lado: con el pecho sobre el banco inclinado, las mancuernas suben llevando los codos atrás y bajan hasta estirar los brazos.",
  cue: "Pecho pegado al banco, codos atrás",
  props: [
    { kind: "line", from: at(134, 144), to: at(172, 110), width: 10, tone: "pad" },
    { kind: "line", from: at(138, 148), to: at(128, FLOOR), width: 5, tone: "steel" },
    { kind: "line", from: at(166, 118), to: at(196, FLOOR), width: 4, tone: "steel" },
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "end" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "end", layer: "front" },
  ],
  keyframes: [
    keyframe(chestRowHang, 1.4, "Codos atrás", "concentric", { hold: 0.3 }),
    keyframe({ ...chestRowHang, armNear: ik(141, 134, CW), armFar: ik(139, 134, CW) }, 2.2, "Baja estirando", "eccentric", {
      hold: 1,
      holdLabel: "Junta escápulas",
    }),
  ],
  primary: ["midBack", "lats"],
  secondary: ["rearDelt", "biceps"],
  arrow: "elbowNear",
};

const faceStart: Pose = {
  pelvis: at(138, 138),
  torso: 185,
  head: 182,
  armNear: fk(101, 101),
  armFar: fk(101, 101),
  legNear: ik(150, ANKLE, CCW),
  legFar: ik(128, ANKLE, CCW),
};

const facePull: ExerciseAnimation = {
  exerciseId: "face-pull",
  view: "side",
  summary: "Face pull visto de lado: la cuerda se tira desde la polea a la altura de la cara llevando las manos hacia las orejas con los codos altos.",
  cue: "Codos altos, manos a las orejas",
  props: [
    ...column(252, 76),
    { kind: "line", from: at(244, 76), to: { joint: "handNear" }, width: 1.6, tone: "cable", layer: "front" },
  ],
  keyframes: [
    keyframe(faceStart, 1.2, "Manos a las orejas", "concentric", { hold: 0.3 }),
    keyframe(
      { ...faceStart, armNear: fk(95, 184, { scale: 0.25, lowerScale: 1 }), armFar: fk(95, 184, { scale: 0.25, lowerScale: 1 }) },
      2,
      "Extiende controlado",
      "eccentric",
      { hold: 1, holdLabel: "Aprieta 1 s" },
    ),
  ],
  primary: ["rearDelt", "midBack"],
  secondary: ["traps"],
  arrow: "handNear",
};

const pressBottom: Pose = {
  pelvis: at(160, 166),
  torso: 180,
  head: 180,
  armNear: fk(-69, -180, { scale: 0.83, lowerScale: 1 }),
  armFar: fk(69, 180, { scale: 0.83, lowerScale: 1 }),
  ...seatedFrontLegs,
};

const shoulderPress: ExerciseAnimation = {
  exerciseId: "shoulder-press",
  view: "front",
  summary: "Press de hombros con mancuernas visto de frente: las mancuernas suben desde la altura de las orejas con los antebrazos verticales hasta quedar sobre la cabeza.",
  cue: "Antebrazos verticales, costillas abajo",
  props: [
    { kind: "rect", at: at(160, 128), w: 44, h: 96, radius: 4, tone: "pad" },
    { kind: "rect", at: at(160, 176), w: 70, h: 10, radius: 3, tone: "pad" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "side", layer: "front" },
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "side", layer: "front" },
  ],
  keyframes: [
    keyframe(pressBottom, 1.3, "Empuja arriba", "concentric", { hold: 0.2 }),
    keyframe(
      { ...pressBottom, armNear: fk(-189, -189, { scale: 1 }), armFar: fk(189, 189, { scale: 1 }) },
      2.8,
      "Baja hasta las orejas · 3 s",
      "eccentric",
      { hold: 0.3 },
    ),
  ],
  primary: ["frontDelt", "sideDelt"],
  secondary: ["triceps"],
  arrow: "handNear",
};

const raiseDown: Pose = {
  pelvis: at(160, 138),
  torso: 180,
  head: 180,
  armNear: fk(-12, -18),
  armFar: fk(12, 18),
  legNear: ik(152, ANKLE, CW),
  legFar: ik(168, ANKLE, CCW),
};

const lateralRaise: ExerciseAnimation = {
  exerciseId: "lateral-raise",
  view: "front",
  summary: "Elevación lateral con mancuernas vista de frente: los brazos, con el codo algo flexionado, suben hacia los lados hasta la altura de los hombros guiando con los codos.",
  cue: "Sube con los codos, sin encoger los hombros",
  props: [
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "end", layer: "front" },
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "end", layer: "front" },
  ],
  keyframes: [
    keyframe(raiseDown, 1.3, "Sube con los codos", "concentric", { hold: 0.2 }),
    keyframe({ ...raiseDown, armNear: fk(-88, -80), armFar: fk(88, 80) }, 2.8, "Baja lento · 3 s", "eccentric", { hold: 0.4 }),
  ],
  primary: ["sideDelt"],
  secondary: ["frontDelt"],
  arrow: "elbowNear",
};

const reverseClosed: Pose = {
  pelvis: at(160, 140),
  torso: 180,
  armNear: ik(156, 97, CCW),
  armFar: ik(164, 97, CW),
  ...topStance(180, 180),
};

const rearDelt: ExerciseAnimation = {
  exerciseId: "rear-delt",
  view: "top",
  summary: "Pájaros en máquina vistos desde arriba: con el pecho apoyado en el respaldo, los brazos se abren hacia atrás a la altura de los hombros, con los codos algo flexionados, hasta formar una T.",
  cue: "Abre atrás guiando con los codos, sin encoger",
  props: [
    { kind: "rect", at: at(160, 121), w: 38, h: 9, radius: 4, tone: "pad", layer: "mid" },
    { kind: "circle", at: at(160, 106), r: 4, tone: "steel", layer: "mid" },
    { kind: "line", from: at(160, 106), to: { joint: "handNear" }, width: 4, tone: "steel", layer: "mid" },
    { kind: "line", from: at(160, 106), to: { joint: "handFar" }, width: 4, tone: "steel", layer: "mid" },
  ],
  keyframes: [
    keyframe(reverseClosed, 1.3, "Abre atrás con los codos", "concentric", { hold: 0.2 }),
    keyframe({ ...reverseClosed, armNear: ik(96, 144, CCW), armFar: ik(224, 144, CW) }, 2.8, "Vuelve lento · 3 s", "eccentric", {
      hold: 1,
      holdLabel: "Junta escápulas",
    }),
  ],
  primary: ["rearDelt"],
  secondary: ["midBack"],
  arrow: "handNear",
};

const pushdownStart: Pose = {
  pelvis: at(140, 138),
  torso: 172,
  head: 176,
  armNear: fk(4, 112),
  armFar: fk(2, 110),
  legNear: ik(146, ANKLE, CCW),
  legFar: ik(140, ANKLE, CCW),
};

const triceps: ExerciseAnimation = {
  exerciseId: "triceps",
  view: "side",
  summary: "Extensión de tríceps en polea vista de lado: con los codos pegados al tronco, los antebrazos bajan hasta extender el codo y suben con control.",
  cue: "Codos pegados, abre la cuerda abajo",
  props: [...column(232, 30), { kind: "line", from: at(224, 30), to: { joint: "handNear" }, width: 1.6, tone: "cable", layer: "front" }],
  keyframes: [
    keyframe(pushdownStart, 1.2, "Extiende el codo", "concentric", { hold: 0.2 }),
    keyframe({ ...pushdownStart, armNear: fk(4, 6), armFar: fk(2, 4) }, 2.2, "Sube controlado", "eccentric", {
      hold: 1,
      holdLabel: "Abre la cuerda y aprieta",
    }),
  ],
  primary: ["triceps"],
  secondary: [],
  arrow: "handNear",
};

const curlDown: Pose = {
  pelvis: at(152, 138),
  torso: 180,
  head: 180,
  armNear: fk(2, 4),
  armFar: fk(-2, 0),
  legNear: ik(156, ANKLE, CCW),
  legFar: ik(151, ANKLE, CCW),
};

const biceps: ExerciseAnimation = {
  exerciseId: "biceps",
  view: "side",
  summary: "Curl de bíceps con mancuernas visto de lado: el codo queda quieto junto al tronco y el antebrazo sube hasta contraer el bíceps; después baja por completo despacio.",
  cue: "Codo quieto, sube sin balancearte",
  props: [
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "end" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "end", layer: "front" },
  ],
  keyframes: [
    keyframe(curlDown, 1.2, "Sube con el codo quieto", "concentric", { hold: 0.2 }),
    keyframe({ ...curlDown, armNear: fk(8, 144), armFar: fk(4, 140) }, 2.8, "Baja lento · 3 s", "eccentric", {
      hold: 0.5,
      holdLabel: "Aprieta el bíceps",
    }),
  ],
  primary: ["biceps"],
  secondary: ["brachialis", "forearm"],
  arrow: "handNear",
};

const hammerCurl: ExerciseAnimation = {
  exerciseId: "hammer-curl",
  view: "side",
  summary: "Curl martillo visto de lado: con las palmas enfrentadas y el codo quieto, la mancuerna sube hasta flexionar el codo y baja hasta extenderlo.",
  cue: "Pulgar arriba, codo pegado al cuerpo",
  props: [
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "grip", along: ["elbowFar", "wristFar"] },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "grip", along: ["elbowNear", "wristNear"], layer: "front" },
  ],
  keyframes: biceps.keyframes.map((frame, index) => ({
    ...frame,
    label: index === 0 ? "Sube con el pulgar arriba" : frame.label,
    holdLabel: index === 0 ? undefined : "Aprieta arriba",
  })),
  primary: ["brachialis", "forearm"],
  secondary: ["biceps"],
  arrow: "handNear",
};

const plankHold: Pose = {
  pelvis: at(140, 199),
  torso: 102,
  head: 100,
  armNear: fk(0, 90, { end: 90 }),
  armFar: fk(-2, 90, { end: 90 }),
  legNear: ik(64, 205, CCW, { end: 0 }),
  legFar: ik(66, 205, CCW, { end: 0 }),
};

const plank: ExerciseAnimation = {
  exerciseId: "plank",
  view: "side",
  summary: "Plancha frontal vista de lado: apoyo en antebrazos con los codos bajo los hombros y una línea recta desde la cabeza hasta los talones, manteniendo abdomen y glúteos activos.",
  cue: "Línea recta de cabeza a talones",
  props: [{ kind: "rect", at: at(140, FLOOR - 2), w: 190, h: 4, radius: 2, tone: "light" }],
  keyframes: [
    keyframe(plankHold, 2.5, "Aguanta y respira", "isometric"),
    keyframe({ ...plankHold, pelvis: at(140, 198) }, 2.5, "Aprieta abdomen y glúteos", "isometric"),
  ],
  primary: ["abs"],
  secondary: ["obliques", "glutes"],
  arrow: "neck",
  guide: ["head", "ankleNear"],
};

const deadBugStart: Pose = {
  pelvis: at(176, 210),
  torso: 270,
  head: 268,
  armNear: fk(180, 180),
  armFar: fk(178, 178),
  legNear: fk(180, 90),
  legFar: fk(178, 88),
};

const deadBugNearArm: Pose = { ...deadBugStart, armNear: fk(262, 262), legFar: fk(96, 94) };
const deadBugFarArm: Pose = { ...deadBugStart, armFar: fk(262, 262), legNear: fk(96, 94) };

const deadBug: ExerciseAnimation = {
  exerciseId: "dead-bug",
  view: "side",
  summary: "Dead bug visto de lado: tumbado boca arriba con la zona lumbar apoyada, se extienden a la vez un brazo y la pierna contraria y se vuelve alternando.",
  cue: "Lumbar pegada al suelo, exhala al estirar",
  props: [{ kind: "rect", at: at(160, FLOOR - 2), w: 200, h: 4, radius: 2, tone: "light" }],
  keyframes: [
    keyframe(deadBugStart, 2.5, "Estira brazo y pierna contrarios", "isometric", { hold: 0.4, arrow: "handNear" }),
    keyframe(deadBugNearArm, 1.8, "Vuelve al centro", "isometric", { hold: 0.8, holdLabel: "Lumbar pegada", arrow: "handNear" }),
    keyframe(deadBugStart, 2.5, "Cambia de lado", "isometric", { hold: 0.4, arrow: "handFar" }),
    keyframe(deadBugFarArm, 1.8, "Vuelve al centro", "isometric", { hold: 0.8, holdLabel: "Lumbar pegada", arrow: "handFar" }),
  ],
  primary: ["abs"],
  secondary: ["obliques"],
  arrow: "handNear",
};

const pallofChest: Pose = {
  pelvis: at(150, 140),
  torso: 180,
  armNear: ik(146, 123, CCW),
  armFar: ik(154, 123, CW),
  ...topStance(270, 90, 0.16),
};

const pallof: ExerciseAnimation = {
  exerciseId: "pallof",
  view: "top",
  summary: "Press Pallof visto desde arriba: de lado a la polea, las manos se alejan del pecho hacia delante mientras el cable tira hacia un lado, y el tronco se mantiene recto sin girar.",
  cue: "El cable tira de lado: no dejes que te gire",
  props: [
    { kind: "rect", at: at(262, 123), w: 16, h: 16, radius: 2, tone: "light" },
    { kind: "line", from: at(256, 123), to: { between: ["handNear", "handFar"], t: 0.5 }, width: 1.6, tone: "cable", layer: "front" },
  ],
  keyframes: [
    keyframe(pallofChest, 1.5, "Empuja al frente sin girar", "isometric", { hold: 0.3 }),
    keyframe({ ...pallofChest, armNear: ik(147, 93, CCW), armFar: ik(153, 93, CW) }, 1.5, "Vuelve al pecho", "isometric", {
      hold: 2.5,
      holdLabel: "Aguanta, tronco cuadrado",
    }),
  ],
  primary: ["obliques", "abs"],
  secondary: [],
  arrow: "handNear",
};

const carryPose = (near: [number, number, number], far: [number, number, number], pelvisY: number): Pose => ({
  pelvis: at(160, pelvisY),
  torso: 180,
  head: 180,
  armNear: fk(1, 1),
  armFar: fk(-1, -1),
  legNear: ik(near[0], near[1], CCW, { end: near[2] }),
  legFar: ik(far[0], far[1], CCW, { end: far[2] }),
});

const carryStep = { ease: "linear" as const };

const farmerCarry: ExerciseAnimation = {
  exerciseId: "farmer-carry",
  view: "side",
  summary: "Paseo del granjero visto de lado: caminando con una carga en cada mano, el tronco se mantiene alto, los hombros bajos y los pasos cortos y estables.",
  cue: "Alto, hombros atrás, pasos cortos",
  props: [
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "side" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "side", layer: "front" },
  ],
  keyframes: [
    keyframe(carryPose([182, 212, 100], [142, 212, 70], 139), 0.35, "Paso corto", "isometric", carryStep),
    keyframe(carryPose([162, ANKLE, 90], [160, 198, 72], 137), 0.35, "Tronco alto", "isometric", carryStep),
    keyframe(carryPose([142, 212, 70], [182, 212, 100], 139), 0.35, "Hombros abajo", "isometric", carryStep),
    keyframe(carryPose([160, 198, 72], [162, ANKLE, 90], 137), 0.35, "Respira continuo", "isometric", carryStep),
  ],
  primary: ["forearm", "traps"],
  secondary: ["abs", "obliques"],
  arrow: "neck",
};

const CRANK = at(150, 190);
const CRANK_RADIUS = 16;

const bikePose = (clock: number): Pose => {
  const pedal = (angle: number) => ({
    x: CRANK.x + CRANK_RADIUS * Math.sin((angle * Math.PI) / 180) - 6,
    y: CRANK.y - CRANK_RADIUS * Math.cos((angle * Math.PI) / 180) - 7,
  });
  const near = pedal(clock);
  const far = pedal(clock + 180);
  return {
    pelvis: at(118, 128),
    torso: 150,
    head: 128,
    armNear: ik(186, 106, CW),
    armFar: ik(184, 106, CW),
    legNear: ik(near.x, near.y, CCW, { end: 84 + 8 * Math.cos((clock * Math.PI) / 180) }),
    legFar: ik(far.x, far.y, CCW, { end: 84 - 8 * Math.cos((clock * Math.PI) / 180) }),
  };
};

const bike: ExerciseAnimation = {
  exerciseId: "bike",
  view: "side",
  summary: "Bicicleta estática vista de lado: el pedal describe un círculo completo a ritmo constante con las rodillas alineadas y la cadera quieta en el sillín.",
  cue: "Pedalea redondo, rodilla alineada",
  props: [
    { kind: "line", from: at(80, FLOOR), to: at(236, FLOOR), width: 6, tone: "ink" },
    { kind: "line", from: at(118, 140), to: at(148, FLOOR), width: 7, tone: "light" },
    { kind: "line", from: at(150, 190), to: at(212, 182), width: 7, tone: "light" },
    { kind: "line", from: at(212, 182), to: at(200, 118), width: 7, tone: "light" },
    { kind: "line", from: at(200, 118), to: at(196, 104), width: 5, tone: "steel" },
    { kind: "line", from: at(186, 104), to: at(202, 104), width: 5, tone: "ink" },
    { kind: "circle", at: at(212, 182), r: 24, tone: "light" },
    { kind: "rect", at: at(116, 139), w: 26, h: 6, radius: 3, tone: "ink" },
    { kind: "circle", at: CRANK, r: 5, tone: "steel", layer: "mid" },
    { kind: "line", from: CRANK, to: { joint: "ankleNear", dx: 6, dy: 7 }, width: 3.5, tone: "ink", layer: "front" },
  ],
  keyframes: [0, 45, 90, 135, 180, 225, 270, 315].map((clock) =>
    keyframe(
      bikePose(clock),
      0.15,
      clock < 180 ? "Empuja el pedal" : "Recoge el pedal",
      clock < 180 ? "concentric" : "eccentric",
      { ease: "linear" },
    ),
  ),
  primary: ["quads", "glutes"],
  secondary: ["calves"],
  arrow: "neck",
  trace: "ankleNear",
};

const rowerPose = (pelvisX: number, torso: number, handle: Point): Pose => ({
  pelvis: at(pelvisX, 194),
  torso,
  head: torso > 180 ? 190 : 162,
  armNear: ik(handle.x, handle.y, CW),
  armFar: ik(handle.x - 2, handle.y, CW),
  legNear: ik(198, 196, CCW, { end: 128 }),
  legFar: ik(195, 196, CCW, { end: 128 }),
});

const rower: ExerciseAnimation = {
  exerciseId: "rower",
  view: "side",
  summary: "Remo ergómetro visto de lado: en la tracción empujan primero las piernas, luego se inclina el tronco y terminan los brazos; en la vuelta el orden se invierte.",
  cue: "Piernas, cuerpo, brazos; al volver, al revés",
  props: [
    { kind: "line", from: at(52, 210), to: at(252, 210), width: 5, tone: "steel" },
    { kind: "line", from: at(60, 212), to: at(60, FLOOR), width: 5, tone: "steel" },
    { kind: "circle", at: at(266, 180), r: 26, tone: "ink" },
    { kind: "rect", at: at(206, 200), w: 7, h: 28, radius: 2, tone: "ink", angle: 38 },
    { kind: "rect", at: { joint: "pelvis", dy: 10 }, w: 28, h: 6, radius: 3, tone: "pad" },
    { kind: "line", from: at(252, 170), to: { joint: "handNear" }, width: 1.6, tone: "cable", layer: "front" },
    { kind: "rect", at: { joint: "handNear" }, w: 5, h: 14, radius: 2, tone: "ink", layer: "front" },
  ],
  keyframes: [
    keyframe(rowerPose(166, 152, at(236, 162)), 0.45, "Empujan las piernas", "concentric", { active: ["quads", "glutes"], hold: 0.2 }),
    keyframe(rowerPose(134, 152, at(204, 162)), 0.3, "Se inclina el cuerpo", "concentric", { active: ["glutes", "lats"] }),
    keyframe(rowerPose(121, 205, at(152, 160)), 0.35, "Tiran los brazos", "concentric", { active: ["lats", "midBack"] }),
    keyframe(rowerPose(121, 205, at(124, 164)), 0.35, "Brazos fuera", "eccentric", { active: [], hold: 0.25, holdLabel: "Final" }),
    keyframe(rowerPose(121, 205, at(152, 160)), 0.35, "Cuerpo adelante", "eccentric", { active: [] }),
    keyframe(rowerPose(121, 152, at(190, 162)), 1.1, "Rodillas al pecho", "eccentric", { active: [] }),
  ],
  primary: ["quads", "glutes", "lats", "midBack"],
  secondary: ["biceps", "hamstrings"],
  arrow: "handNear",
  trace: "handNear",
};

const deadliftFloor: Pose = {
  pelvis: at(125, 166),
  torso: 112,
  head: 124,
  armNear: fk(0, 0),
  armFar: fk(-2, -2),
  legNear: ik(157, ANKLE, CCW),
  legFar: ik(154, ANKLE, CCW),
};

const deadlift: ExerciseAnimation = {
  exerciseId: "deadlift",
  view: "side",
  summary: "Peso muerto convencional visto de lado: la barra sale del suelo pegada a las piernas mientras cadera y rodillas se extienden a la vez hasta quedar de pie, y baja con la cadera atrás.",
  cue: "Barra pegada, empuja el suelo",
  props: [{ kind: "barbell", at: { joint: "handNear" } }],
  keyframes: [
    keyframe(deadliftFloor, 1.5, "Empuja el suelo, cadera al frente", "concentric", { hold: 0.5, holdLabel: "Fija la espalda" }),
    keyframe({ ...deadliftFloor, pelvis: at(151, 138), torso: 178, head: 180 }, 2.2, "Baja con la barra pegada", "eccentric", {
      hold: 0.4,
      holdLabel: "Aprieta glúteos arriba",
    }),
  ],
  primary: ["glutes", "hamstrings"],
  secondary: ["erectors", "quads"],
  arrow: "pelvis",
  arrowOffset: at(-16, -32),
  trace: "handNear",
};

const lungeStand: Pose = {
  pelvis: at(158, 139),
  torso: 179,
  head: 180,
  armNear: fk(2, 2),
  armFar: fk(-2, -1),
  legNear: ik(161, ANKLE, CCW),
  legFar: ik(156, ANKLE, CCW),
};

const reverseLunge: ExerciseAnimation = {
  exerciseId: "reverse-lunge",
  view: "side",
  summary: "Zancada atrás vista de lado: se da un paso largo hacia atrás, la cadera baja en vertical hasta que ambas rodillas forman unos 90 grados y se vuelve al centro empujando con el talón delantero.",
  cue: "Paso largo atrás, baja en vertical",
  props: [
    { kind: "dumbbell", at: { joint: "handFar" }, orient: "side" },
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "side", layer: "front" },
  ],
  keyframes: [
    keyframe(lungeStand, 1, "Da un paso largo atrás", "eccentric", { hold: 0.4 }),
    keyframe({ ...lungeStand, pelvis: at(141, 150), torso: 176, legFar: ik(100, 212, CCW, { end: 55 }) }, 1.6, "Baja en vertical", "eccentric"),
    keyframe({ ...lungeStand, pelvis: at(136, 176), torso: 174, legFar: ik(98, 212, CCW, { end: 50 }) }, 1.4, "Vuelve empujando con el talón delantero", "concentric", {
      hold: 0.2,
    }),
  ],
  primary: ["quads", "glutes"],
  secondary: ["hamstrings", "adductors"],
  arrow: "pelvis",
  arrowOffset: at(18, -30),
};

const pushUpTop: Pose = {
  pelvis: at(149, 179),
  torso: 108,
  head: 104,
  armNear: ik(192, 214, CW),
  armFar: ik(190, 214, CW),
  legNear: ik(77, 202, CCW, { end: 0 }),
  legFar: ik(79, 202, CCW, { end: 0 }),
};

const pushUp: ExerciseAnimation = {
  exerciseId: "push-up",
  view: "side",
  summary: "Flexiones vistas de lado: con las manos bajo los hombros y el cuerpo en línea recta, el pecho baja hacia el suelo con los codos a unos 45 grados y se vuelve a empujar el suelo.",
  cue: "Cuerpo en bloque, codos a 45°",
  props: [],
  keyframes: [
    keyframe(pushUpTop, 2, "Baja el pecho en bloque · 2 s", "eccentric", { hold: 0.2 }),
    keyframe({ ...pushUpTop, pelvis: at(150, 198), torso: 97, head: 96 }, 1.2, "Empuja el suelo", "concentric", { hold: 0.2 }),
  ],
  primary: ["pecs"],
  secondary: ["triceps", "frontDelt", "abs"],
  arrow: "shoulderNear",
  guide: ["head", "ankleNear"],
};

const abductionClosed: Pose = {
  pelvis: at(160, 164),
  torso: 180,
  head: 180,
  armNear: fk(-8, -4),
  armFar: fk(8, 4),
  legNear: fk(-6, 0, { scale: 0.3, lowerScale: 1 }),
  legFar: fk(6, 0, { scale: 0.3, lowerScale: 1 }),
};

const hipAbduction: ExerciseAnimation = {
  exerciseId: "hip-abduction",
  view: "front",
  summary: "Abducción de cadera en máquina vista de frente: sentado con la espalda apoyada, las rodillas se abren hacia fuera contra las almohadillas sin mover la pelvis y se cierran despacio.",
  cue: "Pelvis quieta, abre con el glúteo",
  props: [
    { kind: "rect", at: at(160, 126), w: 44, h: 90, radius: 4, tone: "pad" },
    { kind: "rect", at: at(160, 174), w: 76, h: 10, radius: 3, tone: "pad", layer: "mid" },
    { kind: "circle", at: { joint: "kneeNear", dx: -8 }, r: 7, tone: "pad", layer: "front" },
    { kind: "circle", at: { joint: "kneeFar", dx: 8 }, r: 7, tone: "pad", layer: "front" },
  ],
  keyframes: [
    keyframe(abductionClosed, 1.2, "Abre las rodillas", "concentric", { hold: 0.2 }),
    keyframe({ ...abductionClosed, legNear: fk(-62, -10, { scale: 0.3, lowerScale: 1 }), legFar: fk(62, 10, { scale: 0.3, lowerScale: 1 }) }, 2.4, "Cierra despacio", "eccentric", {
      hold: 1,
      holdLabel: "Pausa fuera",
    }),
  ],
  primary: ["abductors"],
  secondary: ["glutes"],
  arrow: "kneeNear",
};

const oneArmHang: Pose = {
  pelvis: at(118, 152),
  torso: 100,
  head: 96,
  armNear: ik(164, 195, CW),
  armFar: fk(0, 0),
  legNear: ik(126, ANKLE, CCW),
  legFar: fk(0, -90, { end: -90 }),
};

const oneArmRow: ExerciseAnimation = {
  exerciseId: "one-arm-row",
  view: "side",
  summary: "Remo a una mano visto de lado: con una mano y una rodilla apoyadas en el banco y la espalda plana, la mancuerna sube llevando el codo hacia la cadera y baja hasta estirar el brazo.",
  cue: "Espalda plana, codo hacia la cadera",
  props: [
    ...bench(132, 197, 110),
    { kind: "dumbbell", at: { joint: "handNear" }, orient: "end", layer: "front" },
  ],
  keyframes: [
    keyframe(oneArmHang, 1.3, "Codo hacia la cadera", "concentric", { hold: 0.3 }),
    keyframe({ ...oneArmHang, armNear: ik(146, 156, CW) }, 2.2, "Baja estirando el brazo", "eccentric", { hold: 0.8, holdLabel: "Aprieta la espalda" }),
  ],
  primary: ["midBack", "lats"],
  secondary: ["biceps", "rearDelt"],
  arrow: "elbowNear",
};

const kneeRaiseHang: Pose = {
  pelvis: at(150, 136),
  torso: 180,
  head: 180,
  armNear: ik(152, 44, CW),
  armFar: ik(150, 44, CW),
  legNear: fk(2, 2),
  legFar: fk(-2, -2),
};

const hangingKneeRaise: ExerciseAnimation = {
  exerciseId: "hanging-knee-raise",
  view: "side",
  summary: "Elevación de rodillas colgado vista de lado: colgado de la barra con los hombros activos, las rodillas suben hacia el pecho curvando la pelvis y bajan despacio sin balanceo.",
  cue: "Sin balanceo, curva la pelvis",
  props: [
    { kind: "line", from: at(96, 40), to: at(208, 40), width: 5, tone: "ink" },
    { kind: "line", from: at(98, 30), to: at(98, FLOOR), width: 6, tone: "light" },
    { kind: "line", from: at(206, 30), to: at(206, FLOOR), width: 6, tone: "light" },
  ],
  keyframes: [
    keyframe(kneeRaiseHang, 1.3, "Sube las rodillas", "concentric", { hold: 0.3 }),
    keyframe({ ...kneeRaiseHang, pelvis: at(145, 132), torso: 188, legNear: fk(100, 4), legFar: fk(98, 2) }, 2.2, "Baja controlado", "eccentric", {
      hold: 0.5,
      holdLabel: "Curva la pelvis",
    }),
  ],
  primary: ["abs"],
  secondary: ["obliques", "forearm"],
  arrow: "kneeNear",
};

export const exerciseAnimations: ExerciseAnimation[] = [
  backSquat,
  gobletSquat,
  legPress,
  splitSquat,
  legExtension,
  rdl,
  hipThrust,
  legCurl,
  calfRaise,
  benchPress,
  inclinePress,
  chestPress,
  cableFly,
  latPulldown,
  pullUp,
  cableRow,
  chestRow,
  facePull,
  shoulderPress,
  lateralRaise,
  rearDelt,
  triceps,
  biceps,
  hammerCurl,
  plank,
  deadBug,
  pallof,
  farmerCarry,
  bike,
  rower,
  deadlift,
  reverseLunge,
  pushUp,
  hipAbduction,
  oneArmRow,
  hangingKneeRaise,
];

export const animationById = Object.fromEntries(exerciseAnimations.map((animation) => [animation.exerciseId, animation])) as Record<
  string,
  ExerciseAnimation
>;
