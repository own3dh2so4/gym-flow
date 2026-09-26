import { describe, expect, it } from "vitest";
import { SEGMENT, computeSkeleton, cycleLength, distance, isIk, jointAngle, sampleTimeline } from "../animation/rig";
import { musclePatches, topTorsoSpots } from "../components/exercise-animation/muscles";
import { LimbPose, Pose } from "../domain/types";
import { exerciseAnimations } from "./animations";
import { exercises } from "./exercises";

const limbs = ["armNear", "armFar", "legNear", "legFar"] as const;
const SAMPLES = 60;

const framesOf = (animation: (typeof exerciseAnimations)[number]) =>
  Array.from({ length: SAMPLES }, (_, step) => sampleTimeline(animation.keyframes, (cycleLength(animation.keyframes) * step) / SAMPLES).pose);

const wrap = (value: number) => ((((value + 180) % 360) + 360) % 360) - 180;

const limbKind = (limb: LimbPose) => (isIk(limb) ? `ik:${limb.frame ?? "world"}` : "fk");

describe("exercise animations", () => {
  it("defines exactly one animation for every exercise", () => {
    const ids = exerciseAnimations.map((animation) => animation.exerciseId);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(exercises.map((exercise) => exercise.id).sort());
  });

  it("has a looping timeline with Spanish labels and a visible primary muscle", () => {
    exerciseAnimations.forEach((animation) => {
      expect(animation.keyframes.length, animation.exerciseId).toBeGreaterThanOrEqual(2);
      expect(animation.primary.length, animation.exerciseId).toBeGreaterThan(0);
      expect(animation.summary.length, animation.exerciseId).toBeGreaterThan(20);
      animation.keyframes.forEach((keyframe) => {
        expect(keyframe.duration, animation.exerciseId).toBeGreaterThan(0);
        expect(keyframe.label.length, animation.exerciseId).toBeGreaterThan(0);
      });
      animation.primary.forEach((muscle) => {
        const drawn =
          musclePatches[animation.view].some((patch) => patch.muscle === muscle) ||
          (animation.view === "top" && Boolean(topTorsoSpots[muscle]));
        expect(drawn, `${animation.exerciseId}: ${muscle} is not drawn in the ${animation.view} view`).toBe(true);
      });
    });
  });

  it("keeps each limb in the same control mode and bend direction across keyframes", () => {
    exerciseAnimations.forEach((animation) => {
      limbs.forEach((limb) => {
        const kinds = new Set(animation.keyframes.map((keyframe) => limbKind(keyframe.pose[limb])));
        expect(kinds.size, `${animation.exerciseId} ${limb}`).toBe(1);
        const bends = new Set(animation.keyframes.map((keyframe) => (isIk(keyframe.pose[limb]) ? keyframe.pose[limb].bend : 0)));
        expect(bends.size, `${animation.exerciseId} ${limb} flips its bend`).toBe(1);
      });
    });
  });

  it("only folds elbows forward in side views", () => {
    const externallyRotatedGrip = ["back-squat"];
    exerciseAnimations
      .filter((animation) => animation.view === "side" && !externallyRotatedGrip.includes(animation.exerciseId))
      .forEach((animation) => {
        framesOf(animation).forEach((pose) => {
          const { angles } = computeSkeleton(pose, animation.view);
          (["Near", "Far"] as const).forEach((side) => {
            const fold = wrap(angles[`forearm${side}`] - angles[`upperArm${side}`]);
            expect(fold, `${animation.exerciseId} elbow ${side} bends backwards`).toBeGreaterThanOrEqual(-8);
          });
        });
      });
  });

  it("only uses reachable IK targets, so planted feet and fixed hands never slide", () => {
    exerciseAnimations.forEach((animation) => {
      framesOf(animation).forEach((pose: Pose) => {
        const { joints } = computeSkeleton(pose, animation.view);
        (["legNear", "legFar"] as const).forEach((limb) => {
          const leg = pose[limb];
          if (!isIk(leg)) return;
          const ankle = limb === "legNear" ? joints.ankleNear : joints.ankleFar;
          expect(distance(ankle, leg.target), `${animation.exerciseId} ${limb}`).toBeLessThan(1);
        });
        (["armNear", "armFar"] as const).forEach((limb) => {
          const arm = pose[limb];
          if (!isIk(arm) || arm.frame) return;
          const wrist = limb === "armNear" ? joints.wristNear : joints.wristFar;
          expect(distance(wrist, arm.target), `${animation.exerciseId} ${limb}`).toBeLessThan(1);
        });
      });
    });
  });

  it("stays within anatomical knee and elbow ranges in every frame", () => {
    exerciseAnimations.forEach((animation) => {
      framesOf(animation).forEach((pose) => {
        const { joints, angles } = computeSkeleton(pose, animation.view);
        const kneeFlexion = [
          180 - jointAngle(joints.hipNear, joints.kneeNear, joints.ankleNear),
          180 - jointAngle(joints.hipFar, joints.kneeFar, joints.ankleFar),
        ];
        const elbowFlexion = [
          180 - jointAngle(joints.shoulderNear, joints.elbowNear, joints.wristNear),
          180 - jointAngle(joints.shoulderFar, joints.elbowFar, joints.wristFar),
        ];
        kneeFlexion.forEach((flexion) => expect(flexion, animation.exerciseId).toBeLessThanOrEqual(160));
        elbowFlexion.forEach((flexion) => expect(flexion, animation.exerciseId).toBeLessThanOrEqual(160));

        if (animation.view !== "side") return;
        (["Near", "Far"] as const).forEach((side) => {
          const thighToShin = wrap(angles[`shin${side}`] - angles[`thigh${side}`]);
          expect(thighToShin, `${animation.exerciseId} knee ${side} hyperextends`).toBeLessThanOrEqual(5);
        });
      });
    });
  });

  it("keeps the figure inside a sensible stage", () => {
    exerciseAnimations.forEach((animation) => {
      framesOf(animation).forEach((pose) => {
        const { joints } = computeSkeleton(pose, animation.view);
        Object.values(joints).forEach((point) => {
          expect(point.y, animation.exerciseId).toBeLessThanOrEqual((animation.floor ?? 222) + SEGMENT.foot);
        });
      });
    });
  });
});
