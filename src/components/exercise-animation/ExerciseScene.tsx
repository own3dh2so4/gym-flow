import { ExerciseAnimation, Joint, Point } from "../../domain/types";
import { activation, add, computeSkeleton, cycleLength, interpolatePose, sampleTimeline } from "../../animation/rig";
import { Figure, FigureDefs, MuscleLevels } from "./Figure";
import { PropShape, resolveAnchor } from "./Props";
import { polylinePath } from "./geometry";

export const DEFAULT_FLOOR = 222;
const ARROW_OFFSET = 14;

const MIN_HEIGHT = 170;
const MIN_HEIGHT_OVERHEAD = 110;
const PADDING = 16;

type Framing = { viewBox: [number, number, number, number]; trace: Point[] | null };

const framingCache = new WeakMap<ExerciseAnimation, Framing>();

function framing(animation: ExerciseAnimation): Framing {
  const cached = framingCache.get(animation);
  if (cached) return cached;
  const floor = animation.floor ?? DEFAULT_FLOOR;
  const overhead = animation.view === "top";
  const points: Point[] = overhead ? [] : [{ x: 160, y: floor + 6 }];
  const cycle = cycleLength(animation.keyframes);
  for (let step = 0; step < 40; step += 1) {
    const { joints } = computeSkeleton(sampleTimeline(animation.keyframes, (cycle * step) / 40).pose, animation.view);
    points.push(...Object.values(joints));
    animation.props.forEach((prop) => {
      if (prop.kind === "line") points.push(resolveAnchor(prop.from, joints), resolveAnchor(prop.to, joints));
      if (prop.kind === "polygon") points.push(...prop.points);
      if (prop.kind === "rect" || prop.kind === "circle" || prop.kind === "barbell" || prop.kind === "dumbbell") {
        const center = resolveAnchor(prop.at, joints);
        const extent = prop.kind === "rect" ? Math.max(prop.w, prop.h) / 2 : prop.kind === "circle" ? prop.r : prop.kind === "barbell" ? 16 : 12;
        points.push({ x: center.x - extent, y: center.y - extent }, { x: center.x + extent, y: center.y + extent });
      }
    });
  }
  const minX = Math.min(...points.map((point) => point.x)) - PADDING;
  const maxX = Math.max(...points.map((point) => point.x)) + PADDING;
  const minY = Math.min(...points.map((point) => point.y)) - PADDING;
  const maxY = overhead ? Math.max(...points.map((point) => point.y)) + PADDING * 2 : floor + 8;
  const height = Math.max(overhead ? MIN_HEIGHT_OVERHEAD : MIN_HEIGHT, maxY - minY, ((maxX - minX) * 3) / 4);
  const width = (height * 4) / 3;
  const result: Framing = {
    viewBox: [(minX + maxX) / 2 - width / 2, overhead ? (minY + maxY) / 2 - height / 2 : maxY - height, width, height],
    trace: animation.trace ? jointPath(animation, animation.trace, 0, cycle, 48) : null,
  };
  framingCache.set(animation, result);
  return result;
}

const jointPath = (animation: ExerciseAnimation, joint: Joint, from: number, to: number, steps: number): Point[] =>
  Array.from({ length: steps + 1 }, (_, step) => {
    const sample = sampleTimeline(animation.keyframes, from + ((to - from) * step) / steps);
    return computeSkeleton(sample.pose, animation.view).joints[joint];
  });

const arrowCache = new WeakMap<ExerciseAnimation, (Point[] | null)[]>();

function phaseArrows(animation: ExerciseAnimation): (Point[] | null)[] {
  const cached = arrowCache.get(animation);
  if (cached) return cached;
  const arrows = animation.keyframes.map((keyframe, index) => {
    const next = animation.keyframes[(index + 1) % animation.keyframes.length];
    const joint = keyframe.arrow ?? animation.arrow;
    const points = Array.from({ length: 11 }, (_, step) =>
      computeSkeleton(interpolatePose(keyframe.pose, next.pose, step / 10), animation.view).joints[joint],
    );
    const first = points[0];
    const last = points[points.length - 1];
    const chord = { x: last.x - first.x, y: last.y - first.y };
    const length = Math.hypot(chord.x, chord.y);
    if (length < 8) return null;
    const offset = animation.arrowOffset;
    if (offset) return points.slice(1, -1).map((point) => add(point, offset));
    const bodyJoints = Object.values(computeSkeleton(interpolatePose(keyframe.pose, next.pose, 0.5), animation.view).joints);
    const body = {
      x: bodyJoints.reduce((total, point) => total + point.x, 0) / bodyJoints.length,
      y: bodyJoints.reduce((total, point) => total + point.y, 0) / bodyJoints.length,
    };
    const normal = { x: -chord.y / length, y: chord.x / length };
    const middle = points[5];
    const awayFromBody = normal.x * (middle.x - body.x) + normal.y * (middle.y - body.y) >= 0 ? 1 : -1;
    return points.slice(1, -1).map((point) => add(point, normal, ARROW_OFFSET * awayFromBody));
  });
  arrowCache.set(animation, arrows);
  return arrows;
}

