import { ReactNode } from "react";
import { AnimationView, MuscleId, Point } from "../../domain/types";
import { SEGMENT, Skeleton, add, direction } from "../../animation/rig";
import { bandPath, capsulePath, profilePath } from "./geometry";
import { BodySegment, musclePatches, topTorsoSpots } from "./muscles";

export type MuscleLevel = { level: number; role: "primary" | "secondary" };
export type MuscleLevels = Partial<Record<MuscleId, MuscleLevel>>;

type Shade = { fill: string; stroke: string; highlight: string };

const NEAR: Shade = { fill: "#e6e2d9", stroke: "#9f9a8f", highlight: "#fbfaf6" };
const FAR: Shade = { fill: "#c9c4b9", stroke: "#958f84", highlight: "#dedad1" };
const SHORTS = "#3c423d";
const HAIR = "#4a4038";
const LIGHT = { x: -0.55, y: -0.83 };

type Part = {
  key: string;
  segment: BodySegment;
  start: Point;
  end: Point;
  startRadius: number;
  endRadius: number;
  angle: number;
  lateral?: Point;
};

type Side = "Near" | "Far";

const svgRotation = (angle: number) => 90 - angle;

export function Figure({
  skeleton,
  view,
  levels,
  idPrefix,
  midLayer,
}: {
  skeleton: Skeleton;
  view: AnimationView;
  levels: MuscleLevels;
  idPrefix: string;
  midLayer?: ReactNode;
}) {
  const { joints, angles } = skeleton;
  const frontal = view !== "side";
  const lateralNear = direction(angles.torso + 90);

  const arm = (side: Side): Part[] => [
    {
      key: `upperArm${side}`,
      segment: "upperArm",
      start: joints[`shoulder${side}`],
      end: joints[`elbow${side}`],
      startRadius: 6.4,
      endRadius: 4.4,
      angle: angles[`upperArm${side}`],
      lateral: frontal ? (side === "Near" ? lateralNear : { x: -lateralNear.x, y: -lateralNear.y }) : undefined,
    },
    {
      key: `forearm${side}`,
      segment: "forearm",
      start: joints[`elbow${side}`],
      end: joints[`wrist${side}`],
      startRadius: 4.4,
      endRadius: 3.1,
      angle: angles[`forearm${side}`],
      lateral: frontal ? (side === "Near" ? lateralNear : { x: -lateralNear.x, y: -lateralNear.y }) : undefined,
    },
  ];

  const leg = (side: Side): Part[] => [
    {
      key: `thigh${side}`,
      segment: "thigh",
      start: joints[`hip${side}`],
      end: joints[`knee${side}`],
      startRadius: frontal ? 9 : 10.5,
      endRadius: 6.2,
      angle: angles[`thigh${side}`],
      lateral: frontal ? (side === "Near" ? lateralNear : { x: -lateralNear.x, y: -lateralNear.y }) : undefined,
    },
    {
      key: `shin${side}`,
      segment: "shin",
      start: joints[`knee${side}`],
      end: joints[`ankle${side}`],
      startRadius: 6,
      endRadius: 3.6,
      angle: angles[`shin${side}`],
      lateral: frontal ? (side === "Near" ? lateralNear : { x: -lateralNear.x, y: -lateralNear.y }) : undefined,
    },
  ];

  const hand = (side: Side, shade: Shade) => (
    <ellipse
      cx={joints[`hand${side}`].x}
      cy={joints[`hand${side}`].y}
      rx={5.2}
      ry={3.9}
      fill={shade.fill}
      stroke={shade.stroke}
      strokeWidth={0.8}
      transform={`rotate(${svgRotation(angles[`hand${side}`])} ${joints[`hand${side}`].x} ${joints[`hand${side}`].y})`}
    />
  );

  const foot = (side: Side, shade: Shade) => {
    const ankle = joints[`ankle${side}`];
    if (frontal) {
      const lateral = side === "Near" ? lateralNear : { x: -lateralNear.x, y: -lateralNear.y };
      const center = add(add(ankle, lateral, 1.5), { x: 0, y: 5 });
      return <ellipse cx={center.x} cy={center.y} rx={5.5} ry={4.2} fill={shade.fill} stroke={shade.stroke} strokeWidth={0.8} />;
    }
    const along = direction(angles[`foot${side}`]);
    const sole = { x: -along.y, y: along.x };
    const heel = add(add(ankle, along, -4), sole, 4);
    const toe = add(add(ankle, along, 14), sole, 4.5);
    return <path d={capsulePath(heel, toe, 4, 2.6)} fill={shade.fill} stroke={shade.stroke} strokeWidth={0.8} />;
  };

  const partPath = (part: Part) => capsulePath(part.start, part.end, part.startRadius, part.endRadius);

  const musclesFor = (part: Part, pathId: string) => {
    const items = musclePatches[view].filter((patch) => patch.segment === part.segment && levels[patch.muscle]);
    if (!items.length) return null;
    const perpendicular = direction(part.angle + 90);
    const outward =
      part.lateral && perpendicular.x * part.lateral.x + perpendicular.y * part.lateral.y < 0
        ? { x: -perpendicular.x, y: -perpendicular.y }
        : perpendicular;
    return (
      <g clipPath={`url(#${pathId})`}>
        {items.map((patch, index) => {
          const radiusAt = (t: number) => part.startRadius + (part.endRadius - part.startRadius) * Math.min(1, Math.max(0, t));
          const middle = (patch.t0 + patch.t1) / 2;
          const base = {
            x: part.start.x + (part.end.x - part.start.x) * middle,
            y: part.start.y + (part.end.y - part.start.y) * middle,
          };
          return (
            <MusclePatchShape
              key={`${patch.muscle}-${index}`}
              center={add(base, outward, patch.side * radiusAt(middle))}
              length={Math.hypot(part.end.x - part.start.x, part.end.y - part.start.y) * (patch.t1 - patch.t0)}
              width={patch.width * radiusAt(middle)}
              angle={part.angle}
              state={levels[patch.muscle]!}
              idPrefix={idPrefix}
            />
          );
        })}
      </g>
    );
  };

  const limbPart = (part: Part, shade: Shade, shorts = false) => {
    const pathId = `${idPrefix}-${part.key}`;
    const d = partPath(part);
    const highlightOffset = part.startRadius * 0.32;
    return (
      <g key={part.key}>
        <clipPath id={pathId}><path d={d} /></clipPath>
        <path d={d} fill={shade.fill} />
        <path
          d={capsulePath(add(part.start, LIGHT, highlightOffset), add(part.end, LIGHT, part.endRadius * 0.32), part.startRadius * 0.45, part.endRadius * 0.45)}
          fill={shade.highlight}
          opacity={0.75}
        />
        {shorts && (
          <path
            clipPath={`url(#${pathId})`}
            d={bandPath(
              part.start,
              part.angle,
              -part.startRadius * 2,
              Math.hypot(part.end.x - part.start.x, part.end.y - part.start.y) * 0.32,
              part.startRadius + 2,
            )}
            fill={SHORTS}
          />
        )}
        {musclesFor(part, pathId)}
        <path d={d} fill="none" stroke={shade.stroke} strokeWidth={0.8} />
      </g>
    );
  };

  const limb = (parts: Part[], shade: Shade, extremity: ReactNode, isLeg: boolean) => (
    <g>
      {isLeg && extremity}
      {parts.map((part, index) => limbPart(part, shade, isLeg && index === 0))}
      {!isLeg && extremity}
    </g>
  );

  const torsoPart: Part = {
    key: "torso",
    segment: "torso",
    start: joints.pelvis,
    end: joints.neck,
    startRadius: frontal ? 15 : 10,
    endRadius: frontal ? 15 : 10,
    angle: angles.torso,
    lateral: frontal ? lateralNear : undefined,
  };

  const torsoPath = frontal
    ? profilePath(joints.pelvis, angles.torso, SEGMENT.torso, angles.torso + 90, [
        [-0.14, 13, 13],
        [0.06, 15.5, 15.5],
        [0.4, 12.5, 12.5],
        [0.74, 16, 16],
        [0.92, 18, 18],
        [1.03, 6, 6],
      ])
    : profilePath(joints.pelvis, angles.torso, SEGMENT.torso, angles.torso - 90, [
        [-0.16, 8, 6],
        [0.04, 11.5, 8.5],
        [0.38, 8, 7.5],
        [0.7, 9.5, 11],
        [0.9, 8.5, 8.5],
        [1.04, 4, 4],
      ]);

  const torsoId = `${idPrefix}-torso`;
  const torsoMuscles = () => {
    const items = musclePatches[view].filter((patch) => patch.segment === "torso" && levels[patch.muscle]);
    const axis = direction(angles.torso);
    const across = frontal ? lateralNear : direction(angles.torso - 90);
    const radius = torsoPart.startRadius;
    return (
      <g clipPath={`url(#${torsoId})`}>
        {items.flatMap((patch, index) => {
          const middle = (patch.t0 + patch.t1) / 2;
          const base = add(joints.pelvis, axis, middle * SEGMENT.torso);
          const sides = frontal && patch.side !== 0 ? [patch.side, -patch.side] : [patch.side];
          return sides.map((side, sideIndex) => (
            <MusclePatchShape
              key={`${patch.muscle}-${index}-${sideIndex}`}
              center={add(base, across, side * radius)}
              length={SEGMENT.torso * (patch.t1 - patch.t0)}
              width={patch.width * radius}
              angle={angles.torso}
              state={levels[patch.muscle]!}
              idPrefix={idPrefix}
            />
          ));
        })}
      </g>
    );
  };

  const torsoHighlight = add(add(joints.pelvis, direction(angles.torso), SEGMENT.torso * 0.55), LIGHT, frontal ? 4 : 3);

  const torso = (
    <g>
      <clipPath id={torsoId}><path d={torsoPath} /></clipPath>
      <path d={capsulePath(joints.neck, joints.head, 4.2, 4.2)} fill={NEAR.fill} stroke={NEAR.stroke} strokeWidth={0.8} />
      <path d={torsoPath} fill={NEAR.fill} />
      <g clipPath={`url(#${torsoId})`}>
        <ellipse
          cx={torsoHighlight.x}
          cy={torsoHighlight.y}
          rx={SEGMENT.torso * 0.36}
          ry={frontal ? 8 : 4.5}
          fill={NEAR.highlight}
          opacity={0.8}
          transform={`rotate(${svgRotation(angles.torso)} ${torsoHighlight.x} ${torsoHighlight.y})`}
        />
        <path
          d={bandPath(joints.pelvis, angles.torso, -SEGMENT.torso * 0.4, SEGMENT.torso * 0.14, 30)}
          fill={SHORTS}
        />
      </g>
      {torsoMuscles()}
      <path d={torsoPath} fill="none" stroke={NEAR.stroke} strokeWidth={0.8} />
      <Head skeleton={skeleton} view={view} idPrefix={idPrefix} />
    </g>
  );

  if (view === "top") {
    const facing = direction(angles.torso);
    const bodyId = `${idPrefix}-top-torso`;
    const spots = Object.entries(topTorsoSpots).flatMap(([muscle, spot]) => {
      const state = levels[muscle as MuscleId];
      if (!state || !spot) return [];
      const [across, forward, rx, ry] = spot;
      return (across === 0 ? [0] : [across, -across]).map((offset) => {
        const center = add(add(joints.pelvis, lateralNear, offset), facing, forward);
        return (
          <MusclePatchShape
            key={`${muscle}-${offset}`}
            center={center}
            length={rx * 2}
            width={ry * 2}
            angle={angles.torso + 90}
            state={state}
            idPrefix={idPrefix}
          />
        );
      });
    });
    const torsoRotation = `rotate(${-angles.torso} ${joints.pelvis.x} ${joints.pelvis.y})`;
    return (
      <g>
        <clipPath id={bodyId}>
          <ellipse cx={joints.pelvis.x} cy={joints.pelvis.y} rx={21} ry={11.5} transform={torsoRotation} />
        </clipPath>
        <ellipse cx={joints.pelvis.x} cy={joints.pelvis.y} rx={21} ry={11.5} fill={NEAR.fill} transform={torsoRotation} />
        <g clipPath={`url(#${bodyId})`}>{spots}</g>
        <ellipse cx={joints.pelvis.x} cy={joints.pelvis.y} rx={21} ry={11.5} fill="none" stroke={NEAR.stroke} strokeWidth={0.8} transform={torsoRotation} />
        {midLayer}
        {limb(arm("Far"), NEAR, hand("Far", NEAR), false)}
        {limb(arm("Near"), NEAR, hand("Near", NEAR), false)}
        <Head skeleton={skeleton} view={view} idPrefix={idPrefix} />
      </g>
    );
  }

  if (view === "front") {
    return (
      <g>
        {limb(leg("Far"), NEAR, foot("Far", NEAR), true)}
        {limb(leg("Near"), NEAR, foot("Near", NEAR), true)}
        {torso}
        {midLayer}
        {limb(arm("Far"), NEAR, hand("Far", NEAR), false)}
        {limb(arm("Near"), NEAR, hand("Near", NEAR), false)}
      </g>
    );
  }

  if (view === "back") {
    return (
      <g>
        {limb(leg("Far"), NEAR, foot("Far", NEAR), true)}
        {limb(leg("Near"), NEAR, foot("Near", NEAR), true)}
        {limb(arm("Far"), NEAR, hand("Far", NEAR), false)}
        {limb(arm("Near"), NEAR, hand("Near", NEAR), false)}
        {midLayer}
        {torso}
      </g>
    );
  }

  return (
    <g>
      {limb(arm("Far"), FAR, hand("Far", FAR), false)}
      {limb(leg("Far"), FAR, foot("Far", FAR), true)}
      {torso}
      {midLayer}
      {limb(leg("Near"), NEAR, foot("Near", NEAR), true)}
      {limb(arm("Near"), NEAR, hand("Near", NEAR), false)}
    </g>
  );
}

