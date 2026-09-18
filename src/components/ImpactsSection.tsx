import { getImpacts } from "@/lib/climate";

export default function ImpactsSection() {
  const impacts = getImpacts();
  return (
    <section id="zivot" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Čo to znamená pre váš život?
        </h2>
        <p className="mt-2 text-lg text-stone-600">
          Predstavených je 8 oblastí, kde sa zmena prejaví najskôr — od bývania po
          voľný čas.
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {impacts.map((c) => (
          <article
            key={c.id}
            className="flex flex-col rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <p className="text-3xl" aria-hidden="true">
                {c.icon}
              </p>
              <h3 className="font-black">{c.titleSk}</h3>
            </div>
            <p className="mt-1 text-sm font-semibold text-teal-800">
              {c.headlineSk}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {c.explanationSk}
            </p>
            <div className="mt-auto pt-3">
              <div className="rounded-2xl bg-teal-50 p-3 text-sm leading-relaxed">
                <p className="font-bold text-teal-950">Čo to znamená v praxi?</p>
                <p className="mt-1 text-teal-950/80">{c.praxSk}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
