"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  Search,
  SlidersHorizontal,
  Star
} from "lucide-react";

import type { CaseSummary } from "@/content/schema";
import { CaseCard } from "./CaseCard";

type Filter = "all" | "non-imaging" | "imaging" | "favorites";

export interface ExplorerCase extends CaseSummary {
  search: string;
}

const filterLabels: Record<Filter, string> = {
  all: "Все",
  "non-imaging": "Без МРТ/КТ",
  imaging: "МРТ/КТ",
  favorites: "Избранное"
};

function readFavorites() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const value = JSON.parse(window.localStorage.getItem("favoriteCases") ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

export function CasesExplorer({ cases }: { cases: ExplorerCase[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lastCase, setLastCase] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setFavorites(readFavorites());
    setLastCase(window.localStorage.getItem("lastCase"));
    setCompleted(Number(window.localStorage.getItem("completedCasesCount") ?? 0));
  }, []);

  const filteredCases = cases.filter((studyCase) => {
    const queryMatch =
      query.trim().length === 0 ||
      studyCase.search.includes(query.trim().toLowerCase()) ||
      studyCase.title.toLowerCase().includes(query.trim().toLowerCase());
    const filterMatch =
      filter === "all" ||
      studyCase.group === filter ||
      (filter === "favorites" && favorites.has(studyCase.slug));

    return queryMatch && filterMatch;
  });

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
    <main className="app-shell">
      <aside className="side-rail">
        <Link className="brand" href="/cases" aria-label="ОСКИ Неврология">
          <span className="brand__mark">
            <Brain size={24} />
          </span>
          <span>ОСКИ Неврология</span>
        </Link>

        <nav className="side-nav" aria-label="Основная навигация">
          <button className="side-nav__item side-nav__item--active" type="button">
            <ClipboardList size={18} />
            Все станции
          </button>
          <button className="side-nav__item" type="button" onClick={() => setFilter("non-imaging")}>
            <FileText size={18} />
            Без МРТ/КТ
          </button>
          <button className="side-nav__item" type="button" onClick={() => setFilter("imaging")}>
            <BookOpen size={18} />
            МРТ/КТ
          </button>
          <button className="side-nav__item" type="button" onClick={() => setFilter("favorites")}>
            <Star size={18} />
            Избранное
          </button>
        </nav>
      </aside>

      <section className="case-list-page">
        <header className="list-header">
          <div>
            <p className="section-kicker">20 учебных станций</p>
            <h1>Подготовка к ОСКИ по неврологии</h1>
          </div>
          {lastCase ? (
            <Link className="primary-link" href={`/cases/${lastCase}`}>
              Продолжить
            </Link>
          ) : null}
        </header>

        <div className="toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск станций, синдромов, ключевых слов..."
            />
          </label>
          <button className="icon-button" aria-label="Фильтры" type="button">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="segmented-control" aria-label="Фильтр станций">
          {(Object.keys(filterLabels) as Filter[]).map((item) => (
            <button
              className={filter === item ? "is-active" : ""}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {filterLabels[item]}
            </button>
          ))}
        </div>

        <div className="progress-strip" aria-label="Прогресс">
          <span>{completed || 0}/20 пройдено</span>
          <span className="progress-strip__track">
            <span style={{ width: `${Math.min((completed / 20) * 100, 100)}%` }} />
          </span>
        </div>

        <div className="case-list">
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

      <nav className="mobile-tabbar" aria-label="Мобильная навигация">
        <button className="is-active" type="button" onClick={() => setFilter("all")}>
          <ClipboardList size={19} />
          Все
        </button>
        <button type="button" onClick={() => setFilter("favorites")}>
          <Bookmark size={19} />
          Избранное
        </button>
        <button type="button" onClick={() => setFilter("imaging")}>
          <BookOpen size={19} />
          МРТ/КТ
        </button>
      </nav>
    </main>
  );
}
