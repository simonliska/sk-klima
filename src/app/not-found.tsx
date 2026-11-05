import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">Chyba 404</p>
      <h1 className="mt-2 text-3xl font-semibold">Stránka sa nenašla</h1>
      <p className="mt-2 text-stone-600">
        Skúste mapu Slovenska alebo sa vráťte na homepage.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xs bg-accent-700 px-6 py-3 font-semibold text-white hover:bg-accent-800"
      >
        ← Domov
      </Link>
    </div>
  );
}
