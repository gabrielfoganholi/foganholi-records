"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useItems } from "@/lib/useItems";
import { Disc } from "@/lib/types";
import FilterBar, { SortOption } from "@/components/FilterBar";
import DiscList from "@/components/DiscList";
import CollectionStats from "@/components/CollectionStats";
import RandomPickModal from "@/components/RandomPickModal";

function sortItems(items: Disc[], sort: SortOption): Disc[] {
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
    case "rating_desc":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "recent":
    default:
      return copy;
  }
}

export default function CollectionPage() {
  const { items, loading, refresh, artists, genres } = useItems<Disc>("discs");
  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortOption>("recent");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pick, setPick] = useState<Disc | null>(null);

  const filtered = useMemo(() => {
    const base = items.filter((d) => {
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.artist.toLowerCase().includes(search.toLowerCase());
      const matchesArtist = !artist || d.artist === artist;
      const matchesGenre = !genre || d.genre === genre;
      const matchesFavorite = !favoritesOnly || d.favorite;
      return matchesSearch && matchesArtist && matchesGenre && matchesFavorite;
    });
    return sortItems(base, sort);
  }, [items, search, artist, genre, favoritesOnly, sort]);

  function sortear() {
    const pool = filtered.length > 0 ? filtered : items;
    if (pool.length === 0) return;
    setPick(pool[Math.floor(Math.random() * pool.length)]);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
            Coleção
          </h1>
          <p className="text-sm text-parchment/60">
            {items.length} {items.length === 1 ? "disco registrado" : "discos no acervo"}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2.5">
          {items.length > 0 && (
            <button
              onClick={sortear}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-walnut-700/80 bg-walnut-900/60 px-4 py-2.5 text-sm font-medium text-parchment shadow-sm transition-all hover:border-amber-500/50 hover:bg-walnut-800 hover:text-amber-300 active:scale-95"
              title="Sortear um disco para ouvir agora"
            >
              <span>🎲</span>
              <span>O que ouvir hoje?</span>
            </button>
          )}

          <Link
            href="/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-walnut-950 shadow-md shadow-amber-500/10 transition-all hover:bg-amber-400 active:scale-95"
          >
            <span>+</span>
            <span>Adicionar disco</span>
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      {!loading && <CollectionStats items={items} />}

      {/* Filtros e Busca */}
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
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      {/* Lista ou Loading Skeleton */}
      {loading ? (
        <SkeletonGrid />
      ) : (
        <DiscList
          items={filtered}
          view={view}
          basePath="/discs"
          onToggleFavorite={() => refresh()}
          emptyMessage={
            items.length === 0
              ? "Nenhum disco cadastrado ainda. Comece adicionando o primeiro."
              : "Nenhum disco corresponde aos filtros."
          }
        />
      )}

      {/* Modal de Sorteio */}
      {pick && (
        <RandomPickModal disc={pick} onClose={() => setPick(null)} onReroll={sortear} />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-walnut-800/80 bg-walnut-900/40 p-2.5 space-y-3"
        >
          <div className="aspect-square w-full rounded-lg bg-walnut-800/60 animate-pulse" />
          <div className="space-y-2 px-1 pb-1">
            <div className="h-4 w-5/6 rounded bg-walnut-800/60 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-walnut-800/40 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}