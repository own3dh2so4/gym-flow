"use client";

import { useEffect, useId, useRef, useState } from "react";
import { sampleTimeline } from "../../animation/rig";
import { AnimationView } from "../../domain/types";
import { animationById } from "../../data/animations";
import { ExerciseScene } from "./ExerciseScene";
import { muscleNames } from "./muscles";

const VIEW_LABELS: Record<AnimationView, string> = {
  side: "Vista lateral",
  front: "Vista frontal",
  back: "Vista trasera",
  top: "Vista desde arriba",
};

export function ExerciseAnimation({ exerciseId }: { exerciseId: string }) {
  const animation = animationById[exerciseId];
  const idPrefix = `anim${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const container = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = !videoFailed;

  const fallBackToIllustration = () => {
    setVideoFailed(true);
    setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    setPlaying(!query.matches);
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const player = video.current;
    if (player && (player.error || player.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) fallBackToIllustration();
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!useVideo || !player) return;
    if (playing && visible) player.play().catch(() => !player.error && setPlaying(false));
    else player.pause();
  }, [playing, visible, useVideo]);

  useEffect(() => {
    if (!playing || !visible) return;
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (useVideo && video.current) {
        setTime(video.current.currentTime);
      } else if (previous !== null) {
        const elapsed = Math.min(0.1, (now - previous) / 1000);
        setTime((current) => current + elapsed);
      }
      previous = now;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, visible, useVideo]);

  if (!animation) return null;

  const sample = sampleTimeline(animation.keyframes, time);
  const keyframe = animation.keyframes[sample.index];
  const label = sample.holding ? keyframe.holdLabel ?? keyframe.label : keyframe.label;

  return (
    <figure className="exercise-animation" ref={container}>
      <div className="animation-stage">
        {useVideo ? (
          <video
            ref={video}
            className="exercise-video"
            src={`/animations/${exerciseId}.mp4`}
            poster={`/animations/${exerciseId}.jpg`}
            muted
            loop
            playsInline
            preload={reducedMotion ? "none" : "auto"}
            aria-label={animation.summary}
            onError={fallBackToIllustration}
          />
        ) : (
          <>
            <span className="animation-view">{VIEW_LABELS[animation.view]}</span>
            <ExerciseScene animation={animation} time={time} idPrefix={idPrefix} ghost={reducedMotion && !playing} />
          </>
        )}
      </div>
      <figcaption>
        <div className="animation-controls">
          <button
            className="animation-toggle"
            aria-label={playing ? "Pausar animación" : "Reproducir animación"}
            onClick={() => setPlaying((current) => !current)}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <div className="animation-phase">
            <strong>{label}</strong>
            <span>{animation.cue}</span>
          </div>
        </div>
        <ul className="muscle-chips" aria-label="Músculos trabajados">
          {animation.primary.map((muscle) => (
            <li key={muscle} className="muscle-chip primary">{muscleNames[muscle]}</li>
          ))}
          {animation.secondary.map((muscle) => (
            <li key={muscle} className="muscle-chip">{muscleNames[muscle]}</li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
