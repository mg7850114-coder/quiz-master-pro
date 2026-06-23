import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { buildShuffledQuiz, type Question } from "@/lib/quiz-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuizArena — Web App Knowledge Quiz" },
      { name: "description", content: "Take a 20-question web development quiz with instant feedback, themes, and your final score." },
      { property: "og:title", content: "QuizArena — Web App Knowledge Quiz" },
      { property: "og:description", content: "Register, log in, pick your theme and conquer 20 shuffled questions." },
    ],
  }),
  component: Index,
});

type StoredUser = { username: string; email: string; password: string };
type Theme = "theme-aurora" | "theme-nature" | "theme-dark";

const THEMES: { id: Theme; label: string }[] = [
  { id: "theme-aurora", label: "Aurora Night" },
  { id: "theme-nature", label: "Green Nature" },
  { id: "theme-dark", label: "Midnight Dark" },
];

const USERS_KEY = "quizarena_users";
const SESSION_KEY = "quizarena_session";
const THEME_KEY = "quizarena_theme";

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function Index() {
  const [theme, setTheme] = useState<Theme>("theme-aurora");
  const [session, setSession] = useState<string | null>(null);
  const [view, setView] = useState<"auth" | "quiz" | "result">("auth");

  useEffect(() => {
    const t = (localStorage.getItem(THEME_KEY) as Theme) || "theme-aurora";
    setTheme(t);
    const s = localStorage.getItem(SESSION_KEY);
    if (s) { setSession(s); setView("quiz"); }
  }, []);

  useEffect(() => { localStorage.setItem(THEME_KEY, theme); }, [theme]);

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>(() => buildShuffledQuiz());
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  function startFresh() {
    setQuestions(buildShuffledQuiz());
    setCurrent(0); setSelected(null); setLocked(false);
    setCorrect(0); setWrong(0);
    setView("quiz");
  }

  function handleLogin(username: string) {
    localStorage.setItem(SESSION_KEY, username);
    setSession(username);
    startFresh();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setView("auth");
  }

  function pickOption(idx: number) {
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    if (idx === questions[current].answer) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setView("result");
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setLocked(false);
      }
    }, 1100);
  }

  return (
    <div className={`${theme} themed-bg relative overflow-hidden`}>
      {/* Decorative orbs */}
      <div className="floating-orb" style={{ width: 320, height: 320, background: "var(--accent)", top: -80, left: -80 }} />
      <div className="floating-orb" style={{ width: 280, height: 280, background: "var(--accent-2)", bottom: -60, right: -60, animationDelay: "-4s" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span style={{ color: "var(--accent)" }}>Quiz</span>Arena
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`theme-chip ${theme === t.id ? "active" : ""}`}
              >
                {t.label}
              </button>
            ))}
            {session && (
              <button onClick={logout} className="theme-chip" title="Logout">
                Logout ({session})
              </button>
            )}
          </div>
        </header>

        {view === "auth" && <AuthPanel onAuthed={handleLogin} />}
        {view === "quiz" && session && (
          <QuizPanel
            q={questions[current]}
            index={current}
            total={questions.length}
            selected={selected}
            locked={locked}
            onPick={pickOption}
            correct={correct}
            wrong={wrong}
          />
        )}
        {view === "result" && (
          <ResultPanel
            correct={correct}
            wrong={wrong}
            total={questions.length}
            onRetake={startFresh}
          />
        )}

        <footer className="text-center text-xs opacity-70 mt-10">
          Built for curious minds. Pick a theme and play on.
        </footer>
      </div>
    </div>
  );
}

function AuthPanel({ onAuthed }: { onAuthed: (username: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const users = loadUsers();
    if (mode === "register") {
      if (!username.trim() || !email.trim() || password.length < 4) {
        setError("Fill all fields. Password must be at least 4 characters.");
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setError("An account with this email already exists.");
        return;
      }
      const next = [...users, { username: username.trim(), email: email.trim(), password }];
      saveUsers(next);
      setSuccess("Registered successfully! Please login with your email and password.");
      // Do NOT auto-login. Switch to login view and prefill email.
      setTimeout(() => {
        setMode("login");
        setUsername("");
        setPassword("");
        setSuccess("");
      }, 1400);
    } else {
      if (!email.trim() || !password) { setError("Enter email and password."); return; }
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!found) { setError("Invalid email or password."); return; }
      setSuccess("Login successful! Loading quiz…");
      setTimeout(() => onAuthed(found.username), 500);
    }
  }

  return (
    <div className="glass-card p-7 md:p-10 fade-in-up">
      <div className="flex gap-2 mb-6">
        <button
          className={`theme-chip ${mode === "register" ? "active" : ""}`}
          onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
        >Register</button>
        <button
          className={`theme-chip ${mode === "login" ? "active" : ""}`}
          onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
        >Login</button>
      </div>

      <h2 className="text-2xl font-bold mb-2">
        {mode === "register" ? "Create your account" : "Welcome back"}
      </h2>
      <p className="opacity-80 mb-6 text-sm">
        {mode === "register"
          ? "Register once — then log in with your email and password."
          : "Use the email and password you registered with."}
      </p>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <input
            className="themed-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          className="themed-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="themed-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-sm" style={{ color: "#ff6b6b" }}>{error}</div>}
        {success && <div className="text-sm" style={{ color: "#4ade80" }}>{success}</div>}

        <button type="submit" className="btn-accent w-full">
          {mode === "register" ? "Register" : "Login"}
        </button>
      </form>
    </div>
  );
}

function QuizPanel({
  q, index, total, selected, locked, onPick, correct, wrong,
}: {
  q: Question; index: number; total: number;
  selected: number | null; locked: boolean;
  onPick: (idx: number) => void;
  correct: number; wrong: number;
}) {
  const progress = useMemo(() => ((index) / total) * 100, [index, total]);
  return (
    <div key={index} className="glass-card p-7 md:p-9 fade-in-up">
      <div className="flex items-center justify-between text-sm mb-3">
        <span>Question {index + 1} of {total}</span>
        <span>✅ {correct} · ❌ {wrong}</span>
      </div>
      <div className="progress-track mb-6">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <h3 className="text-xl md:text-2xl font-semibold mb-6 leading-snug">{q.q}</h3>

      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let cls = "option-btn";
          if (locked && i === q.answer) cls += " option-correct";
          else if (locked && i === selected && selected !== q.answer) cls += " option-wrong";
          return (
            <button
              key={i}
              className={cls}
              disabled={locked}
              onClick={() => onPick(i)}
            >
              <span className="font-semibold mr-2" style={{ color: "var(--accent)" }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultPanel({
  correct, wrong, total, onRetake,
}: { correct: number; wrong: number; total: number; onRetake: () => void }) {
  const pct = Math.round((correct / total) * 100);
  const message =
    pct >= 80 ? "Outstanding! 🏆" :
    pct >= 60 ? "Great job! 🎉" :
    pct >= 40 ? "Not bad — keep practicing! 💪" :
                "Time for a rematch. You got this! 🚀";
  return (
    <div className="glass-card p-8 md:p-12 fade-in-up text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-2">Quiz Complete</h2>
      <p className="opacity-80 mb-8">{message}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Correct" value={correct} color="#4ade80" />
        <Stat label="Wrong" value={wrong} color="#f87171" />
        <Stat label="Score" value={`${pct}%`} color="var(--accent)" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="btn-accent" onClick={onRetake}>Retake with shuffled questions</button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="glass-card p-4">
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs opacity-75 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}
