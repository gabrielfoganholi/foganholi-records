"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DiscCardProps {
  disc: any;
  onUpdate?: () => void;
}

export default function DiscCard({ disc, onUpdate }: DiscCardProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(disc.is_favorite || false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isFavorite;
    const nextState = !previousState;

    // Atualização otimista da UI
    setIsFavorite(nextState);

    const { error } = await supabase
      .from("discs")
      .update({ is_favorite: nextState })
      .eq("id", disc.id);

    if (error) {
      // Reverte o ícone caso o banco de dados rejeite a alteração
      setIsFavorite(previousState);
      alert("Erro ao atualizar favorito: " + error.message);
      return;
    }

    if (onUpdate) onUpdate();
  };

  return (
    <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl overflow-hidden hover:border-amber-500/50 transition group flex flex-col justify-between relative">
      <div>
        {/* IMAGEM DA CAPA */}
        <div className="aspect-square w-full relative overflow-hidden bg-[#120e0c]">
          {disc.cover_url ? (
            <img
              src={disc.cover_url}
              alt={disc.title || "Capa do disco"}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              💿
            </div>
          )}

          {/* BADGE DE FORMATO */}
          {disc.format && (
            <span className="absolute top-3 right-3 bg-amber-500/90 text-walnut-950 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
              {disc.format}
            </span>
          )}

          {/* BOTÃO FAVORITO */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-sm p-1.5 rounded-full transition active:scale-90"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isFavorite ? "⭐" : "🤍"}
          </button>
        </div>

        {/* INFORMAÇÕES */}
        <div className="p-4 space-y-1">
          <h3 className="font-bold text-parchment text-base line-clamp-1">
            {disc.title || "Sem título"}
          </h3>
          <p className="text-xs text-parchment/70 font-medium line-clamp-1">
            {disc.artist || "Artista desconhecido"}
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] text-parchment/50">
            {disc.year && <span>{disc.year}</span>}
            {disc.year && disc.genre && <span>•</span>}
            {disc.genre && (
              <span className="bg-[#2a1f1a] px-2 py-0.5 rounded text-amber-500/90">
                {disc.genre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AÇÕES DE NAVEGAÇÃO E EDIÇÃO */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <Link
          href={`/disc/${disc.id}`}
          className="flex-1 bg-[#2a1f1a] hover:bg-[#3d2d26] text-parchment text-xs font-semibold py-2 rounded-xl text-center transition"
        >
          Ver Detalhes
        </Link>
        <Link
          href={`/disc/${disc.id}/edit`}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 p-2 rounded-xl text-xs font-bold transition flex items-center justify-center"
          title="Editar Cadastro"
        >
          ✏️
        </Link>
      </div>
    </div>
  );
}