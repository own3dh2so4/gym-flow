"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { exercises } from "../data/exercises";
import { getCurrentProgram, monthlyPrograms } from "../data/programs";
import { ExerciseAnimation } from "../components/exercise-animation/ExerciseAnimation";
import { Exercise, MonthlyProgram, ProgressionWeek, Workout } from "../domain/types";

type Tab = "inicio" | "rutinas" | "progreso" | "ajustes";
type ActiveSession = { workout: Workout; week: ProgressionWeek };
type CompletedSession = { workoutId: string; date: string; week: number };

const COMPLETED_KEY = "gym-flow-completed";
const SESSIONS_KEY = "gym-flow-sessions";

const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "long" });

export default function Home() {
  const currentProgram = useMemo(getCurrentProgram, []);
  const currentMonth = new Date().getMonth();
  const [tab, setTab] = useState<Tab>("inicio");
  const [browseMonth, setBrowseMonth] = useState(currentMonth);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [weekIndex, setWeekIndex] = useState(0);

  useEffect(() => {
    try {
      const storedCompleted = window.localStorage.getItem(COMPLETED_KEY);
      const storedSessions = window.localStorage.getItem(SESSIONS_KEY);
      if (storedCompleted) setCompleted(JSON.parse(storedCompleted) as string[]);
      if (storedSessions) setSessions(JSON.parse(storedSessions) as CompletedSession[]);
    } catch {
      window.localStorage.removeItem(COMPLETED_KEY);
      window.localStorage.removeItem(SESSIONS_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const openWorkout = (workout: Workout, week = currentProgram.progression[weekIndex]) => {
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
          setSessions((current) => [
            ...current,
            { workoutId: activeSession.workout.id, date: new Date().toISOString(), week: activeSession.week.week },
          ]);
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
          sessions={sessions}
          selectedWeek={currentProgram.progression[weekIndex]}
          weekIndex={weekIndex}
          onWeekChange={setWeekIndex}
          onSelect={(workout) => openWorkout(workout, currentProgram.progression[weekIndex])}
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
          weekIndex={weekIndex}
          onWeekChange={setWeekIndex}
          onSelect={openWorkout}
        />
      )}
      {tab === "progreso" && <ProgressTab completedCount={completed.length} sessions={sessions} />}
      {tab === "ajustes" && (
        <SettingsTab
          completed={completed}
          sessions={sessions}
          onImport={(nextCompleted, nextSessions) => {
            setCompleted(nextCompleted);
            setSessions(nextSessions);
          }}
          onReset={() => {
            setCompleted([]);
            setSessions([]);
          }}
        />
      )}

      <nav className="bottom-nav" aria-label="Navegación principal">
        <NavButton active={tab === "inicio"} icon="⌂" label="Hoy" onClick={() => setTab("inicio")} />
        <NavButton active={tab === "rutinas"} icon="▦" label="Rutinas" onClick={() => setTab("rutinas")} />
        <NavButton active={tab === "progreso"} icon="↗" label="Progreso" onClick={() => setTab("progreso")} />
        <NavButton active={tab === "ajustes"} icon="⚙" label="Ajustes" onClick={() => setTab("ajustes")} />
      </nav>
    </main>
  );
}

function HomeTab({
  program,
  completed,
  sessions,
  selectedWeek,
  weekIndex,
  onWeekChange,
  onSelect,
  onBrowse,
}: {
  program: MonthlyProgram;
  completed: string[];
  sessions: CompletedSession[];
  selectedWeek: ProgressionWeek;
  weekIndex: number;
  onWeekChange: (index: number) => void;
  onSelect: (workout: Workout) => void;
  onBrowse: () => void;
}) {
  const finishedDays = program.workouts.filter((workout) =>
    sessions.some((session) => session.workoutId === workout.id) ||
    workout.exercises.every((item) => completed.includes(`${workout.id}:${item.exerciseId}`)),
  ).length;
  const monthName = monthFormatter.format(new Date(new Date().getFullYear(), program.month - 1));

  return (
    <div className="content">
      <section className="eyebrow-row">
        <span>{monthName.toUpperCase()} · MES {String(program.month).padStart(2, "0")}</span>
        <span className="status-dot">● EN CURSO</span>
      </section>
      <section className={`hero-card hero-${program.color}`}>
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
        <div><p className="overline">SEMANA {selectedWeek.week} · {selectedWeek.rir}</p><h2>Tu ritmo, tu regla.</h2></div>
        <span className="week-progress">{finishedDays} / {program.days}</span>
      </div>
      <div className="week-selector compact-selector" aria-label="Semana de progresión">
        {program.progression.map((week, index) => (
          <button
            className={weekIndex === index ? "active" : ""}
            key={week.week}
            aria-label={`Seleccionar semana ${week.week}, ${week.name}`}
            aria-pressed={weekIndex === index}
            onClick={() => onWeekChange(index)}
          >
            <span>SEM</span><strong>{week.week}</strong>
          </button>
        ))}
      </div>
      <div className="week-dots">
        {program.workouts.map((workout, index) => {
          const done = sessions.some((session) => session.workoutId === workout.id) ||
            workout.exercises.every((item) => completed.includes(`${workout.id}:${item.exerciseId}`));
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
        <div><p className="overline">NOTA DE COACH</p><p>{selectedWeek.guidance}</p></div>
      </section>
    </div>
  );
}

function RoutinesTab({
  program,
  isCurrent,
  onPrevious,
  onNext,
  weekIndex,
  onWeekChange,
  onSelect,
}: {
  program: MonthlyProgram;
  isCurrent: boolean;
  onPrevious: () => void;
  onNext: () => void;
  weekIndex: number;
  onWeekChange: (index: number) => void;
  onSelect: (workout: Workout, week: ProgressionWeek) => void;
}) {
  const selectedWeek = program.progression[weekIndex];
  const monthName = monthFormatter.format(new Date(new Date().getFullYear(), program.month - 1));

  useEffect(() => onWeekChange(0), [program.month, onWeekChange]);

  return (
    <div className="content">
      <div className="month-selector">
        <button aria-label="Mes anterior" onClick={onPrevious}>‹</button>
        <div><strong>{monthName} {new Date().getFullYear()}</strong>{isCurrent && <small>Mes actual</small>}</div>
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
            aria-label={`Seleccionar semana ${week.week}, ${week.name}`}
            aria-pressed={weekIndex === index}
            onClick={() => onWeekChange(index)}
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
      <Link className="text-button library-link" href="/ejercicios">Ver todos los ejercicios animados</Link>
      <p className="disclaimer">
        Separa dos sesiones exigentes del mismo grupo muscular cuando sea posible. La semana 4 reduce una serie por ejercicio.
      </p>
    </div>
  );
}

function ProgressTab({ completedCount, sessions }: { completedCount: number; sessions: CompletedSession[] }) {
  const uniqueDays = [...new Set(sessions.map((session) => session.date.slice(0, 10)))].sort();
  const currentStreak = calculateStreak(uniqueDays);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthSessions = sessions.filter((session) => session.date.startsWith(currentMonth)).length;

  return (
    <div className="content">
      <section className="page-title">
        <p className="overline">TU VIAJE</p>
        <h1>Pequeños pasos.<br /><em>Gran cambio.</em></h1>
      </section>
      <div className="stats-grid">
        <div><strong>{completedCount}</strong><span>ejercicios</span></div>
        <div><strong>{sessions.length}</strong><span>sesiones</span></div>
        <div><strong>{currentMonthSessions}</strong><span>este mes</span></div>
        <div><strong>{currentStreak}</strong><span>días de racha</span></div>
      </div>
      <section className="empty-progress">
        <div className="empty-icon">✦</div>
        <h2>{completedCount ? "Sigue construyendo" : "Tu historia empieza hoy"}</h2>
        <p>{sessions.length ? "La constancia suma. La técnica y la recuperación cuentan tanto como la carga." : "Completa tu primera sesión para empezar a ver tu recorrido."}</p>
      </section>
    </div>
  );
}

function calculateStreak(dates: string[]): number {
  const dateSet = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function SettingsTab({
  completed,
  sessions,
  onImport,
  onReset,
}: {
  completed: string[];
  sessions: CompletedSession[];
  onImport: (completed: string[], sessions: CompletedSession[]) => void;
  onReset: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ completed, sessions }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gym-flow-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as { completed?: unknown; sessions?: unknown };
        if (!Array.isArray(data.completed) || !Array.isArray(data.sessions)) throw new Error("Invalid backup");
        onImport(
          data.completed.filter((item): item is string => typeof item === "string"),
          data.sessions as CompletedSession[],
        );
      } catch {
        window.alert("No se pudo importar el archivo. Usa una copia de Gym Flow.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="content">
      <section className="page-title">
        <p className="overline">DATOS EN ESTE DISPOSITIVO</p>
        <h1>Tú tienes<br /><em>el control.</em></h1>
        <p className="muted">Tu progreso se guarda solo en este navegador. Exporta una copia antes de cambiar de dispositivo.</p>
      </section>
      <section className="settings-actions" aria-label="Gestionar datos">
        <button className="primary-button" onClick={exportData}>Exportar progreso <span>↓</span></button>
        <button className="secondary-button" onClick={() => fileInput.current?.click()}>Importar copia</button>
        <input ref={fileInput} className="visually-hidden" type="file" accept="application/json" onChange={importData} />
        <button className="danger-button" onClick={() => window.confirm("¿Borrar todo tu progreso? Esta acción no se puede deshacer.") && onReset()}>
          Borrar progreso
        </button>
      </section>
      <p className="disclaimer">La guía es educativa y no sustituye el consejo médico. Para si sientes dolor y consulta a un profesional cualificado.</p>
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
  const [restSeconds, setRestSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRestSeconds((current) => (current && current > 1 ? current - 1 : null));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restSeconds]);

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
          <p className="safety-note">Para si sientes dolor. Esta guía es educativa y no sustituye consejo médico.</p>
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
                    <div><h2>{exercise.name}</h2><p>{exercise.muscle} · {exercise.equipment} · {exercise.level}</p></div>
                    <button className="check-button" aria-label={`${done ? "Desmarcar" : "Marcar"} ${exercise.name}`} onClick={() => onToggle(exercise.id)}>
                      {done ? "✓" : "○"}
                    </button>
                  </div>
                  <div className="exercise-meta">
                    <span>{effectiveSets} series</span><span>{item.reps}</span><span>{item.rest} descanso</span>
                    {item.rest !== "—" && (
                      <button className="rest-button" onClick={() => setRestSeconds(Number.parseInt(item.rest, 10))}>
                        {restSeconds ? `Descanso ${restSeconds}s` : "Iniciar descanso"}
                      </button>
                    )}
                  </div>
                  <TechniqueDetails exercise={exercise} />
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

function TechniqueDetails({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  return (
    <details className="technique-details" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Ver técnica y animación</summary>
      {open && <ExerciseAnimation exerciseId={exercise.id} />}
      <ol>{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p className="cue"><strong>Claves:</strong> {exercise.cues.join(" · ")}</p>
      <p className="cue"><strong>Evita:</strong> {exercise.mistakes.join(" · ")}</p>
      <p className="cue"><strong>Respiración:</strong> {exercise.breathing}</p>
      <p className="cue"><strong>Alternativa:</strong> {exercise.substitution}</p>
    </details>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={onClick}><span aria-hidden="true">{icon}</span>{label}</button>;
}
