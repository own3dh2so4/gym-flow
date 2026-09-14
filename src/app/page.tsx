"use client";

import { useEffect, useMemo, useState } from "react";
import { exercises } from "../data/exercises";
import { getCurrentProgram, monthlyPrograms } from "../data/programs";
import { MonthlyProgram, ProgressionWeek, Workout } from "../domain/types";

type Tab = "inicio" | "rutinas" | "progreso";
type ActiveSession = { workout: Workout; week: ProgressionWeek };

const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "long" });

export default function Home() {
  const currentProgram = useMemo(getCurrentProgram, []);
  const currentMonth = new Date().getMonth();
  const [tab, setTab] = useState<Tab>("inicio");
  const [browseMonth, setBrowseMonth] = useState(currentMonth);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("gym-flow-completed");
      if (stored) setCompleted(JSON.parse(stored) as string[]);
    } catch {
      window.localStorage.removeItem("gym-flow-completed");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("gym-flow-completed", JSON.stringify(completed));
  }, [completed]);

  const openWorkout = (workout: Workout, week = currentProgram.progression[0]) => {
    setActiveSession({ workout, week });
  };

  if (activeSession) {
    return (
      <WorkoutView
        session={activeSession}
        completed={completed}
        onToggle={(exerciseId) => {
          const key = `${activeSession.workout.id}:${exerciseId}`;
          setCompleted((current) =>
            current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
          );
        }}
        onBack={() => setActiveSession(null)}
        onFinish={() => {
          setActiveSession(null);
          setTab("progreso");
        }}
      />
    );
  }

  const browsedProgram = monthlyPrograms[browseMonth];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✳</span>
          <span>GYM<span className="brand-accent">FLOW</span></span>
        </div>
        <span className="year-label">{new Date().getFullYear()}</span>
      </header>

      {tab === "inicio" && (
        <HomeTab
          program={currentProgram}
          completed={completed}
          onSelect={openWorkout}
          onBrowse={() => {
            setBrowseMonth(currentMonth);
            setTab("rutinas");
          }}
        />
      )}
      {tab === "rutinas" && (
        <RoutinesTab
          program={browsedProgram}
          isCurrent={browseMonth === currentMonth}
          onPrevious={() => setBrowseMonth((month) => (month + 11) % 12)}
          onNext={() => setBrowseMonth((month) => (month + 1) % 12)}
          onSelect={openWorkout}
        />
      )}
      {tab === "progreso" && <ProgressTab completedCount={completed.length} />}

      <nav className="bottom-nav" aria-label="Navegación principal">
        <NavButton active={tab === "inicio"} icon="⌂" label="Hoy" onClick={() => setTab("inicio")} />
        <NavButton active={tab === "rutinas"} icon="▦" label="Rutinas" onClick={() => setTab("rutinas")} />
        <NavButton active={tab === "progreso"} icon="↗" label="Progreso" onClick={() => setTab("progreso")} />
      </nav>
    </main>
  );
}

function HomeTab({
  program,
  completed,
  onSelect,
  onBrowse,
}: {
  program: MonthlyProgram;
  completed: string[];
  onSelect: (workout: Workout) => void;
  onBrowse: () => void;
}) {
  const finishedDays = program.workouts.filter((workout) =>
    workout.exercises.every((item) => completed.includes(`${workout.id}:${item.exerciseId}`)),
  ).length;
  const monthName = monthFormatter.format(new Date(2026, program.month - 1));

  return (
    <div className="content">
      <section className="eyebrow-row">
        <span>{monthName.toUpperCase()} · MES {String(program.month).padStart(2, "0")}</span>
        <span className="status-dot">● EN CURSO</span>
      </section>
      <section className="hero-card">
        <div className="hero-copy">
          <p className="overline">RUTINA DEL MES</p>
          <h1>{program.name}<br /><em>{program.tagline.toLowerCase()}</em></h1>
          <p className="muted">{program.description}</p>
          <button className="primary-button" onClick={() => onSelect(program.workouts[0])}>
            Empezar sesión <span>→</span>
          </button>
          <button className="text-button" onClick={onBrowse}>Ver plan completo</button>
        </div>
        <div className="hero-art" aria-label="Ilustración abstracta de entrenamiento">
          <div className="sun" /><div className="figure">◒</div><div className="barbell" />
        </div>
      </section>
      <div className="section-heading">
        <div><p className="overline">ESTA SEMANA</p><h2>Tu ritmo, tu regla.</h2></div>
        <span className="week-progress">{finishedDays} / {program.days}</span>
      </div>
      <div className="week-dots">
        {program.workouts.map((workout, index) => {
          const done = workout.exercises.every((item) =>
            completed.includes(`${workout.id}:${item.exerciseId}`),
          );
          return (
            <button className={`day-chip ${done ? "done" : ""}`} key={workout.id} onClick={() => onSelect(workout)}>
              <span>DÍA {index + 1}</span>
              <strong>{done ? "✓" : workout.focus.split(" ")[0]}</strong>
              <small>{workout.exercises.length} ejercicios</small>
            </button>
          );
        })}
      </div>
      <section className="tip-card">
        <span className="tip-icon">↗</span>
        <div><p className="overline">NOTA DE COACH</p><p>{program.progression[0].guidance}</p></div>
      </section>
    </div>
  );
}

