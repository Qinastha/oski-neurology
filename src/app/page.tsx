import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Layers3
} from "lucide-react";

import { getCaseSummaries } from "@/content/loader";
import { getKrokStats } from "@/content/krok/loader";
import { getNoteCatalogStats } from "@/content/notes/loader";
import { SiteMobileTabbar } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Навчальний хаб",
  description:
    "Стартова сторінка підготовки з неврології: ОСКІ станції, КРОК тести та стислий конспект."
};

export const dynamic = "force-static";

const BRAND_ICON_SRC = "/metadata/apple-icon.png";
const BRAND_ICON_CLASS =
  "[filter:drop-shadow(0_0_12px_rgba(250,204,21,0.46))_drop-shadow(0_3px_8px_rgba(124,58,237,0.16))]";

function SectionCard({
  href,
  icon,
  eyebrow,
  title,
  text,
  stat,
  accent,
  testId
}: {
  href: string;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  stat: string;
  accent: string;
  testId: string;
}) {
  return (
    <article
      className="group flex min-h-[260px] flex-col justify-between rounded-lg border border-clinical-line bg-white p-4 shadow-[0_18px_55px_rgba(84,67,20,0.06)] transition hover:-translate-y-0.5 hover:border-clinical-line-strong hover:shadow-[0_22px_65px_rgba(84,67,20,0.11)]"
      data-home-section-card={testId}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border border-clinical-line-strong ${accent}`}
          >
            {icon}
          </span>
          <span className="rounded-full border border-clinical-line bg-[#fffaf0] px-2.5 py-1 text-xs font-black text-clinical-accent-strong">
            {stat}
          </span>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-clinical-accent-strong">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-black leading-tight">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-clinical-muted">{text}</p>
      </div>
      <Link
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-clinical-line-strong bg-gradient-to-b from-[#ffe680] to-clinical-accent px-3.5 text-sm font-black text-[#201900] transition group-hover:brightness-[1.02]"
        href={href}
      >
        Відкрити
        <ArrowRight size={17} />
      </Link>
    </article>
  );
}

export default function HomePage() {
  const cases = getCaseSummaries();
  const krokStats = getKrokStats();
  const notesStats = getNoteCatalogStats();
  const imagingCases = cases.filter((item) => item.hasImaging).length;

  return (
    <main
      className="min-h-dvh p-5 max-md:p-[14px_12px_88px]"
      data-home-hub="root"
    >
      <section className="mx-auto grid min-h-[calc(100dvh-40px)] max-w-7xl gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-lg border border-clinical-line/85 bg-white/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-16 w-16 items-center justify-center">
              <Image
                alt=""
                aria-hidden="true"
                className={BRAND_ICON_CLASS}
                height={62}
                priority
                src={BRAND_ICON_SRC}
                width={62}
              />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.08em] text-clinical-accent-strong">
                Неврологія
              </p>
              <h1 className="text-2xl font-black leading-tight">Навчальний хаб</h1>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-clinical-muted">
            Один вхід для практичних станцій, тестів КРОК і короткого конспекту за
            структурою іспиту.
          </p>

          {/*<div className="mt-6 grid gap-3">*/}
          {/*  <div className="rounded-lg border border-clinical-line bg-[#fffaf0] p-3">*/}
          {/*    <p className="text-xs font-black uppercase text-clinical-accent-strong">Матеріали</p>*/}
          {/*    <p className="mt-1 text-3xl font-black">*/}
          {/*      {cases.length + krokStats.questionCount + notesStats.sectionCount}*/}
          {/*    </p>*/}
          {/*    <p className="text-sm text-clinical-muted">станцій, тестів і тем</p>*/}
          {/*  </div>*/}
          {/*  <div className="grid grid-cols-2 gap-3">*/}
          {/*    <div className="rounded-lg border border-clinical-line bg-white p-3">*/}
          {/*      <p className="text-xs font-black text-clinical-accent-strong">ОСКІ</p>*/}
          {/*      <p className="mt-1 text-xl font-black">{cases.length}</p>*/}
          {/*    </div>*/}
          {/*    <div className="rounded-lg border border-clinical-line bg-white p-3">*/}
          {/*      <p className="text-xs font-black text-clinical-accent-strong">КТ/МРТ</p>*/}
          {/*      <p className="mt-1 text-xl font-black">{imagingCases}</p>*/}
          {/*    </div>*/}
          {/*    <div className="rounded-lg border border-clinical-line bg-white p-3">*/}
          {/*      <p className="text-xs font-black text-clinical-accent-strong">КРОК</p>*/}
          {/*      <p className="mt-1 text-xl font-black">{krokStats.questionCount}</p>*/}
          {/*    </div>*/}
          {/*    <div className="rounded-lg border border-clinical-line bg-white p-3">*/}
          {/*      <p className="text-xs font-black text-clinical-accent-strong">Конспект</p>*/}
          {/*      <p className="mt-1 text-xl font-black">*/}
          {/*        {notesStats.availableCount}/{notesStats.sectionCount}*/}
          {/*      </p>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </aside>

        <section className="rounded-lg border border-clinical-line/85 bg-white/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[13px] font-extrabold text-clinical-accent-strong">
                Оберіть режим підготовки
              </p>
              <h2 className="mt-1 text-[clamp(28px,4vw,44px)] font-black leading-[1.04]">
                З чого почнемо?
              </h2>
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-3">
            <SectionCard
              accent="bg-clinical-accent-soft text-clinical-accent-strong"
              eyebrow="Практика"
              href="/cases"
              icon={<ClipboardList size={22} />}
              stat={`${cases.length} станцій`}
              testId="cases"
              text="Станції з оригінальними завданнями, практичними навичками, чеклістом і КТ/МРТ там, де це потрібно."
              title="ОСКІ станції"
            />
            <SectionCard
              accent="bg-[#eef7ff] text-[#2463a7]"
              eyebrow="Тести"
              href="/krok"
              icon={<GraduationCap size={23} />}
              stat={`${krokStats.questionCount} питань`}
              testId="krok"
              text="Офіційні буклети, випадковий режим і тренувальні AI-буклети з миттєвою перевіркою відповіді."
              title="КРОК тести"
            />
            <SectionCard
              accent="bg-[#f1f8ee] text-[#3f7c3a]"
              eyebrow="Теорія"
              href="/notes"
              icon={<BookOpen size={22} />}
              stat={`${notesStats.availableCount}/${notesStats.sectionCount}`}
              testId="notes"
              text="Короткі high-yield блоки за структурою КРОК: топіка, діагностичні підказки, патерни і пастки."
              title="Конспект"
            />
          </div>

          <div className="mt-5 rounded-lg border border-clinical-line bg-[#fffdf8] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-clinical-line-strong bg-white text-clinical-accent-strong">
                <Layers3 size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="font-black">Поточна структура</h3>
                <p className="mt-1 text-sm leading-relaxed text-clinical-muted">
                  ОСКІ лишається окремим практичним блоком, КРОК - тестовим режимом, а
                  Конспект - швидким теоретичним шаром для повторення ключових тем.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <SiteMobileTabbar active="home" />
    </main>
  );
}
