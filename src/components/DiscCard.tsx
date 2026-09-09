"use client";

import Link from "next/link";
import { Disc, WishlistItem } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  item: Disc | WishlistItem;
  href: string;
  badge?: string;
  onToggleFavorite?: (id: string, next: boolean) => void;
}

function isDisc(item: Disc | WishlistItem): item is Disc {
  return "favorite" in item;
}

export default function DiscCard({ item, href, badge, onToggleFavorite }: Props) {
  const favorite = isDisc(item) && item.favorite;
  const rating = isDisc(item) ? item.rating : null;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisc(item)) return;
    const next = !item.favorite;
    onToggleFavorite?.(item.id, next);
    await supabase.from("discs").update({ favorite: next }).eq("id", item.id);
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-walnut-700 bg-walnut-900 transition-transform hover:-translate-y-0.5 hover:border-amber-500/60"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-walnut-800">
        {/* Disco de vinil escondido atrás da capa: aparece "saindo da capa" ao passar o mouse */}
        <div className="absolute inset-0 flex translate-x-1 items-center justify-center">
          <VinylPlaceholder className="h-[70%] w-[70%] text-walnut-700" />
        </div>

        <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:translate-x-3 group-hover:-translate-y-1 group-hover:rotate-1">
          {item.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_url}
              alt={`Capa de ${item.title}`}
              className="h-full w-full object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-walnut-800">
              <VinylPlaceholder className="h-16 w-16 text-walnut-700" />
            </div>
          )}
        </div>

        <span className="absolute left-2 top-2 rounded bg-walnut-950/80 px-2 py-0.5 text-xs text-parchment/80">
          {item.format}
        </span>

        {isDisc(item) && (
          <button
            onClick={toggleFavorite}
            aria-label={favorite ? "Remover dos favoritos" : "Marcar como favorito"}
            className="absolute right-2 top-2 rounded-full bg-walnut-950/80 p-1.5 text-amber-400 hover:bg-walnut-950"
          >
            <svg viewBox="0 0 20 20" className={`h-4 w-4 ${favorite ? "fill-amber-400" : "fill-none stroke-amber-400 stroke-[1.5]"}`}>
              <path d="M10 3.5c1.4-2 5.6-1.8 5.6 2 0 3-3 5.4-5.6 8-2.6-2.6-5.6-5-5.6-8 0-3.8 4.2-4 5.6-2z" />
            </svg>
          </button>
        )}

        {badge && (
          <span className="absolute bottom-2 right-2 rounded bg-walnut-950/80 px-2 py-0.5 text-xs text-sage-400">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="truncate font-display text-base text-parchment">
          {item.title}
        </span>
        <span className="truncate text-sm text-parchment/70">
          {item.artist}
        </span>
        <div className="flex items-center justify-between">
          <span className="text-xs text-parchment/40">
            {item.year ?? "Ano desconhecido"}
            {item.genre ? ` · ${item.genre}` : ""}
          </span>
          {rating ? (
            <span className="text-xs text-amber-400">{"★".repeat(rating)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function VinylPlaceholder({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="46" fill="currentColor" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#171009" strokeWidth="1" opacity="0.4" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#171009" strokeWidth="1" opacity="0.4" />
      <circle cx="50" cy="50" r="16" fill="#C9932F" />
      <circle cx="50" cy="50" r="3" fill="#171009" />
    </svg>
  );
}
