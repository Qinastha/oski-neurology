export default function TicketReaderLoading() {
  return (
    <main className="grid min-h-dvh justify-center gap-[18px] p-5 md:grid-cols-[240px_minmax(0,900px)] max-md:block max-md:p-[18px_14px_88px]">
      <aside className="h-[calc(100dvh-40px)] rounded-lg border border-clinical-line/85 bg-clinical-surface/70 max-md:hidden" />
      <section className="rounded-lg border border-clinical-line/85 bg-clinical-surface/85 px-[clamp(18px,4vw,48px)] py-6 shadow-[0_18px_55px_rgba(84,67,20,0.08)]">
        <div className="h-4 w-32 rounded-full bg-clinical-accent-soft" />
        <div className="mt-3 h-14 w-52 rounded-lg bg-clinical-accent-soft" />
        <div className="mt-8 grid gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="space-y-3 border-t border-clinical-line pt-5" key={index}>
              <div className="h-7 w-3/4 rounded-lg bg-clinical-accent-soft" />
              <div className="h-4 w-full rounded-full bg-clinical-line" />
              <div className="h-4 w-11/12 rounded-full bg-clinical-line" />
              <div className="h-4 w-9/12 rounded-full bg-clinical-line" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