function Head({ skeleton, view, idPrefix }: { skeleton: Skeleton; view: AnimationView; idPrefix: string }) {
  const { head } = skeleton.joints;
  const angle = skeleton.angles.head;
  const radius = SEGMENT.headRadius;
  const clipId = `${idPrefix}-head`;
  const up = direction(angle);
  const forward = direction(angle - 90);
  const hairCenter =
    view === "side"
      ? add(add(head, up, 4), forward, -3.5)
      : view === "front"
        ? add(head, up, 5.5)
        : view === "top"
          ? add(head, up, -1.5)
          : add(head, up, 1.5);
  const nose = view === "top" ? add(head, up, radius - 0.5) : add(add(head, forward, radius - 0.5), up, -1);
  return (
    <g>
      <clipPath id={clipId}><circle cx={head.x} cy={head.y} r={radius} /></clipPath>
      <circle cx={head.x} cy={head.y} r={radius} fill={NEAR.fill} />
      <circle cx={head.x - 2.5} cy={head.y - 3} r={radius * 0.45} fill={NEAR.highlight} opacity={0.8} />
      <g clipPath={`url(#${clipId})`}>
        <circle cx={hairCenter.x} cy={hairCenter.y} r={radius * (view === "back" || view === "top" ? 1.05 : 0.9)} fill={HAIR} />
      </g>
      {(view === "side" || view === "top") && <circle cx={nose.x} cy={nose.y} r={2.2} fill={NEAR.fill} stroke={NEAR.stroke} strokeWidth={0.6} />}
      <circle cx={head.x} cy={head.y} r={radius} fill="none" stroke={NEAR.stroke} strokeWidth={0.8} />
    </g>
  );
}

