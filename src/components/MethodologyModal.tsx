"use client";

import { useState } from "react";
import Link from "next/link";

/** Simple accessible modal linking to /metodika — used beside every key number. */
export default function MethodologyModal({ label = "Ako vznikli tieto údaje?" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-teal-800 hover:underline"
      >
        {label}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ako vznikli tieto údaje"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black">Ako vznikli tieto údaje?</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              1951–2010 pozorovania E-OBS (30-ročné priemery), 1991–2020
              klimatický normál SHMÚ (teplotné odchýlky sa vzťahujú k nemu).
              Budúcnosť je projekcia RCP4.5 (30-ročné priemery 2021–2050
              a 2071–2100), nie predpoveď počasia.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/metodika"
                className="flex-1 rounded-full bg-teal-700 px-4 py-2.5 text-center font-bold text-white hover:bg-teal-800"
              >
                Prečítať metodiku
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-stone-300 px-4 py-2.5 font-bold hover:bg-stone-100"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