function guideLine(from: Point, to: Point): Point[] {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const unit = { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  return [
    { x: from.x - unit.x * 12, y: from.y - unit.y * 12 },
    { x: to.x + unit.x * 12, y: to.y + unit.y * 12 },
  ];
}

export function ExerciseScene({
  animation,
  time,
  idPrefix,
  ghost = false,
}: {
  animation: ExerciseAnimation;
  time: number;
  idPrefix: string;
  ghost?: boolean;
}) {
  const sample = sampleTimeline(animation.keyframes, time);
  const skeleton = computeSkeleton(sample.pose, animation.view);
  const keyframe = animation.keyframes[sample.index];
  const level = activation(animation.keyframes, sample);
  const floor = animation.floor ?? DEFAULT_FLOOR;

  const levels: MuscleLevels = {};
  animation.secondary.forEach((muscle) => {
    levels[muscle] = { level, role: "secondary" };
  });
  animation.primary.forEach((muscle) => {
    const resting = keyframe.active && !keyframe.active.includes(muscle);
    levels[muscle] = { level: resting ? 0.2 : level, role: "primary" };
  });

  const layer = (name: "back" | "mid" | "front") =>
    animation.props
      .filter((prop) => (prop.layer ?? "back") === name)
      .map((prop, index) => <PropShape key={`${name}-${index}`} prop={prop} joints={skeleton.joints} />);

  const guide = animation.guide ? guideLine(skeleton.joints[animation.guide[0]], skeleton.joints[animation.guide[1]]) : null;
  const { viewBox, trace } = framing(animation);
  const [left, top, width, height] = viewBox;
  const arrow = phaseArrows(animation)[sample.index];
  const ghostPose = animation.keyframes[Math.floor(animation.keyframes.length / 2)].pose;

  return (
    <svg className="exercise-scene" viewBox={viewBox.join(" ")} role="img" aria-label={animation.summary}>
      <FigureDefs idPrefix={idPrefix} />
      <rect x={left} y={top} width={width} height={height} fill="#fbf9f4" />
      {animation.view === "top" ? (
        <ellipse cx={skeleton.joints.pelvis.x + 4} cy={skeleton.joints.pelvis.y + 5} rx={24} ry={15} fill="#20251f" opacity={0.05} />
      ) : (
        <>
          <ellipse cx={skeleton.joints.pelvis.x} cy={floor + 2} rx={70} ry={5} fill="#20251f" opacity={0.07} />
          <line x1={left} y1={floor} x2={left + width} y2={floor} stroke="#deddd4" strokeWidth={1.2} />
        </>
      )}
      {layer("back")}
      {ghost && (
        <g opacity={0.3}>
          <Figure skeleton={computeSkeleton(ghostPose, animation.view)} view={animation.view} levels={{}} idPrefix={`${idPrefix}-ghost`} />
        </g>
      )}
      <Figure skeleton={skeleton} view={animation.view} levels={levels} idPrefix={idPrefix} midLayer={layer("mid")} />
      {layer("front")}
      {guide && <path d={polylinePath(guide)} fill="none" stroke="#5f8b52" strokeWidth={1.4} strokeDasharray="5 4" opacity={0.8} />}
      {trace && <path d={polylinePath(trace)} fill="none" stroke="#20251f" strokeWidth={1.2} strokeDasharray="3 4" opacity={0.35} />}
      {arrow && (
        <path
          d={polylinePath(arrow)}
          fill="none"
          stroke="#e7624b"
          strokeWidth={2.4}
          strokeLinecap="round"
          markerEnd={`url(#${idPrefix}-arrow)`}
          opacity={0.9}
        />
      )}
    </svg>
  );
}
