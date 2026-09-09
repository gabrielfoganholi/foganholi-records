"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Disc } from "@/lib/types";
import DiscList from "@/components/DiscList";

export default function HomePage() {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "artist" | "year">("recent");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [randomDisc, setRandomDisc] = useState<Disc | null>(null);

  useEffect(() => {
    fetchDiscs();
  }, []);

  const fetchDiscs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("discs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar discos:", error.message);
    } else if (data) {
      setDiscs(data as Disc[]);
    }
    setLoading(false);
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setDiscs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, favorite: nextStatus } : d))
    );

    const { error } = await supabase
      .from("discs")
      .update({ favorite: nextStatus })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar favorito:", error.message);
      fetchDiscs(); // Reverte caso falhe
    }
  };

  const handleRandomSelect = () => {
    if (discs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * discs.length);
    setRandomDisc(discs[randomIndex]);
  };

  // Listas para os seletores
  const artists = useMemo(() => {
    const set = new Set(discs.map((d) => d.artist).filter(Boolean));
    return Array.from(set).sort();
  }, [discs]);

  const genres = useMemo(() => {
    const set = new Set(discs.map((d) => d.genre).filter(Boolean));
    return Array.from(set).sort();
  }, [discs]);

  // Estatísticas
  const totalVinis = useMemo(
    () => discs.filter((d) => d.format?.toLowerCase().includes("vinil") || d.format?.toLowerCase().includes("lp")).length,
    [discs]
  );
  const totalCDs = useMemo(
    () => discs.filter((d) => d.format?.toLowerCase().includes("cd")).length,
    [discs]
  );

  const topGenre = useMemo(() => {
    if (discs.length === 0) return "—";
    const counts: Record<string, number> = {};
    discs.forEach((d) => {
      if (d.genre) counts[d.genre] = (counts[d.genre] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "—";
  }, [discs]);

  const avgRating = useMemo(() => {
    const rated = discs.filter((d) => d.rating && d.rating > 0);
    if (rated.length === 0) return "—";
    const sum = rated.reduce((acc, d) => acc + (d.rating || 0), 0);
    return (sum / rated.length).toFixed(1);
  }, [discs]);

  // Filtragem e Ordenação
  const filteredDiscs = useMemo(() => {
    return discs
      .filter((disc) => {
        const matchesSearch =
          disc.title.toLowerCase().includes(search.toLowerCase()) ||
          disc.artist.toLowerCase().includes(search.toLowerCase());
        const matchesArtist = selectedArtist ? disc.artist === selectedArtist : true;
        const matchesGenre = selectedGenre ? disc.genre === selectedGenre : true;
        const matchesFavorite = filterFavorites ? disc.favorite : true;

        return matchesSearch && matchesArtist && matchesGenre && matchesFavorite;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "artist") return a.artist.localeCompare(b.artist);
        if (sortBy === "year") return (b.year || 0) - (a.year || 0);
        return 0; // "recent" mantém a ordem padrão do supabase
      });
  }, [discs, search, selectedArtist, selectedGenre, filterFavorites, sortBy]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
            Coleção
          </h1>
          <p className="text-sm text-parchment/60">
            {discs.length} {discs.length === 1 ? "disco no acervo" : "discos no acervo"}
          </p>
        </div>

        {/* Ações Principais */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            onClick={handleRandomSelect}
            className="w-full sm:w-auto px-4 py-2.5 bg-walnut-800 hover:bg-walnut-700 text-parchment border border-walnut-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🎲</span> O que ouvir hoje?
          </button>
          <Link
            href="/new"
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-walnut-950 font-semibold rounded-xl text-sm transition-colors text-center shadow-md"
          >
            + Adicionar disco
          </Link>
        </div>
      </div>

      {/* Modal / Card de Sorteio do Disco */}
      {randomDisc && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">🎧</span>
            <div className="min-w-0">
              <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">Sugestão de Hoje</p>
              <p className="font-display text-parchment font-semibold truncate">{randomDisc.title}</p>
              <p className="text-xs text-parchment/70 truncate">{randomDisc.artist}</p>
            </div>
          </div>
          <button
            onClick={() => setRandomDisc(null)}
            className="text-parchment/50 hover:text-parchment text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Painel de Estatísticas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        <div className="bg-walnut-900/60 border border-walnut-800 p-3.5 rounded-xl">
          <p className="text-xl font-bold text-amber-500">{totalVinis}</p>
          <p className="text-xs text-parchment/60 mt-0.5">Vinis</p>
        </div>
        <div className="bg-walnut-900/60 border border-walnut-800 p-3.5 rounded-xl">
          <p className="text-xl font-bold text-amber-500">{totalCDs}</p>
          <p className="text-xs text-parchment/60 mt-0.5">CDs</p>
        </div>
        <div className="bg-walnut-900/60 border border-walnut-800 p-3.5 rounded-xl">
          <p className="text-xl font-bold text-amber-500 truncate">{topGenre}</p>
          <p className="text-xs text-parchment/60 mt-0.5">Gênero favorito</p>
        </div>
        <div className="bg-walnut-900/60 border border-walnut-800 p-3.5 rounded-xl">
          <p className="text-xl font-bold text-amber-500">{avgRating} <span className="text-xs">★</span></p>
          <p className="text-xs text-parchment/60 mt-0.5">Avaliação média</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-walnut-900/60 border border-walnut-800 p-3.5 rounded-xl">
          <p className="text-xl font-bold text-amber-500">—</p>
          <p className="text-xs text-parchment/60 mt-0.5">Valor estimado</p>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-3 bg-walnut-950/40 border border-walnut-800/80 p-3.5 rounded-2xl">
        {/* Campo de Pesquisa */}
        <input
          type="text"
          placeholder="Buscar por título ou artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-walnut-900/90 border border-walnut-700 rounded-xl px-4 py-2.5 text-sm text-parchment placeholder-parchment/40 focus:outline-none focus:border-amber-500 transition-colors"
        />

        {/* Selects de Filtros */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full bg-walnut-900/90 border border-walnut-700 rounded-xl px-3 py-2 text-xs text-parchment/90 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos os artistas</option>
            {artists.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full bg-walnut-900/90 border border-walnut-700 rounded-xl px-3 py-2 text-xs text-parchment/90 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos os gêneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-walnut-900/90 border border-walnut-700 rounded-xl px-3 py-2 text-xs text-parchment/90 focus:outline-none focus:border-amber-500"
          >
            <option value="recent">Adicionados recentemente</option>
            <option value="title">Título (A-Z)</option>
            <option value="artist">Artista (A-Z)</option>
            <option value="year">Ano de Lançamento</option>
          </select>
        </div>

        {/* Alternadores de Exibição e Favoritos */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              filterFavorites
                ? "bg-amber-500/10 border-amber-500 text-amber-400"
                : "border-walnut-700 text-parchment/70 hover:bg-walnut-800"
            }`}
          >
            <span>♥</span> Favoritos
          </button>

          <div className="flex items-center gap-1 bg-walnut-900 p-1 rounded-lg border border-walnut-800">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                view === "grid"
                  ? "bg-amber-500 text-walnut-950 font-semibold"
                  : "text-parchment/60 hover:text-parchment"
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-amber-500 text-walnut-950 font-semibold"
                  : "text-parchment/60 hover:text-parchment"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Discos */}
      {loading ? (
        <div className="py-20 text-center text-parchment/50 text-sm">
          Carregando acervo...
        </div>
      ) : (
        <DiscList
          items={filteredDiscs}
          view={view}
          basePath="/disc"
          emptyMessage="Nenhum disco encontrado na coleção com esses filtros."
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}