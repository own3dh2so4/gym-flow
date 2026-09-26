import { Point } from "../../domain/types";
import { add, direction } from "../../animation/rig";

const format = (value: number) => Math.round(value * 10) / 10;
const pt = (point: Point) => `${format(point.x)} ${format(point.y)}`;

export function capsulePath(start: Point, end: Point, startRadius: number, endRadius: number): string {
  const length = Math.max(0.01, Math.hypot(end.x - start.x, end.y - start.y));
  const u = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
  const n = { x: -u.y, y: u.x };
  const sine = Math.max(-0.95, Math.min(0.95, (startRadius - endRadius) / length));
  const cosine = Math.sqrt(1 - sine * sine);
  const m = { x: n.x * cosine + u.x * sine, y: n.y * cosine + u.y * sine };
  const mirrored = { x: -n.x * cosine + u.x * sine, y: -n.y * cosine + u.y * sine };
  const a1 = add(start, m, startRadius);
  const a2 = add(end, m, endRadius);
  const b1 = add(start, mirrored, startRadius);
  const b2 = add(end, mirrored, endRadius);
  const endLarge = sine > 0 ? 0 : 1;
  const startLarge = sine > 0 ? 1 : 0;
  return [
    `M${pt(a1)}`,
    `L${pt(a2)}`,
    `A${format(endRadius)} ${format(endRadius)} 0 ${endLarge} 0 ${pt(b2)}`,
    `L${pt(b1)}`,
    `A${format(startRadius)} ${format(startRadius)} 0 ${startLarge} 0 ${pt(a1)}`,
    "Z",
  ].join(" ");
}

export function smoothClosedPath(points: Point[]): string {
  const count = points.length;
  const segments = points.map((current, index) => {
    const previous = points[(index - 1 + count) % count];
    const next = points[(index + 1) % count];
    const afterNext = points[(index + 2) % count];
    const control1 = { x: current.x + (next.x - previous.x) / 6, y: current.y + (next.y - previous.y) / 6 };
    const control2 = { x: next.x - (afterNext.x - current.x) / 6, y: next.y - (afterNext.y - current.y) / 6 };
    return `C${pt(control1)} ${pt(control2)} ${pt(next)}`;
  });
  return `M${pt(points[0])} ${segments.join(" ")} Z`;
}

type ProfileStation = [t: number, negativeSide: number, positiveSide: number];

export function profilePath(start: Point, angle: number, length: number, sideAngle: number, stations: ProfileStation[]): string {
  const axis = direction(angle);
  const side = direction(sideAngle);
  const positive = stations.map(([t, , width]) => add(add(start, axis, t * length), side, width));
  const negative = stations.map(([t, width]) => add(add(start, axis, t * length), side, -width)).reverse();
  return smoothClosedPath([...positive, ...negative]);
}

export const polylinePath = (points: Point[]) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"}${pt(point)}`).join(" ");

export function bandPath(origin: Point, angle: number, from: number, to: number, halfWidth: number): string {
  const axis = direction(angle);
  const across = direction(angle + 90);
  const corners = [
    add(add(origin, axis, from), across, halfWidth),
    add(add(origin, axis, to), across, halfWidth),
    add(add(origin, axis, to), across, -halfWidth),
    add(add(origin, axis, from), across, -halfWidth),
  ];
  return `${polylinePath(corners)} Z`;
}