function MusclePatchShape({
  center,
  length,
  width,
  angle,
  state,
  idPrefix,
}: {
  center: Point;
  length: number;
  width: number;
  angle: number;
  state: MuscleLevel;
  idPrefix: string;
}) {
  const primary = state.role === "primary";
  const bulge = primary ? 1 + 0.2 * (state.level - 0.6) : 1;
  return (
    <ellipse
      cx={center.x}
      cy={center.y}
      rx={Math.max(1, length / 2)}
      ry={Math.max(1, (width / 2) * bulge)}
      fill={`url(#${idPrefix}-${primary ? "muscle" : "muscle-soft"})`}
      opacity={primary ? 0.3 + 0.7 * state.level : 0.45 + 0.25 * state.level}
      transform={`rotate(${svgRotation(angle)} ${center.x} ${center.y})`}
    />
  );
}

export function FigureDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <radialGradient id={`${idPrefix}-muscle`} cx="42%" cy="38%" r="70%">
        <stop offset="0%" stopColor="#f58a70" />
        <stop offset="60%" stopColor="#e7624b" />
        <stop offset="100%" stopColor="#b8412e" />
      </radialGradient>
      <radialGradient id={`${idPrefix}-muscle-soft`} cx="42%" cy="38%" r="70%">
        <stop offset="0%" stopColor="#fbcdbf" />
        <stop offset="100%" stopColor="#ef9b86" />
      </radialGradient>
      <marker id={`${idPrefix}-arrow`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="#e7624b" />
      </marker>
    </defs>
  );
}
