"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  GraduationCap,
  Search,
  Star
} from "lucide-react";

import type { CaseSummary } from "@/content/schema";
import { cn } from "@/lib/cn";
import { CaseCard } from "./CaseCard";

type Filter = "all" | "non-imaging" | "imaging" | "favorites";

export interface ExplorerCase extends CaseSummary {
  search: string;
}

const filterLabels: Record<Filter, string> = {
  all: "Усі",
  "non-imaging": "Без КТ/МРТ",
  imaging: "КТ/МРТ",
  favorites: "Обране"
};

const navigationItems = [
  { filter: "all", label: "Усі станції", mobileLabel: "Усі", Icon: ClipboardList },
  { filter: "non-imaging", label: "Без КТ/МРТ", mobileLabel: "Без КТ/МРТ", Icon: FileText },
  { filter: "imaging", label: "КТ/МРТ", mobileLabel: "КТ/МРТ", Icon: BookOpen },
  { filter: "favorites", label: "Обране", mobileLabel: "Обране", Icon: Star }
] as const satisfies Array<{
  filter: Filter;
  label: string;
  mobileLabel: string;
  Icon: typeof ClipboardList;
}>;

function readFavorites() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const value = JSON.parse(window.localStorage.getItem("favoriteCases") ?? "[]");
    return new Set(
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
    );
  } catch {
    return new Set<string>();
  }
}

export function CasesExplorer({ cases }: { cases: ExplorerCase[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<Filter>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lastCase, setLastCase] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setFavorites(readFavorites());
    setLastCase(window.localStorage.getItem("lastCase"));
    setCompleted(Number(window.localStorage.getItem("completedCasesCount") ?? 0));
  }, []);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredCases = useMemo(
    () =>
      cases.filter((studyCase) => {
        const queryMatch =
          normalizedQuery.length === 0 ||
          studyCase.search.includes(normalizedQuery) ||
          studyCase.title.toLowerCase().includes(normalizedQuery);
        const filterMatch =
          filter === "all" ||
          studyCase.group === filter ||
          (filter === "favorites" && favorites.has(studyCase.slug));

        return queryMatch && filterMatch;
      }),
    [cases, favorites, filter, normalizedQuery]
  );

  function toggleFavorite(slug: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      window.localStorage.setItem("favoriteCases", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <main className="grid min-h-dvh gap-[18px] p-5 md:grid-cols-[210px_minmax(0,1fr)] max-md:block max-md:p-0 max-md:pb-20">
      <aside className="sticky top-5 flex h-[calc(100dvh-40px)] flex-col rounded-lg border border-clinical-line/85 bg-white/90 p-[18px_14px] shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:hidden">
        <Link className="flex min-h-[38px] items-center gap-2.5 font-extrabold" href="/cases">
          <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-clinical-accent-soft text-clinical-accent-strong">
            <Brain size={24} />
          </span>
          <span>ОСКІ Неврологія</span>
        </Link>
        <Link
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text transition hover:border-clinical-line-strong hover:bg-[#fffaf0]"
          href="/krok"
        >
          <GraduationCap size={16} />
          КРОК тести
        </Link>

        <nav className="mt-8 grid gap-1.5" aria-label="Основна навігація">
          {navigationItems.map(({ filter: itemFilter, label, Icon }) => (
            <button
              aria-pressed={filter === itemFilter}
              className={cn(
                "flex min-h-[42px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[#3d434b] transition hover:bg-clinical-accent-soft hover:text-[#171a1f]",
                filter === itemFilter && "bg-clinical-accent-soft font-extrabold text-[#171a1f]"
              )}
              data-filter={itemFilter}
              key={itemFilter}
              type="button"
              onClick={() => setFilter(itemFilter)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 rounded-lg border border-clinical-line/85 bg-white/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[18px_14px_88px] max-md:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="m-0 text-[13px] font-extrabold text-clinical-accent-strong">
              20 навчальних станцій
            </p>
            <h1 className="mt-1 text-[clamp(30px,4vw,42px)] font-black leading-[1.04] text-clinical-text">
              Підготовка до ОСКІ з неврології
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-clinical-line bg-white px-3 text-sm font-extrabold text-clinical-text transition hover:border-clinical-line-strong hover:bg-[#fffaf0]"
              href="/krok"
            >
              <GraduationCap size={16} />
              КРОК
            </Link>
            {lastCase ? (
              <Link
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3.5 text-sm font-extrabold text-[#201900]"
                href={`/cases/${lastCase}`}
              >
                Продовжити
              </Link>
            ) : null}
          </div>
        </header>

        <div className="mt-5" data-search-shell="query">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-clinical-line bg-white px-3 text-clinical-muted">
            <Search size={18} />
            <input
              className="w-full min-w-0 bg-transparent text-clinical-text outline-none placeholder:text-[#8f96a3]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук станцій, синдромів, ключових слів..."
            />
          </label>
        </div>

        <div className="mt-3.5 grid overflow-hidden rounded-lg border border-clinical-line bg-white sm:grid-cols-4 max-sm:grid-cols-2">
          {(Object.keys(filterLabels) as Filter[]).map((item) => (
            <button
              className={cn(
                "min-h-10 border-clinical-line text-[#414852] transition hover:bg-clinical-accent-soft max-sm:border-b sm:border-r sm:last:border-r-0",
                filter === item && "bg-clinical-accent-soft font-extrabold text-[#211b05]"
              )}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {filterLabels[item]}
            </button>
          ))}
        </div>

        <div className="my-4 flex items-center gap-3 text-[13px] text-clinical-muted">
          <span>{completed || 0}/20 пройдено</span>
          <span className="relative h-1 w-[min(220px,42vw)] overflow-hidden rounded-full bg-[#e9e1d4]">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-clinical-accent"
              style={{ width: `${Math.min((completed / 20) * 100, 100)}%` }}
            />
          </span>
        </div>

        <div className="case-list grid gap-2">
          {filteredCases.map((studyCase) => (
            <CaseCard
              favorite={favorites.has(studyCase.slug)}
              key={studyCase.slug}
              studyCase={studyCase}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </section>

      <nav className="mobile-tabbar fixed inset-x-0 bottom-0 z-20 hidden min-h-16 grid-cols-4 border-t border-clinical-line bg-clinical-bg/95 px-1.5 pb-2 pt-1.5 backdrop-blur-xl max-md:grid">
        {navigationItems.map(({ filter: itemFilter, mobileLabel, Icon }) => (
          <button
            aria-pressed={filter === itemFilter}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] leading-tight text-[#5d6470]",
              filter === itemFilter && "font-extrabold text-clinical-accent-strong"
            )}
            data-filter={itemFilter}
            key={itemFilter}
            type="button"
            onClick={() => setFilter(itemFilter)}
          >
            <Icon size={19} />
            <span className="max-w-full text-center">{mobileLabel}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
