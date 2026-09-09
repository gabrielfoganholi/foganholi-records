"use client";

import { useMemo } from "react";
import { Disc } from "@/lib/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CollectionStats({ items }: { items: Disc[] }) {
  const stats = useMemo(() => {
    const vinyl = items.filter((i) => i.format === "Vinil").length;
    const cd = items.filter((i) => i.format === "CD").length;

    const genreCounts = new Map<string, number>();
    items.forEach((i) => {
      if (i.genre) genreCounts.set(i.genre, (genreCounts.get(i.genre) ?? 0) + 1);
    });
    const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    const totalValue = items.reduce((sum, i) => sum + (i.estimated_value ?? 0), 0);
    const rated = items.filter((i) => i.rating);
    const avgRating = rated.length
      ? rated.reduce((sum, i) => sum + (i.rating ?? 0), 0) / rated.length
      : null;

    return { vinyl, cd, topGenre, totalValue, avgRating };
  }, [items]);

  if (items.length === 0) return null;

  const cards = [
    { label: "Vinis", value: stats.vinyl },
    { label: "CDs", value: stats.cd },
    { label: "Gênero favorito", value: stats.topGenre ?? "—" },
    {
      label: "Avaliação média",
      value: stats.avgRating ? `${stats.avgRating.toFixed(1)} ★` : "—",
    },
    {
      label: "Valor estimado",
      value: stats.totalValue > 0 ? formatBRL(stats.totalValue) : "—",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-walnut-700 bg-walnut-900 px-3 py-2.5"
        >
          <p className="truncate font-display text-lg text-amber-400">{c.value}</p>
          <p className="text-xs text-parchment/50">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
