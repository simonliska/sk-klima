"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface TownOption {
  slug: string;
  name: string;
  krajName: string;
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Search box for the district towns (accent-insensitive, keyboard accessible). */
export default function TownSearch({ towns }: { towns: TownOption[] }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return towns
      .filter((t) => norm(t.name).includes(q))
      .sort((a, b) => {
        const as = norm(a.name).startsWith(q) ? 0 : 1;
        const bs = norm(b.name).startsWith(q) ? 0 : 1;
        return as - bs || a.name.localeCompare(b.name, "sk");
      })
      .slice(0, 8);
  }, [query, towns]);

  const go = (slug: string) => router.push(`/mesto/${slug}`);
  const showList = open && query.trim().length > 0;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <label htmlFor={`${id}-input`} className="sr-only">
        Nájdite svoje okresné mesto
      </label>
      <input
        id={`${id}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && results[active] ? `${id}-opt-${active}` : undefined
        }
        autoComplete="off"
        placeholder="Napíšte názov okresného mesta, napr. Poprad"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && results.length) {
            e.preventDefault();
            setActive((a) => (a + 1) % results.length);
          } else if (e.key === "ArrowUp" && results.length) {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % results.length);
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            go(results[active].slug);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-base shadow-sm placeholder:text-stone-400"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-5 py-3 text-sm text-stone-500">
              Mesto sa nenašlo. Skúste iný názov.
            </li>
          ) : (
            results.map((t, i) => (
              <li
                key={t.slug}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (not click): the input's blur would close the list first
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(t.slug);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-baseline justify-between gap-3 px-5 py-3 ${
                  i === active ? "bg-teal-50" : ""
                }`}
              >
                <span className="font-semibold text-stone-900">{t.name}</span>
                <span className="text-xs text-stone-500">{t.krajName}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
