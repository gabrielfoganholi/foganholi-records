"use client";

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
      <div className="rounded-lg border border-dashed border-walnut-700 py-16 text-center text-parchment/50">
        {emptyMessage}
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
    <div className="flex flex-col divide-y divide-walnut-800 rounded-lg border border-walnut-700">
      {items.map((item) => (
        <a
          key={item.id}
          href={`${basePath}/${item.id}`}
          className="flex items-center gap-4 px-4 py-3 hover:bg-walnut-900"
        >
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-walnut-800">
            {item.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-parchment">{item.title}</p>
              {isDisc(item) && item.favorite && (
                <svg viewBox="0 0 20 20" className="h-3 w-3 flex-shrink-0 fill-amber-400">
                  <path d="M10 3.5c1.4-2 5.6-1.8 5.6 2 0 3-3 5.4-5.6 8-2.6-2.6-5.6-5-5.6-8 0-3.8 4.2-4 5.6-2z" />
                </svg>
              )}
            </div>
            <p className="truncate text-sm text-parchment/60">{item.artist}</p>
          </div>
          {isDisc(item) && item.rating ? (
            <span className="hidden text-xs text-amber-400 sm:block">
              {"★".repeat(item.rating)}
            </span>
          ) : null}
          <div className="hidden text-sm text-parchment/40 sm:block">
            {item.genre ?? "—"}
          </div>
          <div className="text-sm text-parchment/40">{item.year ?? "—"}</div>
          <span className="rounded bg-walnut-800 px-2 py-0.5 text-xs text-parchment/70">
            {item.format}
          </span>
        </a>
      ))}
    </div>
  );
}
