import { getImpacts } from "@/lib/climate";

export default function ImpactsSection() {
  const impacts = getImpacts();
  return (
    <section id="zivot" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl">Čo to znamená pre váš život?</h2>
        <p className="mt-2 text-lg text-stone-600">
          Kde sa zmena prejaví najskôr — od bývania po voľný čas.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="mt-6 hidden grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_minmax(0,1.1fr)] gap-6 border-b-2 border-stone-900 pb-2 text-xs font-semibold uppercase tracking-[0.06em] text-stone-500 lg:grid"
      >
        <span>Oblasť</span>
        <span>Čo sa mení</span>
        <span>Čo to znamená v praxi</span>
      </div>

      <ul className="mt-6 border-t-2 border-stone-900 lg:mt-0 lg:border-t-0">
        {impacts.map((c) => (
          <li
            key={c.id}
            className="grid gap-x-6 gap-y-2 border-b border-stone-300 py-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_minmax(0,1.1fr)]"
          >
            <h3 className="font-serif text-xl font-semibold leading-snug lg:text-2xl">
              {c.titleSk}
            </h3>
            <div>
              <p className="font-semibold text-stone-900">{c.headlineSk}</p>
              <p className="mt-1 leading-relaxed text-stone-600">
                {c.explanationSk}
              </p>
            </div>
            <div className="border-l-2 border-accent-700 pl-4 lg:mt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent-700 lg:sr-only">
                Čo to znamená v praxi
              </p>
              <p className="mt-1 leading-relaxed text-stone-800 lg:mt-0">
                {c.praxSk}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
