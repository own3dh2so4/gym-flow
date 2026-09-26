"use client";

import Link from "next/link";
import { ExerciseAnimation } from "../../components/exercise-animation/ExerciseAnimation";
import { exercises } from "../../data/exercises";

export default function ExerciseLibrary() {
  return (
    <main className="app-shell">
      <header className="workout-header">
        <Link className="back-button" aria-label="Volver" href="/">←</Link>
        <div><p className="overline">BIBLIOTECA</p><strong>Todos los ejercicios</strong></div>
        <span>{exercises.length}</span>
      </header>
      <div className="content">
        <section className="page-title">
          <p className="overline">TÉCNICA ANIMADA</p>
          <h1>Muévete<br /><em>con intención.</em></h1>
          <p className="muted">El músculo que trabaja se ilumina al contraerse. Las flechas marcan la dirección del movimiento.</p>
          <p className="safety-note">Para si sientes dolor. Esta guía es educativa y no sustituye consejo médico.</p>
        </section>
        <div className="library-grid">
          {exercises.map((exercise) => (
            <article className="library-card" key={exercise.id}>
              <h2>{exercise.name}</h2>
              <p>{exercise.muscle} · {exercise.equipment}</p>
              <ExerciseAnimation exerciseId={exercise.id} />
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
