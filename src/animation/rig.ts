import { AnimationView, Effort, IkLimb, Joint, Keyframe, LimbPose, Point, Pose } from "../domain/types";

export const SEGMENT = {
  torso: 48,
  shoulderDrop: 5,
  neck: 7,
  headRadius: 10,
  upperArm: 27,
  forearm: 23,
  hand: 9,
  thigh: 39,
  shin: 38,
  foot: 18,
  shoulderHalfWidth: 17,
  hipHalfWidth: 8,
};

export type SegmentAngles = {
  torso: number;
  head: number;
  upperArmNear: number;
  forearmNear: number;
  handNear: number;
  upperArmFar: number;
  forearmFar: number;
  handFar: number;
  thighNear: number;
  shinNear: number;
  footNear: number;
  thighFar: number;
  shinFar: number;
  footFar: number;
};

export type Skeleton = { joints: Record<Joint, Point>; angles: SegmentAngles };

const RAD = Math.PI / 180;

export const direction = (angle: number): Point => ({ x: Math.sin(angle * RAD), y: Math.cos(angle * RAD) });

export const angleOf = (vector: Point): number => Math.atan2(vector.x, vector.y) / RAD;

export const add = (point: Point, vector: Point, length = 1): Point => ({
  x: point.x + vector.x * length,
  y: point.y + vector.y * length,
});

export const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpPoint = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export const isIk = (limb: LimbPose): limb is IkLimb => "target" in limb;

type SolvedLimb = { mid: Point; end: Point; upper: number; lower: number };

export function solveLimb(root: Point, limb: LimbPose, upperLength: number, lowerLength: number): SolvedLimb {
  const l1 = upperLength * (limb.scale ?? 1);
  const l2 = lowerLength * (limb.lowerScale ?? limb.scale ?? 1);

  if (!isIk(limb)) {
    const mid = add(root, direction(limb.upper), l1);
    return { mid, end: add(mid, direction(limb.lower), l2), upper: limb.upper, lower: limb.lower };
  }

  const toTarget = { x: limb.target.x - root.x, y: limb.target.y - root.y };
  const reach = Math.min(Math.max(Math.hypot(toTarget.x, toTarget.y), Math.abs(l1 - l2) + 0.001), l1 + l2 - 0.001);
  const cosine = (l1 * l1 + reach * reach - l2 * l2) / (2 * l1 * reach);
  const upper = angleOf(toTarget) + limb.bend * Math.acos(Math.min(1, Math.max(-1, cosine))) / RAD;
  const mid = add(root, direction(upper), l1);
  const lower = angleOf({ x: limb.target.x - mid.x, y: limb.target.y - mid.y });
  return { mid, end: add(mid, direction(lower), l2), upper, lower };
}

export function computeSkeleton(pose: Pose, view: AnimationView): Skeleton {
  const torsoDirection = direction(pose.torso);
  const lateral = direction(pose.torso + 90);
  const overhead = view === "top";
  const neck = overhead ? pose.pelvis : add(pose.pelvis, torsoDirection, SEGMENT.torso);
  const shoulderCenter = overhead ? pose.pelvis : add(pose.pelvis, torsoDirection, SEGMENT.torso - SEGMENT.shoulderDrop);
  const headAngle = pose.head ?? pose.torso;
  const head = overhead ? add(pose.pelvis, torsoDirection, 2) : add(neck, direction(headAngle), SEGMENT.neck + SEGMENT.headRadius * 0.8);
  const frontal = view !== "side";

  const shoulderNear = frontal ? add(shoulderCenter, lateral, SEGMENT.shoulderHalfWidth) : shoulderCenter;
  const shoulderFar = frontal ? add(shoulderCenter, lateral, -SEGMENT.shoulderHalfWidth) : shoulderCenter;
  const hipNear = frontal ? add(pose.pelvis, lateral, SEGMENT.hipHalfWidth) : pose.pelvis;
  const hipFar = frontal ? add(pose.pelvis, lateral, -SEGMENT.hipHalfWidth) : pose.pelvis;

  const forward = direction(pose.torso - 90);
  const inTorsoFrame = (root: Point, limb: LimbPose): LimbPose =>
    isIk(limb) && limb.frame === "torso"
      ? { ...limb, target: add(add(root, forward, limb.target.x), torsoDirection, limb.target.y) }
      : limb;

  const armNear = solveLimb(shoulderNear, inTorsoFrame(shoulderNear, pose.armNear), SEGMENT.upperArm, SEGMENT.forearm);
  const armFar = solveLimb(shoulderFar, inTorsoFrame(shoulderFar, pose.armFar), SEGMENT.upperArm, SEGMENT.forearm);
  const legNear = solveLimb(hipNear, pose.legNear, SEGMENT.thigh, SEGMENT.shin);
  const legFar = solveLimb(hipFar, pose.legFar, SEGMENT.thigh, SEGMENT.shin);

  const handAngle = (limb: LimbPose, solved: SolvedLimb) => limb.end ?? solved.lower;
  const footAngle = (limb: LimbPose, solved: SolvedLimb) => limb.end ?? (isIk(limb) ? 90 : solved.lower + 90);

  const angles: SegmentAngles = {
    torso: pose.torso,
    head: headAngle,
    upperArmNear: armNear.upper,
    forearmNear: armNear.lower,
    handNear: handAngle(pose.armNear, armNear),
    upperArmFar: armFar.upper,
    forearmFar: armFar.lower,
    handFar: handAngle(pose.armFar, armFar),
    thighNear: legNear.upper,
    shinNear: legNear.lower,
    footNear: footAngle(pose.legNear, legNear),
    thighFar: legFar.upper,
    shinFar: legFar.lower,
    footFar: footAngle(pose.legFar, legFar),
  };

  const footLength = frontal ? SEGMENT.foot * 0.35 : SEGMENT.foot * 0.8;

  return {
    angles,
    joints: {
      pelvis: pose.pelvis,
      neck,
      head,
      shoulderNear,
      shoulderFar,
      elbowNear: armNear.mid,
      elbowFar: armFar.mid,
      wristNear: armNear.end,
      wristFar: armFar.end,
      handNear: add(armNear.end, direction(angles.handNear), SEGMENT.hand * 0.55),
      handFar: add(armFar.end, direction(angles.handFar), SEGMENT.hand * 0.55),
      hipNear,
      hipFar,
      kneeNear: legNear.mid,
      kneeFar: legFar.mid,
      ankleNear: legNear.end,
      ankleFar: legFar.end,
      toeNear: add(legNear.end, direction(angles.footNear), footLength),
      toeFar: add(legFar.end, direction(angles.footFar), footLength),
    },
  };
}

