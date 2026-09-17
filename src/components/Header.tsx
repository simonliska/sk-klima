import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Domov — Ako sa zmení Slovensko?">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-lg text-white"
          >
            ◍
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold tracking-tight sm:text-[15px]">
              Ako sa zmení Slovensko?
            </span>
            <span className="hidden text-xs text-stone-500 sm:block">
              klíma jednoducho a zrozumiteľne
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium" aria-label="Hlavná navigácia">
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
            className="rounded-full px-2 py-2 text-stone-700 hover:bg-stone-100 sm:px-3"
          >
            Metodika
          </Link>
          <Link
            href="/#mapa"
            className="ml-1 whitespace-nowrap rounded-full bg-teal-700 px-3 py-2 text-white hover:bg-teal-800 sm:px-4"
          >
            Preskúmať mapu
          </Link>
        </nav>
      </div>
      {/* Mobile-only: all destinations in a scrollable row */}
      <nav
        className="border-t border-stone-200/70 sm:hidden"
        aria-label="Sekcie stránky"
      >
        <div className="flex gap-1 overflow-x-auto px-4 py-2 text-[13px] font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/#cas"
            className="min-h-[44px] shrink-0 content-center whitespace-nowrap rounded-full px-2 py-2 text-stone-700 hover:bg-stone-100"
          >
            Slovensko v čase
          </Link>
          <Link
            href="/#zivot"
            className="min-h-[44px] shrink-0 content-center whitespace-nowrap rounded-full px-2 py-2 text-stone-700 hover:bg-stone-100"
          >
            Môj život
          </Link>
        </div>
      </nav>
    </header>
  );
}
