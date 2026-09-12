import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>🗺️</p>
      <h1 className="mt-4 text-3xl font-black">Stránka sa nenašla</h1>
      <p className="mt-2 text-stone-600">
        Skúste mapu Slovenska alebo sa vráťte na homepage.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800"
      >
        ← Domov
      </Link>
    </div>
  );
}
