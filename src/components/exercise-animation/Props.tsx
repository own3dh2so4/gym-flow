import { Anchor, Joint, Point, Prop, PropTone } from "../../domain/types";
import { add, angleOf, direction } from "../../animation/rig";

const TONES: Record<PropTone, { fill: string; stroke: string }> = {
  ink: { fill: "#2b302a", stroke: "#151814" },
  steel: { fill: "#a3a89f", stroke: "#6f746b" },
  light: { fill: "#dcd8ce", stroke: "#a9a498" },
  pad: { fill: "#3f4d48", stroke: "#28312d" },
  cable: { fill: "#6f756c", stroke: "#6f756c" },
};

const segmentNormal = (from: Point, to: Point) => direction(angleOf({ x: to.x - from.x, y: to.y - from.y }) + 90);

export function resolveAnchor(anchor: Anchor, joints: Record<Joint, Point>): Point {
  if ("joint" in anchor) return { x: joints[anchor.joint].x + (anchor.dx ?? 0), y: joints[anchor.joint].y + (anchor.dy ?? 0) };
  if ("between" in anchor) {
    const from = joints[anchor.between[0]];
    const to = joints[anchor.between[1]];
    const point = { x: from.x + (to.x - from.x) * anchor.t, y: from.y + (to.y - from.y) * anchor.t };
    return add(point, segmentNormal(from, to), anchor.offset ?? 0);
  }
  return anchor;
}

export function PropShape({ prop, joints }: { prop: Prop; joints: Record<Joint, Point> }) {
  switch (prop.kind) {
    case "line": {
      const from = resolveAnchor(prop.from, joints);
      const to = resolveAnchor(prop.to, joints);
      const tone = TONES[prop.tone];
      return (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={prop.tone === "cable" ? tone.stroke : tone.fill}
          strokeWidth={prop.width}
          strokeLinecap="round"
        />
      );
    }
    case "rect": {
      const at = resolveAnchor(prop.at, joints);
      const tone = TONES[prop.tone];
      return (
        <rect
          x={at.x - prop.w / 2}
          y={at.y - prop.h / 2}
          width={prop.w}
          height={prop.h}
          rx={prop.radius ?? 2}
          fill={tone.fill}
          stroke={tone.stroke}
          strokeWidth={0.8}
          transform={prop.angle ? `rotate(${prop.angle} ${at.x} ${at.y})` : undefined}
        />
      );
    }
    case "circle": {
      const at = resolveAnchor(prop.at, joints);
      const tone = TONES[prop.tone];
      return <circle cx={at.x} cy={at.y} r={prop.r} fill={tone.fill} stroke={tone.stroke} strokeWidth={0.8} />;
    }
    case "polygon": {
      const tone = TONES[prop.tone];
      return (
        <polygon
          points={prop.points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill={tone.fill}
          stroke={tone.stroke}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      );
    }
    case "barbell": {
      const at = resolveAnchor(prop.at, joints);
      if (prop.span) {
        const left = resolveAnchor(prop.span[0], joints);
        const right = resolveAnchor(prop.span[1], joints);
        const along = { x: right.x - left.x, y: right.y - left.y };
        const length = Math.hypot(along.x, along.y) || 1;
        const unit = { x: along.x / length, y: along.y / length };
        const outerLeft = add(left, unit, -34);
        const outerRight = add(right, unit, 34);
        const plate = (center: Point) => (
          <rect x={center.x - 4} y={center.y - 17} width={8} height={34} rx={2} fill={TONES.ink.fill} stroke={TONES.ink.stroke} strokeWidth={0.8} />
        );
        return (
          <g>
            <line x1={outerLeft.x} y1={outerLeft.y} x2={outerRight.x} y2={outerRight.y} stroke={TONES.steel.stroke} strokeWidth={3} strokeLinecap="round" />
            {plate(add(left, unit, -24))}
            {plate(add(right, unit, 24))}
          </g>
        );
      }
      return (
        <g>
          <circle cx={at.x} cy={at.y} r={16} fill={TONES.ink.fill} stroke={TONES.ink.stroke} strokeWidth={0.8} />
          <circle cx={at.x} cy={at.y} r={11} fill="none" stroke="#454b44" strokeWidth={1.2} />
          <circle cx={at.x} cy={at.y} r={3} fill={TONES.steel.fill} stroke={TONES.steel.stroke} strokeWidth={0.8} />
        </g>
      );
    }
    case "dumbbell": {
      const at = resolveAnchor(prop.at, joints);
      if (prop.orient === "end") {
        return (
          <g>
            <circle cx={at.x} cy={at.y} r={7.5} fill={TONES.ink.fill} stroke={TONES.ink.stroke} strokeWidth={0.8} />
            <circle cx={at.x} cy={at.y} r={2.2} fill={TONES.steel.fill} />
          </g>
        );
      }
      const axis =
        prop.orient === "grip" && prop.along
          ? segmentNormal(joints[prop.along[0]], joints[prop.along[1]])
          : direction(prop.orient === "vertical" ? 180 : 90);
      const rotation = 90 - angleOf(axis);
      const head = (offset: number) => {
        const center = add(at, axis, offset);
        return (
          <rect
            x={center.x - 3.5}
            y={center.y - 7}
            width={7}
            height={14}
            rx={2}
            fill={TONES.ink.fill}
            stroke={TONES.ink.stroke}
            strokeWidth={0.8}
            transform={`rotate(${rotation} ${center.x} ${center.y})`}
          />
        );
      };
      const from = add(at, axis, -8);
      const to = add(at, axis, 8);
      return (
        <g>
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={TONES.steel.stroke} strokeWidth={3} />
          {head(-9)}
          {head(9)}
        </g>
      );
    }
  }
}
