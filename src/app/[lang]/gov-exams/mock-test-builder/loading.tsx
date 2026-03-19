export default function MockTestBuilderLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe_0%,_#f8fafc_45%)] px-5 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-8">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-9 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-[32rem] max-w-full animate-pulse rounded bg-slate-100" />

          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-14 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-6 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
