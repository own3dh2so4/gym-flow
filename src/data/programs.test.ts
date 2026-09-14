import { describe, expect, it } from "vitest";
import { exercises } from "./exercises";
import { monthlyPrograms } from "./programs";

describe("monthly programs", () => {
  it("defines one unique program for every month", () => {
    expect(monthlyPrograms).toHaveLength(12);
    expect(new Set(monthlyPrograms.map((program) => program.month)).size).toBe(12);
    expect(new Set(monthlyPrograms.map((program) => program.name)).size).toBe(12);
  });

  it("contains three or four complete weekly workouts", () => {
    monthlyPrograms.forEach((program) => {
      expect(program.workouts.length).toBeGreaterThanOrEqual(3);
      expect(program.workouts.length).toBeLessThanOrEqual(4);

      program.workouts.forEach((workout) => {
        expect(workout.exercises.length).toBeGreaterThanOrEqual(6);
        expect(workout.exercises.length).toBeLessThanOrEqual(10);
      });
    });
  });

  it("provides four progression weeks including a deload", () => {
    monthlyPrograms.forEach((program) => {
      expect(program.progression).toHaveLength(4);
      expect(program.progression[3].setAdjustment).toBe(-1);
    });
  });

  it("only references documented exercises", () => {
    const exerciseIds = new Set(exercises.map((exercise) => exercise.id));

    monthlyPrograms.forEach((program) => {
      program.workouts.forEach((workout) => {
        workout.exercises.forEach((item) => {
          expect(exerciseIds.has(item.exerciseId), item.exerciseId).toBe(true);
        });
      });
    });
  });
});
