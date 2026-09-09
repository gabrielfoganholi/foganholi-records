"use client";

import DiscCard from "./DiscCard";

interface DiscListProps {
  discs?: any[];
  onToggleFavorite?: (id: string) => void;
}

export default function DiscList({ discs = [], onToggleFavorite }: DiscListProps) {
  // Garante que 'discs' sempre seja um array, mesmo se vier null ou undefined
  const safeDiscs = Array.isArray(discs) ? discs : [];

  if (safeDiscs.length === 0) {
    return (
      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-12 text-center space-y-3">
        <span className="text-4xl block">💿</span>
        <h2 className="font-display font-bold text-lg text-parchment">
          Nenhum disco encontrado
        </h2>
        <p className="text-xs text-parchment/60 max-w-sm mx-auto">
          Sua coleção está vazia ou nenhum item corresponde aos filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {safeDiscs.map((disc) => (
        <DiscCard
          key={disc.id || Math.random()}
          disc={disc}
        />
      ))}
    </div>
  );
}