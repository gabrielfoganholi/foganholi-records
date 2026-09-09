"use client";

import { Disc } from "@/lib/types";

export default function RandomPickModal({
  disc,
  onClose,
  onReroll,
}: {
  disc: Disc;
  onClose: () => void;
  onReroll: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-walnut-950/90 p-4">
      <div className="w-full max-w-sm rounded-lg border border-amber-500/40 bg-walnut-900 p-6 text-center">
        <p className="mb-4 text-xs text-parchment/50">Hoje a sorte escolheu…</p>

        <div className="relative mx-auto mb-4 aspect-square w-48 overflow-hidden rounded-lg border border-walnut-700 bg-walnut-800">
          {disc.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={disc.cover_url}
              alt={`Capa de ${disc.title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-parchment/30">
              Sem capa
            </div>
          )}
        </div>

        <p className="font-display text-xl text-parchment">{disc.title}</p>
        <p className="mb-6 text-sm text-parchment/60">
          {disc.artist} {disc.year ? `· ${disc.year}` : ""}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onReroll}
            className="flex-1 rounded-md border border-walnut-700 py-2 text-sm text-parchment hover:bg-walnut-800"
          >
            Sortear outro
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-amber-500 py-2 text-sm font-medium text-walnut-950 hover:bg-amber-400"
          >
            Bora ouvir
          </button>
        </div>
      </div>
    </div>
  );
}
