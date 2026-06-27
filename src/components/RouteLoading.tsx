interface RouteLoadingProps {
  title?: string;
  mode?: "cards" | "reader" | "test";
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-clinical-line ${className}`} />;
}

export function RouteLoading({ title = "Завантаження", mode = "cards" }: RouteLoadingProps) {
  const cardCount = mode === "reader" ? 5 : mode === "test" ? 8 : 10;

  return (
    <main className="min-h-dvh p-5 max-md:p-0">
      <section className="mx-auto grid max-w-6xl gap-4 rounded-lg border border-clinical-line/85 bg-clinical-surface/90 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)] backdrop-blur-2xl max-md:min-h-dvh max-md:rounded-none max-md:border-0 max-md:p-[18px_14px_88px]">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <SkeletonLine className="h-3 w-36" />
            <h1 className="mt-3 text-[clamp(28px,4vw,42px)] font-black leading-[1.04] text-clinical-text">
              {title}
            </h1>
          </div>
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-clinical-accent-soft" />
        </header>

        <div className={mode === "reader" ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
          {Array.from({ length: cardCount }, (_, index) => (
            <div
              className="rounded-lg border border-clinical-line bg-clinical-surface p-4"
              key={index}
            >
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="mt-3 h-5 w-3/4" />
              <SkeletonLine className="mt-3 h-3 w-full" />
              <SkeletonLine className="mt-2 h-3 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
