"use client";

import { Disc } from "@/lib/types";

export default function CollectionStats({ discs }: { discs: Disc[] }) {
  const total = discs.length;
  const favorites = discs.filter((d) => d.favorite).length;
  const vinyls = discs.filter((d) => d.format === "Vinil" || d.format === "LP").length;

  const genresCount = new Set(discs.map((d) => d.genre).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-2xl shadow-lg">
        <span className="text-xs text-parchment/50 block font-medium">Total no Acervo</span>
        <span className="font-display text-2xl font-bold text-amber-500">{total}</span>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-2xl shadow-lg">
        <span className="text-xs text-parchment/50 block font-medium">Favoritos</span>
        <span className="font-display text-2xl font-bold text-amber-500">{favorites}</span>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-2xl shadow-lg">
        <span className="text-xs text-parchment/50 block font-medium">Vinis / LPs</span>
        <span className="font-display text-2xl font-bold text-amber-500">{vinyls}</span>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-2xl shadow-lg">
        <span className="text-xs text-parchment/50 block font-medium">Gêneros Diferentes</span>
        <span className="font-display text-2xl font-bold text-amber-500">{genresCount}</span>
      </div>
    </div>
  );
}