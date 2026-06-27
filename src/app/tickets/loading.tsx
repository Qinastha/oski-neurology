export default function TicketsLoading() {
  return (
    <main className="grid min-h-dvh gap-[18px] p-5 md:grid-cols-[240px_minmax(0,1fr)] max-md:block max-md:p-[18px_14px_88px]">
      <aside className="h-[calc(100dvh-40px)] rounded-lg border border-clinical-line/85 bg-clinical-surface/70 max-md:hidden" />
      <section className="min-h-[70dvh] rounded-lg border border-clinical-line/85 bg-clinical-surface/80 p-5 shadow-[0_18px_55px_rgba(84,67,20,0.08)]">
        <div className="h-4 w-40 rounded-full bg-clinical-accent-soft" />
        <div className="mt-3 h-10 w-72 max-w-full rounded-lg bg-clinical-accent-soft" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-28 rounded-lg border border-clinical-line bg-clinical-surface" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
