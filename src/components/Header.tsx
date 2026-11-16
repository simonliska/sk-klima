import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-300 bg-stone-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Domov — Ako sa zmení Slovensko?">
          <Logo className="h-9 w-9 shrink-0" />
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block truncate font-serif text-lg font-semibold">
              Ako sa zmení Slovensko?
            </span>
            <span className="block text-xs text-stone-500">
              klíma jednoducho a zrozumiteľne
            </span>
          </span>
        </Link>
        <nav
          className="flex shrink-0 items-center text-[13px] font-medium sm:gap-1 sm:text-sm"
          aria-label="Hlavná navigácia"
        >
          <Link
            href="/#cas"
            className="whitespace-nowrap px-2 py-3 text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline sm:px-3 sm:py-2"
          >
            <span className="sm:hidden">Časová os</span>
            <span className="hidden sm:inline">Slovensko v čase</span>
          </Link>
          <Link
            href="/#zivot"
            className="whitespace-nowrap px-2 py-3 text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline sm:px-3 sm:py-2"
          >
            Môj život
          </Link>
          <Link
            href="/metodika"
            className="whitespace-nowrap px-2 py-3 text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline sm:px-3 sm:py-2"
          >
            Metodika
          </Link>
          <Link
            href="/#mapa"
            className="ml-1 whitespace-nowrap rounded-xs bg-accent-700 px-3 py-2 text-white hover:bg-accent-800 sm:px-4"
          >
            <span className="sm:hidden">Mapa</span>
            <span className="hidden sm:inline">Preskúmať mapu</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
