import { writeFileSync } from "fs";
import { join } from "path";
import { exerciseAnimations } from "../../src/data/animations";

const timelines = Object.fromEntries(
  exerciseAnimations.map((animation) => [
    animation.exerciseId,
    {
      primary: animation.primary,
      secondary: animation.secondary,
      keyframes: animation.keyframes.map((keyframe) => ({
        hold: keyframe.hold ?? 0,
        duration: keyframe.duration,
        effort: keyframe.effort,
        ease: keyframe.ease ?? "inOut",
        active: keyframe.active ?? null,
      })),
    },
  ]),
);

writeFileSync(join(__dirname, "timelines.json"), `${JSON.stringify(timelines, null, 2)}\n`);