const lerpLimb = (a: LimbPose, b: LimbPose, t: number): LimbPose => {
  const end = a.end !== undefined && b.end !== undefined ? lerp(a.end, b.end, t) : a.end ?? b.end;
  const scale = lerp(a.scale ?? 1, b.scale ?? 1, t);
  const lowerScale = lerp(a.lowerScale ?? a.scale ?? 1, b.lowerScale ?? b.scale ?? 1, t);
  if (isIk(a) && isIk(b)) {
    return { target: lerpPoint(a.target, b.target, t), bend: a.bend, frame: a.frame, end, scale, lowerScale };
  }
  if (!isIk(a) && !isIk(b)) {
    return { upper: lerp(a.upper, b.upper, t), lower: lerp(a.lower, b.lower, t), end, scale, lowerScale };
  }
  return t < 0.5 ? a : b;
};

export const interpolatePose = (a: Pose, b: Pose, t: number): Pose => ({
  pelvis: lerpPoint(a.pelvis, b.pelvis, t),
  torso: lerp(a.torso, b.torso, t),
  head: lerp(a.head ?? a.torso, b.head ?? b.torso, t),
  armNear: lerpLimb(a.armNear, b.armNear, t),
  armFar: lerpLimb(a.armFar, b.armFar, t),
  legNear: lerpLimb(a.legNear, b.legNear, t),
  legFar: lerpLimb(a.legFar, b.legFar, t),
});

export const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

export const cycleLength = (keyframes: Keyframe[]) =>
  keyframes.reduce((total, keyframe) => total + (keyframe.hold ?? 0) + keyframe.duration, 0);

export type Sample = {
  pose: Pose;
  index: number;
  holding: boolean;
  progress: number;
  time: number;
};

export function sampleTimeline(keyframes: Keyframe[], seconds: number): Sample {
  const time = ((seconds % cycleLength(keyframes)) + cycleLength(keyframes)) % cycleLength(keyframes);
  let cursor = 0;
  for (let index = 0; index < keyframes.length; index += 1) {
    const keyframe = keyframes[index];
    const hold = keyframe.hold ?? 0;
    if (time < cursor + hold) return { pose: keyframe.pose, index, holding: true, progress: 0, time };
    if (time < cursor + hold + keyframe.duration) {
      const progress = (time - cursor - hold) / keyframe.duration;
      const next = keyframes[(index + 1) % keyframes.length].pose;
      const eased = keyframe.ease === "linear" ? progress : easeInOut(progress);
      return { pose: interpolatePose(keyframe.pose, next, eased), index, holding: false, progress, time };
    }
    cursor += hold + keyframe.duration;
  }
  return { pose: keyframes[0].pose, index: 0, holding: true, progress: 0, time };
}

const effortLevel: Record<Effort, number> = { concentric: 1, eccentric: 0.62, isometric: 0.85 };

export function activation(keyframes: Keyframe[], sample: Sample): number {
  const current = keyframes[sample.index];
  const previous = keyframes[(sample.index + keyframes.length - 1) % keyframes.length];
  if (current.effort === "isometric") return effortLevel.isometric + 0.15 * Math.sin(sample.time * Math.PI);
  if (sample.holding) return previous.effort === "concentric" ? 1 : effortLevel[current.effort];
  const from = previous.effort === "isometric" ? effortLevel.isometric : effortLevel[previous.effort];
  return lerp(from, effortLevel[current.effort], Math.min(1, sample.progress * 3));
}

export const jointAngle = (a: Point, vertex: Point, b: Point): number => {
  const first = angleOf({ x: a.x - vertex.x, y: a.y - vertex.y });
  const second = angleOf({ x: b.x - vertex.x, y: b.y - vertex.y });
  const difference = Math.abs(first - second) % 360;
  return difference > 180 ? 360 - difference : difference;
};
