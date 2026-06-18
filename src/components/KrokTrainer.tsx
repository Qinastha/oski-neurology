"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  Flag,
  ListChecks,
  RotateCcw,
  Shuffle,
  Trophy,
  XCircle
} from "lucide-react";

import type {
  KrokBookletId,
  KrokOption,
  KrokQuestionOrderMode,
  KrokResolvedBooklet,
  KrokResolvedQuestion,
  KrokSession,
  KrokSessionBookletId
} from "@/content/krok/schema";
import { cn } from "@/lib/cn";
import { SiteMobileTabbar, SiteSectionLinks } from "./SiteNav";

type Filter = "all" | "unanswered" | "wrong" | "correct" | "flagged";

interface KrokTrainerProps {
  officialBooklets: KrokResolvedBooklet[];
  trainingBooklets: KrokResolvedBooklet[];
}

interface CookieSession {
  v: 1;
  s: string;
  b: KrokSessionBookletId;
  m: KrokQuestionOrderMode;
  seed: number;
  q: string;
  a: string;
  f: string;
  st: number;
  fin?: number;
}

interface KrokResult {
  answered: number;
  correct: number;
  wrong: number;
  unanswered: number;
  flagged: number;
  total: number;
  percent: number;
}

const COOKIE_NAME = "krokSessionV1";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const EXPLANATIONS_STORAGE_KEY = "krokShowExplanationsV1";
const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_9px_rgba(250,204,21,0.42))_drop-shadow(0_2px_5px_rgba(124,58,237,0.16))]";

const filterLabels: Record<Filter, string> = {
  all: "Усі",
  unanswered: "Без відповіді",
  wrong: "Помилки",
  correct: "Правильні",
  flagged: "Позначені"
};

function formatPercent(value: number) {
  return value.toFixed(1);
}

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

function createSeed() {
  return Math.floor(Math.random() * 2_000_000_000) + 1;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: number) {
  const next = items.slice();
  const random = createRandom(seed);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function encodeSession(session: KrokSession) {
  const payload: CookieSession = {
    v: 1,
    s: session.sessionId,
    b: session.bookletId,
    m: session.questionOrderMode,
    seed: session.seed,
    q: session.questionIds.join(","),
    a: session.answers,
    f: session.flags,
    st: session.startedAt,
    fin: session.finishedAt
  };

  return toBase64Url(JSON.stringify(payload));
}

function decodeSession(value: string): KrokSession | undefined {
  try {
    const payload = JSON.parse(fromBase64Url(value)) as Partial<CookieSession>;
    if (
      payload.v !== 1 ||
      typeof payload.s !== "string" ||
      typeof payload.b !== "string" ||
      (payload.m !== "ordered" && payload.m !== "shuffled") ||
      typeof payload.seed !== "number" ||
      typeof payload.q !== "string" ||
      typeof payload.a !== "string" ||
      typeof payload.f !== "string" ||
      typeof payload.st !== "number"
    ) {
      return undefined;
    }

    return {
      version: 1,
      sessionId: payload.s,
      bookletId: payload.b as KrokSessionBookletId,
      questionOrderMode: payload.m,
      seed: payload.seed,
      questionIds: payload.q.length > 0 ? payload.q.split(",") : [],
      answers: payload.a,
      flags: payload.f,
      startedAt: payload.st,
      finishedAt: typeof payload.fin === "number" ? payload.fin : undefined
    };
  } catch {
    return undefined;
  }
}

function readSessionCookie() {
  if (typeof document === "undefined") {
    return undefined;
  }

  const entry = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));
  if (!entry) {
    return undefined;
  }

  return decodeSession(entry.slice(COOKIE_NAME.length + 1));
}

