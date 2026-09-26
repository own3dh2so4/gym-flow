import { describe, expect, it } from "vitest";
import { Keyframe, Pose } from "../domain/types";
import { SEGMENT, activation, computeSkeleton, distance, interpolatePose, sampleTimeline, solveLimb } from "./rig";

const standing: Pose = {
  pelvis: { x: 150, y: 138 },
  torso: 180,
  armNear: { upper: 0, lower: 0 },
  armFar: { upper: 0, lower: 0 },
  legNear: { target: { x: 152, y: 214 }, bend: 1 },
  legFar: { target: { x: 150, y: 214 }, bend: 1 },
};

describe("rig", () => {
  it("places a reachable IK target exactly and keeps segment lengths", () => {
    const root = { x: 0, y: 0 };
    const solved = solveLimb(root, { target: { x: 20, y: 50 }, bend: 1 }, SEGMENT.thigh, SEGMENT.shin);
    expect(distance(solved.end, { x: 20, y: 50 })).toBeLessThan(0.01);
    expect(distance(root, solved.mid)).toBeCloseTo(SEGMENT.thigh, 5);
    expect(distance(solved.mid, solved.end)).toBeCloseTo(SEGMENT.shin, 5);
  });

  it("bends the knee to the side given by the bend sign", () => {
    const forward = solveLimb({ x: 0, y: 0 }, { target: { x: 0, y: 60 }, bend: 1 }, SEGMENT.thigh, SEGMENT.shin);
    const backward = solveLimb({ x: 0, y: 0 }, { target: { x: 0, y: 60 }, bend: -1 }, SEGMENT.thigh, SEGMENT.shin);
    expect(forward.mid.x).toBeGreaterThan(0);
    expect(backward.mid.x).toBeLessThan(0);
  });

  it("resolves torso-frame targets relative to the shoulder", () => {
    const pose: Pose = { ...standing, armNear: { target: { x: 10, y: -20 }, bend: -1, frame: "torso" } };
    const { joints } = computeSkeleton(pose, "side");
    expect(joints.wristNear.x).toBeCloseTo(joints.shoulderNear.x + 10, 3);
    expect(joints.wristNear.y).toBeCloseTo(joints.shoulderNear.y + 20, 3);
  });

  it("interpolates poses between keyframes", () => {
    const low = { ...standing, pelvis: { x: 130, y: 178 } };
    expect(interpolatePose(standing, low, 0).pelvis).toEqual(standing.pelvis);
    expect(interpolatePose(standing, low, 1).pelvis).toEqual(low.pelvis);
    expect(interpolatePose(standing, low, 0.5).pelvis).toEqual({ x: 140, y: 158 });
  });

  it("samples holds, phases and muscle activation over a looping timeline", () => {
    const keyframes: Keyframe[] = [
      { pose: standing, duration: 2, hold: 1, label: "Baja", effort: "eccentric" },
      { pose: { ...standing, pelvis: { x: 130, y: 178 } }, duration: 1, label: "Sube", effort: "concentric" },
    ];
    expect(sampleTimeline(keyframes, 0.5)).toMatchObject({ index: 0, holding: true });
    expect(sampleTimeline(keyframes, 2)).toMatchObject({ index: 0, holding: false, progress: 0.5 });
    expect(sampleTimeline(keyframes, 3.5)).toMatchObject({ index: 1, holding: false, progress: 0.5 });
    expect(sampleTimeline(keyframes, 4.5)).toMatchObject({ index: 0, holding: true });
    expect(activation(keyframes, sampleTimeline(keyframes, 3.9))).toBe(1);
    expect(activation(keyframes, sampleTimeline(keyframes, 2.9))).toBeCloseTo(0.62, 2);
  });
});
