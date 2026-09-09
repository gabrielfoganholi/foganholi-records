"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/lib/useItems";
import { WishlistItem } from "@/lib/types";
import FilterBar, { SortOption } from "@/components/FilterBar";
import DiscCard from "@/components/DiscCard";

const PRIORITY_ORDER: Record<string, number> = { Alta: 0, Média: 1, Baixa: 2 };

function sortItems(items: WishlistItem[], sort: SortOption): WishlistItem[] {
  const copy = [...items];
  switch (sort) {
    case "title_asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "artist_asc":
      return copy.sort((a, b) => a.artist.localeCompare(b.artist));
    case "year_desc":
      return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "year_asc":
      return copy.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
    default:
      return copy;
  }
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { items, loading, refresh, artists, genres } = useItems<WishlistItem>("wishlist");
  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortOption>("recent");
  const [moving, setMoving] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = items.filter((d) => {
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.artist.toLowerCase().includes(search.toLowerCase());
      const matchesArtist = !artist || d.artist === artist;
      const matchesGenre = !genre || d.genre === genre;
      return matchesSearch && matchesArtist && matchesGenre;
    });
    const sorted = sortItems(base, sort);
    // por padrão, prioridade alta aparece primeiro dentro da ordenação escolhida
    if (sort === "recent") {
      return sorted.sort(
        (a, b) => (PRIORITY_ORDER[a.priority ?? "Média"] ?? 1) - (PRIORITY_ORDER[b.priority ?? "Média"] ?? 1)
      );
    }
    return sorted;
  }, [items, search, artist, genre, sort]);

  async function moveToCollection(item: WishlistItem) {
    setMoving(item.id);
    const { id, priority, max_price, ...rest } = item;
    const { error: insertError } = await supabase
      .from("discs")
      .insert({ ...rest, created_by: user?.id });
    if (!insertError) {
      await supabase.from("wishlist").delete().eq("id", id);
      refresh();
    }
    setMoving(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-parchment">Wishlist</h1>
          <p className="text-sm text-parchment/50">
            {items.length} {items.length === 1 ? "item desejado" : "itens desejados"}
          </p>
        </div>
        <Link
          href="/new?destino=wishlist"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-walnut-950 hover:bg-amber-400"
        >
          + Adicionar à wishlist
        </Link>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        artist={artist}
        onArtistChange={setArtist}
        genre={genre}
        onGenreChange={setGenre}
        artists={artists}
        genres={genres}
        view={view}
        onViewChange={setView}
        sort={sort}
        onSortChange={setSort}
        sortOptions={["recent", "title_asc", "artist_asc", "year_desc", "year_asc"]}
      />

      {loading ? (
        <p className="text-sm text-parchment/50">Carregando wishlist…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-walnut-700 py-16 text-center text-parchment/50">
          {items.length === 0
            ? "Sua wishlist está vazia. Adicione discos que vocês querem conseguir."
            : "Nenhum item corresponde aos filtros."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <DiscCard
                item={item}
                href={`/wishlist/${item.id}`}
                badge={item.priority ? `Prioridade ${item.priority.toLowerCase()}` : "Desejo"}
              />
              <button
                onClick={() => moveToCollection(item)}
                disabled={moving === item.id}
                className="rounded-md border border-sage-500/50 py-1.5 text-xs text-sage-400 hover:bg-sage-500/10 disabled:opacity-50"
              >
                {moving === item.id ? "Movendo…" : "Mover para a coleção"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