function RoutinesTab({
  program,
  isCurrent,
  onPrevious,
  onNext,
  onSelect,
}: {
  program: MonthlyProgram;
  isCurrent: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (workout: Workout, week: ProgressionWeek) => void;
}) {
  const [weekIndex, setWeekIndex] = useState(0);
  const selectedWeek = program.progression[weekIndex];
  const monthName = monthFormatter.format(new Date(2026, program.month - 1));

  useEffect(() => setWeekIndex(0), [program.month]);

  return (
    <div className="content">
      <div className="month-selector">
        <button aria-label="Mes anterior" onClick={onPrevious}>‹</button>
        <div><strong>{monthName} 2026</strong>{isCurrent && <small>Mes actual</small>}</div>
        <button aria-label="Mes siguiente" onClick={onNext}>›</button>
      </div>
      <section className="page-title routine-title">
        <p className="overline">{program.split.toUpperCase()} · {program.days} DÍAS</p>
        <h1>{program.name}</h1>
        <p className="muted">{program.description}</p>
        <div className="goal-pill">Objetivo · {program.goal}</div>
      </section>

      <div className="progression-heading">
        <div><p className="overline">PROGRESIÓN DEL MES</p><h2>{selectedWeek.name} · {selectedWeek.rir}</h2></div>
      </div>
      <div className="week-selector">
        {program.progression.map((week, index) => (
          <button
            className={weekIndex === index ? "active" : ""}
            key={week.week}
            onClick={() => setWeekIndex(index)}
          >
            <span>SEM</span><strong>{week.week}</strong>
          </button>
        ))}
      </div>
      <p className="week-guidance">{selectedWeek.guidance}</p>

      <section className="workout-list">
        {program.workouts.map((workout, index) => (
          <button className="workout-row" key={workout.id} onClick={() => onSelect(workout, selectedWeek)}>
            <span className="workout-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="workout-info">
              <strong>{workout.name}</strong>
              <small>{workout.focus}</small>
              <small>{workout.exercises.length} ejercicios · {workout.duration} min</small>
            </span>
            <span>→</span>
          </button>
        ))}
      </section>
      <p className="disclaimer">
        Separa dos sesiones exigentes del mismo grupo muscular cuando sea posible. La semana 4 reduce una serie por ejercicio.
      </p>
    </div>
  );
}

function ProgressTab({ completedCount }: { completedCount: number }) {
  return (
    <div className="content">
      <section className="page-title">
        <p className="overline">TU VIAJE</p>
        <h1>Pequeños pasos.<br /><em>Gran cambio.</em></h1>
      </section>
      <div className="stats-grid">
        <div><strong>{completedCount}</strong><span>ejercicios</span></div>
        <div><strong>{Math.floor(completedCount / 7)}</strong><span>sesiones aprox.</span></div>
        <div><strong>—</strong><span>racha actual</span></div>
      </div>
      <section className="empty-progress">
        <div className="empty-icon">✦</div>
        <h2>{completedCount ? "Sigue construyendo" : "Tu historia empieza hoy"}</h2>
        <p>Completa sesiones de forma consistente. La técnica y la recuperación cuentan tanto como la carga.</p>
      </section>
    </div>
  );
}

function WorkoutView({
  session,
  completed,
  onToggle,
  onBack,
  onFinish,
}: {
  session: ActiveSession;
  completed: string[];
  onToggle: (exerciseId: string) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const { workout, week } = session;

  return (
    <main className="app-shell workout-shell">
      <header className="workout-header">
        <button className="back-button" aria-label="Volver" onClick={onBack}>←</button>
        <div><p className="overline">SEMANA {week.week} · {week.rir}</p><strong>{workout.name}</strong></div>
        <span>{workout.duration}′</span>
      </header>
      <div className="content workout-content">
        <section className="workout-intro">
          <span className="workout-label">SESIÓN EN CURSO</span>
          <h1>{workout.focus}</h1>
          <p className="muted">{week.guidance}</p>
          <details className="prep-details">
            <summary>Calentamiento recomendado</summary>
            <ul>{workout.warmup.map((item) => <li key={item}>{item}</li>)}</ul>
          </details>
        </section>
        <div className="exercise-stack">
          {workout.exercises.map((item, index) => {
            const exercise = exercises.find((entry) => entry.id === item.exerciseId);
            if (!exercise) return null;
            const key = `${workout.id}:${item.exerciseId}`;
            const done = completed.includes(key);
            const effectiveSets = Math.max(1, item.sets + week.setAdjustment);

            return (
              <article className={`exercise-card ${done ? "exercise-done" : ""}`} key={item.exerciseId}>
                <div className="exercise-visual">
                  <div className="visual-line" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="exercise-body">
                  <div className="exercise-heading">
                    <div><h2>{exercise.name}</h2><p>{exercise.muscle} · {exercise.equipment}</p></div>
                    <button className="check-button" aria-label={`Marcar ${exercise.name}`} onClick={() => onToggle(exercise.id)}>
                      {done ? "✓" : "○"}
                    </button>
                  </div>
                  <div className="exercise-meta">
                    <span>{effectiveSets} series</span><span>{item.reps}</span><span>{item.rest} descanso</span>
                  </div>
                  <details>
                    <summary>Ver técnica y seguridad</summary>
                    <ol>{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    <p className="cue"><strong>Claves:</strong> {exercise.cues.join(" · ")}</p>
                    <p className="cue"><strong>Evita:</strong> {exercise.mistakes.join(" · ")}</p>
                    <p className="cue"><strong>Respiración:</strong> {exercise.breathing}</p>
                    <p className="cue"><strong>Alternativa:</strong> {exercise.substitution}</p>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
        <details className="prep-details cooldown-details">
          <summary>Vuelta a la calma</summary>
          <ul>{workout.cooldown.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
        <button className="primary-button finish-button" onClick={onFinish}>Terminar sesión <span>✓</span></button>
      </div>
    </main>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span>{label}</button>;
}
