import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Domov — Ako sa zmení Slovensko?">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-lg text-white"
          >
            ◍
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight">
              Ako sa zmení Slovensko?
            </span>
            <span className="block text-xs text-stone-500">
              klíma jednoducho a zrozumiteľne
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium" aria-label="Hlavná navigácia">
          <Link
            href="/#cas"
            className="hidden rounded-full px-3 py-2 text-stone-700 hover:bg-stone-100 sm:block"
          >
            Slovensko v čase
          </Link>
          <Link
            href="/#zivot"
            className="hidden rounded-full px-3 py-2 text-stone-700 hover:bg-stone-100 sm:block"
          >
            Môj život
          </Link>
          <Link
            href="/metodika"
            className="rounded-full px-3 py-2 text-stone-700 hover:bg-stone-100"
          >
            Metodika
          </Link>
          <Link
            href="/#mapa"
            className="ml-1 rounded-full bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
          >
            Preskúmať mapu
          </Link>
        </nav>
      </div>
    </header>
  );
}