function writeSessionCookie(session: KrokSession) {
  document.cookie = `${COOKIE_NAME}=${encodeSession(
    session
  )}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function makeEmptyString(length: number) {
  return "0".repeat(length);
}

function updateChar(value: string, index: number, char: string) {
  return `${value.slice(0, index)}${char}${value.slice(index + 1)}`;
}

function resolveAnswerIndex(question: KrokResolvedQuestion, optionId: string) {
  return question.options.findIndex((option) => option.id === optionId);
}

function createSession({
  bookletId,
  mode,
  allQuestions,
  bookletQuestions
}: {
  bookletId: KrokSessionBookletId;
  mode: KrokQuestionOrderMode;
  allQuestions: KrokResolvedQuestion[];
  bookletQuestions: KrokResolvedQuestion[];
}): KrokSession {
  const seed = createSeed();
  const sourceQuestions =
    bookletId === "random" ? shuffleWithSeed(allQuestions, seed).slice(0, 150) : bookletQuestions;
  const orderedIds = sourceQuestions.map((question) => question.id);
  const questionIds =
    bookletId === "random" || mode === "shuffled"
      ? shuffleWithSeed(orderedIds, seed + 17)
      : orderedIds;

  return {
    version: 1,
    sessionId: `${Date.now().toString(36)}-${seed.toString(36)}`,
    bookletId,
    questionOrderMode: mode,
    seed,
    questionIds,
    answers: makeEmptyString(questionIds.length),
    flags: makeEmptyString(questionIds.length),
    startedAt: Date.now()
  };
}

function formatBookletLabel(bookletId: KrokSessionBookletId) {
  if (bookletId === "random") {
    return "Випадковий буклет";
  }
  if (bookletId.startsWith("ai-")) {
    const bookletNumber = Number(bookletId.slice(3));
    return Number.isFinite(bookletNumber)
      ? `Тренувальний буклет ${bookletNumber}`
      : "Тренувальний буклет";
  }
  return `КРОК ${bookletId}`;
}

function calculateResult(session: KrokSession, questions: KrokResolvedQuestion[]) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let flagged = 0;

  session.questionIds.forEach((id, index) => {
    const question = byId.get(id);
    const answer = session.answers[index] ?? "0";
    if ((session.flags[index] ?? "0") === "1") {
      flagged += 1;
    }
    if (!question || answer === "0") {
      unanswered += 1;
      return;
    }
    const chosenIndex = Number(answer) - 1;
    if (question.options[chosenIndex]?.id === question.correctOptionId) {
      correct += 1;
    } else {
      wrong += 1;
    }
  });

  return {
    answered: session.questionIds.length - unanswered,
    correct,
    wrong,
    unanswered,
    flagged,
    total: session.questionIds.length,
    percent: session.questionIds.length
      ? Math.round((correct / session.questionIds.length) * 1000) / 10
      : 0
  } satisfies KrokResult;
}

function ExplanationToggle({
  enabled,
  compact = false,
  onToggle
}: {
  enabled: boolean;
  compact?: boolean;
  onToggle: () => void;
}) {
  const Icon = enabled ? Eye : EyeOff;

  return (
    <button
      aria-label={`Обґрунтування відповідей ${enabled ? "увімкнено" : "вимкнено"}`}
      aria-pressed={enabled}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-extrabold transition",
        enabled
          ? "border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong"
          : "border-clinical-line bg-white text-clinical-muted hover:border-clinical-line-strong",
        compact && "px-2 text-xs"
      )}
      data-krok-explanation-toggle={enabled ? "on" : "off"}
      type="button"
      onClick={onToggle}
    >
      <Icon size={compact ? 15 : 16} />
      {compact ? (enabled ? "Поясн." : "Без") : `Пояснення: ${enabled ? "увімк." : "вимк."}`}
    </button>
  );
}

function BookletCard({
  bookletId,
  title,
  description,
  count,
  badge,
  onStartOrdered,
  onStartShuffled
}: {
  bookletId: KrokSessionBookletId;
  title: string;
  description?: string;
  count: number;
  badge?: string;
  onStartOrdered?: () => void;
  onStartShuffled: () => void;
}) {
  return (
    <article
      className="rounded-lg border border-clinical-line bg-white/90 p-4 shadow-[0_18px_55px_rgba(84,67,20,0.08)]"
      data-krok-start-card={bookletId}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-black leading-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-clinical-muted">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-start justify-end gap-1.5">
          {badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-clinical-line-strong bg-clinical-accent-soft px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] text-clinical-accent-strong">
              <span>{badge}</span>
              <span aria-hidden="true">·</span>
              <span className="normal-case tracking-normal">{count} питань</span>
            </span>
          ) : (
            <span className="rounded-full border border-clinical-line bg-[#fffaf0] px-2.5 py-1 text-xs font-black text-clinical-accent-strong">
              {count} питань
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {onStartOrdered ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text transition hover:border-clinical-line-strong hover:bg-[#fffaf0]"
            data-krok-start-mode="ordered"
            type="button"
            onClick={onStartOrdered}
          >
            <ListChecks size={17} />
            За порядком
          </button>
        ) : null}
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900] transition hover:brightness-[0.98]"
          data-krok-start-mode="shuffled"
          type="button"
          onClick={onStartShuffled}
        >
          <Shuffle size={17} />
          {onStartOrdered ? "Перемішати" : "Почати"}
        </button>
      </div>
    </article>
  );
}

function ResultPanel({
  result,
  mistakeIds,
  questionNumberById,
  onRestart
}: {
  result: KrokResult;
  mistakeIds: string[];
  questionNumberById: Map<string, number>;
  onRestart: () => void;
}) {
  const rows: Array<{ label: string; value: number; color: string }> = [
    { label: "Правильні", value: result.correct, color: "text-emerald-700" },
    { label: "Помилки", value: result.wrong, color: "text-rose-700" },
    { label: "Без відповіді", value: result.unanswered, color: "text-slate-700" },
    { label: "Позначені", value: result.flagged, color: "text-amber-700" }
  ];

  return (
    <section
      className="rounded-lg border border-clinical-line-strong bg-[#fffaf0] p-4"
      data-krok-result="summary"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-clinical-accent-strong">
            Тест завершено
          </p>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            Відповіли {result.answered}/{result.total} · Вірних {result.correct} ·{" "}
            {formatPercent(result.percent)}%
          </h2>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
          type="button"
          onClick={onRestart}
        >
          <RotateCcw size={17} />
          Почати заново
        </button>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {rows.map(({ label, value, color }) => (
          <div className="rounded-lg border border-clinical-line bg-white p-3" key={label}>
            <p className="text-xs font-extrabold text-clinical-muted">{label}</p>
            <p className={cn("mt-1 text-2xl font-black", color)}>{value}</p>
          </div>
        ))}
      </div>
      {mistakeIds.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-sm font-black">Питання з помилками</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mistakeIds.map((id) => (
              <a
                className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-extrabold text-rose-700"
                href={`#krok-question-${id}`}
                key={id}
              >
                Питання {questionNumberById.get(id) ?? ""}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function QuestionCard({
  question,
  index,
  selectedOptionId,
  flagged,
  finished,
  showExplanations,
  optionOrder,
  onAnswer,
  onToggleFlag
}: {
  question: KrokResolvedQuestion;
  index: number;
  selectedOptionId?: string;
  flagged: boolean;
  finished: boolean;
  showExplanations: boolean;
  optionOrder: KrokOption[];
  onAnswer: (optionId: string) => void;
  onToggleFlag: () => void;
}) {
  const answered = Boolean(selectedOptionId);
  return (
    <article
      className="krok-question-card scroll-mt-4 rounded-lg border border-clinical-line bg-white/92 p-4 shadow-[0_18px_55px_rgba(84,67,20,0.06)] [contain-intrinsic-size:360px] [content-visibility:auto] max-md:p-3"
      data-krok-question-card={question.id}
      data-krok-booklet-id={question.bookletId}
      data-krok-source-number={question.sourceNumber}
      id={`krok-question-${question.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-[48px_minmax(0,1fr)] gap-3 max-sm:grid-cols-[42px_minmax(0,1fr)]">
          <span
            className="inline-flex h-12 min-w-12 items-center justify-center rounded-lg border border-clinical-line-strong bg-clinical-accent-soft text-lg font-black text-clinical-accent-strong max-sm:h-10 max-sm:min-w-10 max-sm:text-base"
            aria-label={`Питання ${index + 1}`}
          >
            {index + 1}
          </span>
          <h2 className="min-w-0 text-[17px] font-extrabold leading-snug text-clinical-text max-sm:text-base">
            {question.text}
          </h2>
        </div>
        <button
          aria-pressed={flagged}
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition",
            flagged
              ? "border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong"
              : "border-clinical-line bg-white text-clinical-muted hover:border-clinical-line-strong"
          )}
          title="Позначити для повторення"
          type="button"
          onClick={onToggleFlag}
        >
          <Flag size={18} />
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {optionOrder.map((option, optionIndex) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = question.correctOptionId === option.id;
          const showCorrect = answered && isCorrectOption;
          const showWrong = answered && isSelected && !isCorrectOption;

          return (
            <button
              className={cn(
                "grid min-h-12 w-full grid-cols-[30px_minmax(0,1fr)_24px] items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm leading-relaxed transition",
                !answered && "border-clinical-line bg-[#fffdf8] hover:border-clinical-line-strong",
                showCorrect && "border-emerald-300 bg-emerald-50 text-emerald-900",
                showWrong && "border-rose-300 bg-rose-50 text-rose-900",
                answered && !showCorrect && !showWrong && "border-clinical-line bg-white text-clinical-muted"
              )}
              data-krok-option={option.id}
              disabled={answered || finished}
              key={option.id}
              type="button"
              onClick={() => onAnswer(option.id)}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-black">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option.text}</span>
              {showCorrect ? <CheckCircle2 size={18} /> : null}
              {showWrong ? <XCircle size={18} /> : null}
            </button>
          );
        })}
      </div>

      {answered && showExplanations ? (
        <div
          className={cn(
            "mt-3 rounded-lg border p-3 text-sm leading-relaxed",
            selectedOptionId === question.correctOptionId
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          )}
          data-krok-answer-explanation={question.id}
        >
          <p className="text-xs font-black uppercase tracking-[0.08em]">Обґрунтування</p>
          <p className="mt-1 font-bold">{question.explanation}</p>
          {question.reviewNote ? (
            <p className="mt-2 border-t border-current/15 pt-2 text-xs font-extrabold opacity-80">
              {question.reviewNote}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function KrokTrainer({ officialBooklets, trainingBooklets }: KrokTrainerProps) {
  const [session, setSession] = useState<KrokSession | null>(null);
  const [showSession, setShowSession] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [showExplanations, setShowExplanations] = useState(true);

  const allBooklets = useMemo(
    () => [...officialBooklets, ...trainingBooklets],
    [officialBooklets, trainingBooklets]
  );
  const officialQuestions = useMemo(
    () => officialBooklets.flatMap((booklet) => booklet.questions),
    [officialBooklets]
  );
  const trainingQuestionCount = useMemo(
    () => trainingBooklets.reduce((sum, booklet) => sum + booklet.questions.length, 0),
    [trainingBooklets]
  );
  const allQuestions = useMemo(
    () => allBooklets.flatMap((booklet) => booklet.questions),
    [allBooklets]
  );
  const questionsById = useMemo(
    () => new Map(allQuestions.map((question) => [question.id, question])),
    [allQuestions]
  );

  useEffect(() => {
    const saved = readSessionCookie();
    if (saved && saved.questionIds.every((id) => questionsById.has(id))) {
      setSession(saved);
      setShowSession(Boolean(saved.finishedAt));
    }
  }, [questionsById]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(EXPLANATIONS_STORAGE_KEY);
      if (saved === "0") {
        setShowExplanations(false);
      }
      if (saved === "1") {
        setShowExplanations(true);
      }
    } catch {
      // Local storage is optional; the trainer still works without persistence.
    }
  }, []);

  const sessionQuestions = useMemo(() => {
    if (!session) {
      return undefined;
    }

    return session.questionIds
      .map((id) => questionsById.get(id))
      .filter((question): question is KrokResolvedQuestion => Boolean(question));
  }, [questionsById, session]);

  const result = useMemo(
    () => (session && sessionQuestions ? calculateResult(session, sessionQuestions) : undefined),
    [session, sessionQuestions]
  );

  const questionNumberById = useMemo(() => {
    const map = new Map<string, number>();
    session?.questionIds.forEach((id, index) => {
      map.set(id, index + 1);
    });
    return map;
  }, [session]);

  const answerByQuestion = useMemo(() => {
    const map = new Map<string, string>();
    if (!session || !sessionQuestions) {
      return map;
    }
    sessionQuestions.forEach((question, index) => {
      const answer = session.answers[index] ?? "0";
      if (answer !== "0") {
        const option = question.options[Number(answer) - 1];
        if (option) {
          map.set(question.id, option.id);
        }
      }
    });
    return map;
  }, [session, sessionQuestions]);

  const mistakeIds = useMemo(() => {
    if (!sessionQuestions) {
      return [];
    }
    return sessionQuestions
      .filter((question) => {
        const selectedOptionId = answerByQuestion.get(question.id);
        return selectedOptionId && selectedOptionId !== question.correctOptionId;
      })
      .map((question) => question.id);
  }, [answerByQuestion, sessionQuestions]);

  const visibleQuestions = useMemo(() => {
    if (!session || !sessionQuestions) {
      return [];
    }

    return sessionQuestions.filter((question, index) => {
      const selectedOptionId = answerByQuestion.get(question.id);
      const flagged = (session.flags[index] ?? "0") === "1";
      if (filter === "unanswered") {
        return !selectedOptionId;
      }
      if (filter === "wrong") {
        return selectedOptionId && selectedOptionId !== question.correctOptionId;
      }
      if (filter === "correct") {
        return selectedOptionId === question.correctOptionId;
      }
      if (filter === "flagged") {
        return flagged;
      }
      return true;
    });
  }, [answerByQuestion, filter, session, sessionQuestions]);

  function persist(next: KrokSession) {
    setSession(next);
    writeSessionCookie(next);
  }

  function toggleExplanations() {
    setShowExplanations((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(EXPLANATIONS_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore storage errors; the in-memory setting still updates.
      }
      return next;
    });
  }

  function startSession(bookletId: KrokSessionBookletId, mode: KrokQuestionOrderMode) {
    if (session && !session.finishedAt) {
      const confirmed = window.confirm("Поточний прогрес буде замінено новим тестом. Почати заново?");
      if (!confirmed) {
        return;
      }
    }

    const bookletQuestions =
      bookletId === "random"
        ? []
        : allBooklets.find((booklet) => booklet.id === bookletId)?.questions ?? [];
    const next = createSession({
      bookletId,
      mode,
      allQuestions: officialQuestions,
      bookletQuestions
    });
    setFilter("all");
    persist(next);
    setShowSession(true);
    setMobilePanelOpen(false);
  }

  function restart() {
    clearSessionCookie();
    setSession(null);
    setShowSession(false);
    setMobilePanelOpen(false);
    setFilter("all");
    window.scrollTo({ top: 0 });
  }

  function answerQuestion(question: KrokResolvedQuestion, optionId: string) {
    if (!session || session.finishedAt) {
      return;
    }
    const index = session.questionIds.indexOf(question.id);
    if (index < 0 || (session.answers[index] ?? "0") !== "0") {
      return;
    }

    const optionIndex = resolveAnswerIndex(question, optionId);
    if (optionIndex < 0) {
      return;
    }

    persist({
      ...session,
      answers: updateChar(session.answers, index, String(optionIndex + 1))
    });
  }

  function toggleFlag(questionId: string) {
    if (!session || session.finishedAt) {
      return;
    }
    const index = session.questionIds.indexOf(questionId);
    if (index < 0) {
      return;
    }
    const current = session.flags[index] ?? "0";
    persist({
      ...session,
      flags: updateChar(session.flags, index, current === "1" ? "0" : "1")
    });
  }

  function finishSession() {
    if (!session) {
      return;
    }
    const next = {
      ...session,
      finishedAt: session.finishedAt ?? Date.now()
    };
    persist(next);
    setFilter("all");
    setShowSession(true);
    setMobilePanelOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!showSession || !session || !sessionQuestions || !result) {
    const resumeState =
      session && sessionQuestions && result && !session.finishedAt ? { result, session } : undefined;

    return (
      <main className="min-h-dvh p-5 max-md:p-0" data-krok-page="start">
        <section className="mx-auto grid max-w-6xl gap-5 rounded-lg border border-clinical-line/85 bg-white/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[18px_14px_88px]">
          <SiteSectionLinks
            active="krok"
            className="grid-cols-3 border-b border-clinical-line pb-4 max-md:hidden [&>a]:justify-center"
          />
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-extrabold text-clinical-accent-strong">
                {officialQuestions.length} офіційних питань · {trainingQuestionCount} тренувальних
              </p>
              <h1 className="mt-1 text-[clamp(30px,4vw,46px)] font-black leading-[1.04]">
                КРОК 3 Неврологія
              </h1>
            </div>
            <span className="inline-flex h-16 w-16 items-center justify-center">
              <Image
                alt=""
                aria-hidden="true"
                className={BRAND_ICON_CLASS}
                height={60}
                priority
                src={BRAND_ICON_SRC}
                width={60}
              />
            </span>
          </header>

          {resumeState ? (
            <section
              className="grid gap-3 rounded-lg border border-clinical-line-strong bg-[#fffaf0] p-4 md:grid-cols-[minmax(0,1fr)_auto]"
              data-krok-resume="active"
            >
              <div>
                <p className="text-xs font-black uppercase text-clinical-accent-strong">
                  Активна сесія
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {formatBookletLabel(resumeState.session.bookletId)} · {resumeState.result.correct}
                  /{resumeState.result.total}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-clinical-muted">
                  Продовжити з того ж місця або почати заново.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
                  data-krok-resume-action="continue"
                  type="button"
                  onClick={() => setShowSession(true)}
                >
                  <ListChecks size={17} />
                  Продовжити тест
                </button>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
                  data-krok-resume-action="new"
                  type="button"
                  onClick={restart}
                >
                  <RotateCcw size={17} />
                  Почати новий
                </button>
              </div>
            </section>
          ) : null}

          <div className="grid gap-5">
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Офіційні буклети</h2>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {officialBooklets.map((booklet) => (
                  <BookletCard
                    bookletId={booklet.id}
                    count={booklet.questions.length}
                    key={booklet.id}
                    title={`КРОК ${booklet.id}`}
                    onStartOrdered={() => startSession(booklet.id, "ordered")}
                    onStartShuffled={() => startSession(booklet.id, "shuffled")}
                  />
                ))}
                <BookletCard
                  bookletId="random"
                  count={150}
                  title="Випадковий буклет"
                  onStartShuffled={() => startSession("random", "shuffled")}
                />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Тренувальні буклети</h2>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {trainingBooklets.map((booklet) => (
                  <BookletCard
                    badge="AI"
                    bookletId={booklet.id}
                    count={booklet.questions.length}
                    key={booklet.id}
                    title={booklet.title}
                    onStartOrdered={() => startSession(booklet.id, "ordered")}
                    onStartShuffled={() => startSession(booklet.id, "shuffled")}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>
        <SiteMobileTabbar active="krok" />
      </main>
    );
  }

  const isFinished = Boolean(session.finishedAt);

  return (
    <main
      className="grid min-h-dvh gap-[18px] p-5 lg:grid-cols-[292px_minmax(0,1fr)] max-lg:flex max-lg:h-dvh max-lg:flex-col max-lg:overflow-hidden max-lg:p-0"
      data-krok-page="session"
    >
      <aside className="sticky top-5 flex h-[calc(100dvh-40px)] min-h-0 flex-col rounded-lg border border-clinical-line/85 bg-white/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-lg:hidden">
        <Link className="flex min-h-[38px] items-center gap-2.5 font-extrabold" href="/krok">
          <span className="inline-flex h-12 w-12 items-center justify-center">
            <Image
              alt=""
              aria-hidden="true"
              className={BRAND_ICON_CLASS}
              height={46}
              src={BRAND_ICON_SRC}
              width={46}
            />
          </span>
          <span>КРОК тести</span>
        </Link>
        <SiteSectionLinks active="krok" className="mt-6 border-b border-clinical-line pb-4" />

        <div className="mt-4 rounded-lg border border-clinical-line bg-[#fffaf0] p-3">
          <p className="text-xs font-black uppercase text-clinical-accent-strong">
            {formatBookletLabel(session.bookletId)}
          </p>
          <p className="mt-1 text-2xl font-black">{result.answered}/{result.total}</p>
          <p className="text-sm text-clinical-muted">
            Вірних {result.correct} · {formatPercent(result.percent)}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e9e1d4]">
            <div
              className="h-full rounded-full bg-clinical-accent"
              style={{ width: `${(result.answered / result.total) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-3">
          <ExplanationToggle enabled={showExplanations} onToggle={toggleExplanations} />
        </div>

        <nav className="mt-4 grid gap-1.5" aria-label="Фільтри питань">
          {(Object.keys(filterLabels) as Filter[]).map((item) => (
            <button
              aria-pressed={filter === item}
              className={cn(
                "min-h-10 rounded-lg px-3 text-left text-sm font-extrabold text-[#3d434b] transition hover:bg-clinical-accent-soft",
                filter === item && "bg-clinical-accent-soft text-[#171a1f]"
              )}
              key={item}
              type="button"
              onClick={() => setFilter(item)}
            >
              {filterLabels[item]}
            </button>
          ))}
        </nav>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-6 content-start gap-1 overflow-y-auto pr-1">
          {sessionQuestions.map((question, index) => {
            const selectedOptionId = answerByQuestion.get(question.id);
            const flagged = (session.flags[index] ?? "0") === "1";
            const stateClass = selectedOptionId
              ? selectedOptionId === question.correctOptionId
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-rose-300 bg-rose-50 text-rose-800"
              : "border-clinical-line bg-white text-clinical-muted";
            return (
              <a
                className={cn(
                  "inline-flex h-8 items-center justify-center rounded-lg border text-xs font-black",
                  stateClass,
                  flagged && "ring-2 ring-clinical-accent"
                )}
                href={`#krok-question-${question.id}`}
                key={question.id}
              >
                {index + 1}
              </a>
            );
          })}
        </div>

        <button
          className="mt-3 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-sm font-extrabold text-[#201900]"
          data-krok-finish-action="desktop"
          type="button"
          onClick={isFinished ? restart : finishSession}
        >
          {isFinished ? <RotateCcw size={17} /> : <Trophy size={17} />}
          {isFinished ? "Почати заново" : "Завершити тест"}
        </button>
      </aside>

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-white/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-lg:min-h-0 max-lg:flex-1 max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-0 max-lg:p-[18px_14px_24px] max-lg:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-extrabold text-clinical-accent-strong">
              {formatBookletLabel(session.bookletId)} ·{" "}
              {session.questionOrderMode === "ordered" ? "за порядком" : "перемішано"}
            </p>
            <h1 className="mt-1 text-[clamp(28px,4vw,42px)] font-black leading-[1.04]">
              Тренування КРОК
            </h1>
            <p className="mt-2 text-sm font-extrabold text-clinical-muted">
              Відповіли {result.answered}/{result.total} · Вірних {result.correct} ·{" "}
              {formatPercent(result.percent)}%
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
              href="/krok"
            >
              <ClipboardList size={16} />
              Буклети
            </Link>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text"
              type="button"
              onClick={restart}
            >
              <RotateCcw size={16} />
              Скинути
            </button>
          </div>
        </header>

        <div className="mt-4 grid gap-2 rounded-lg border border-clinical-line bg-white p-3 sm:grid-cols-5 max-lg:hidden">
          {(Object.keys(filterLabels) as Filter[]).map((item) => (
            <button
              aria-pressed={filter === item}
              className={cn(
                "min-h-10 rounded-lg px-2 text-sm font-extrabold transition",
                filter === item
                  ? "bg-clinical-accent-soft text-[#211b05]"
                  : "text-clinical-muted hover:bg-[#fffaf0]"
              )}
              key={item}
              type="button"
              onClick={() => setFilter(item)}
            >
              {filterLabels[item]}
            </button>
          ))}
        </div>

        {isFinished ? (
          <div className="mt-4">
            <ResultPanel
              mistakeIds={mistakeIds}
              questionNumberById={questionNumberById}
              result={result}
              onRestart={restart}
            />
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          {visibleQuestions.map((question) => {
            const realIndex = (questionNumberById.get(question.id) ?? 1) - 1;
            const selectedOptionId = answerByQuestion.get(question.id);
            const optionOrder = shuffleWithSeed(
              question.options,
              session.seed + hashString(question.id)
            );

            return (
              <QuestionCard
                finished={isFinished}
                flagged={(session.flags[realIndex] ?? "0") === "1"}
                index={realIndex}
                key={question.id}
                optionOrder={optionOrder}
                question={question}
                showExplanations={showExplanations}
                selectedOptionId={selectedOptionId}
                onAnswer={(optionId) => answerQuestion(question, optionId)}
                onToggleFlag={() => toggleFlag(question.id)}
              />
            );
          })}
        </div>

        {visibleQuestions.length === 0 ? (
          <div className="mt-4 rounded-lg border border-clinical-line bg-white p-6 text-center">
            <AlertTriangle className="mx-auto text-clinical-accent-strong" size={28} />
            <p className="mt-2 font-extrabold">За цим фільтром поки немає питань.</p>
          </div>
        ) : null}
      </section>

      <nav
        className="z-20 hidden shrink-0 border-t border-clinical-line bg-clinical-bg/95 p-2 backdrop-blur-xl max-lg:block"
        data-krok-mobile-bar="summary"
      >
        <div className="mb-2 min-w-0">
          <p
            className="truncate text-xs font-extrabold text-clinical-muted"
            data-krok-mobile-status="summary"
          >
            Відповіли {result.answered}/{result.total} · Вірних {result.correct} ·{" "}
            {formatPercent(result.percent)}%
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e9e1d4]">
            <div
              className="h-full rounded-full bg-clinical-accent"
              style={{ width: `${(result.answered / result.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-xs font-extrabold text-clinical-text"
            data-krok-mobile-panel-trigger="button"
            type="button"
            onClick={() => setMobilePanelOpen(true)}
          >
            <ListChecks size={16} />
            Питання
          </button>
          <ExplanationToggle
            compact
            enabled={showExplanations}
            onToggle={toggleExplanations}
          />
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3 text-xs font-extrabold text-[#201900]"
            type="button"
            onClick={isFinished ? restart : finishSession}
          >
            {isFinished ? "Заново" : "Завершити"}
          </button>
        </div>
      </nav>

      {mobilePanelOpen ? (
        <div
          className="fixed inset-0 z-30 hidden bg-black/28 p-3 max-lg:flex max-lg:items-end"
          data-krok-mobile-panel="open"
          role="dialog"
          aria-modal="true"
          aria-label="Навігація питаннями"
        >
          <button
            className="absolute inset-0 cursor-default"
            aria-label="Закрити навігацію"
            type="button"
            onClick={() => setMobilePanelOpen(false)}
          />
          <section className="relative w-full rounded-t-lg border border-clinical-line bg-white p-3 shadow-[0_-18px_55px_rgba(84,67,20,0.16)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-clinical-accent-strong">
                  Навігація
                </p>
                <h2 className="mt-1 text-lg font-black">Питання та фільтри</h2>
              </div>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-clinical-line bg-white px-3 text-xs font-extrabold text-clinical-text"
                type="button"
                onClick={() => setMobilePanelOpen(false)}
              >
                Закрити
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.keys(filterLabels) as Filter[]).map((item) => (
                <button
                  aria-pressed={filter === item}
                  className={cn(
                    "min-h-10 rounded-lg border px-2 text-sm font-extrabold",
                    filter === item
                      ? "border-clinical-line-strong bg-clinical-accent-soft text-clinical-accent-strong"
                      : "border-clinical-line bg-white text-clinical-muted"
                  )}
                  data-krok-mobile-filter={item}
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item);
                    setMobilePanelOpen(false);
                  }}
                >
                  {filterLabels[item]}
                </button>
              ))}
            </div>

            <div
              className="mt-3 grid max-h-[42dvh] grid-cols-8 gap-1.5 overflow-y-auto pr-1 max-[420px]:grid-cols-6"
              data-krok-mobile-navigator="questions"
            >
              {sessionQuestions.map((question, index) => {
                const selectedOptionId = answerByQuestion.get(question.id);
                const flagged = (session.flags[index] ?? "0") === "1";
                const stateClass = selectedOptionId
                  ? selectedOptionId === question.correctOptionId
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                  : "border-clinical-line bg-white text-clinical-muted";
                return (
                  <a
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-lg border text-[11px] font-black",
                      stateClass,
                      flagged && "ring-2 ring-clinical-accent"
                    )}
                    data-krok-mobile-question-link={question.id}
                    href={`#krok-question-${question.id}`}
                    key={question.id}
                    onClick={() => setMobilePanelOpen(false)}
                  >
                    {index + 1}
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
