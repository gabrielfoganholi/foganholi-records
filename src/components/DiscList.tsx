"use client";

import Link from "next/link";
import { Disc, WishlistItem } from "@/lib/types";
import DiscCard from "./DiscCard";

interface Props {
  items: (Disc | WishlistItem)[];
  view: "grid" | "list";
  basePath: string;
  emptyMessage: string;
  onToggleFavorite?: (id: string, next: boolean) => void;
}

function isDisc(item: Disc | WishlistItem): item is Disc {
  return "favorite" in item;
}

export default function DiscList({
  items,
  view,
  basePath,
  emptyMessage,
  onToggleFavorite,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-walnut-700 px-4 py-16 text-center text-parchment/50">
        {emptyMessage}
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <DiscCard
            key={item.id}
            item={item}
            href={`${basePath}/${item.id}`}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-walnut-800 overflow-hidden rounded-xl border border-walnut-700 bg-walnut-950/40">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${basePath}/${item.id}`}
          className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-walnut-900/60 sm:gap-4 sm:px-4 sm:py-3"
        >
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-walnut-800 shadow-sm sm:h-14 sm:w-14">
            {item.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-parchment/30">
                Sem capa
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-sm font-medium text-parchment sm:text-base">
                {item.title}
              </p>
              {isDisc(item) && item.favorite && (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400">
                  <path d="M10 3.5c1.4-2 5.6-1.8 5.6 2 0 3-3 5.4-5.6 8-2.6-2.6-5.6-5-5.6-8 0-3.8 4.2-4 5.6-2z" />
                </svg>
              )}
            </div>
            <p className="truncate text-xs text-parchment/70 sm:text-sm">{item.artist}</p>
          </div>

          {isDisc(item) && item.rating ? (
            <span className="text-xs text-amber-400">
              {"★".repeat(item.rating)}
            </span>
          ) : null}

          <div className="hidden text-xs text-parchment/50 md:block md:text-sm">
            {item.genre ?? "—"}
          </div>

          <div className="text-xs text-parchment/50 sm:text-sm">
            {item.year ?? "—"}
          </div>

          <span className="rounded bg-walnut-800/80 px-2 py-0.5 text-[10px] font-medium text-parchment/80 uppercase tracking-wider sm:text-xs">
            {item.format}
          </span>
        </Link>
      ))}
    </div>
  );
}