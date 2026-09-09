"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DiscList from "@/components/DiscList";
import CollectionStats from "@/components/CollectionStats";

export default function HomePage() {
  const [discs, setDiscs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros de busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const fetchDiscs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("discs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDiscs(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar coleção:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscs();
  }, []);

  // Lista de gêneros dinâmicos presentes na coleção
  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    discs.forEach((disc) => {
      if (disc.genre) genresSet.add(disc.genre);
    });
    return Array.from(genresSet);
  }, [discs]);

  // Aplicação dos filtros e ordenação na memória
  const filteredDiscs = useMemo(() => {
    return discs
      .filter((disc) => {
        const matchesSearch =
          disc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          disc.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          disc.label?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGenre =
          selectedGenre === "all" || disc.genre === selectedGenre;

        const matchesFormat =
          selectedFormat === "all" || disc.format === selectedFormat;

        return matchesSearch && matchesGenre && matchesFormat;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "artist") return a.artist.localeCompare(b.artist);
        if (sortBy === "year-desc") return (b.year || 0) - (a.year || 0);
        if (sortBy === "year-asc") return (a.year || 0) - (b.year || 0);
        if (sortBy === "price-desc")
          return (Number(b.purchase_price) || 0) - (Number(a.purchase_price) || 0);
        if (sortBy === "price-asc")
          return (Number(a.purchase_price) || 0) - (Number(b.purchase_price) || 0);
        // "recent" default
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [discs, searchTerm, selectedGenre, selectedFormat, sortBy]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho da Coleção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-parchment">
            Minha Coleção
          </h1>
          <p className="text-xs text-parchment/60 mt-1">
            Gerencie seus discos e acompanhe o valor de mercado
          </p>
        </div>
        <Link
          href="/disc/new"
          className="bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold px-4 py-2.5 rounded-xl text-sm transition text-center shadow-md"
        >
          + Adicionar Disco
        </Link>
      </div>

      {/* Dashboard / Métricas da Coleção */}
      <CollectionStats discs={discs} />

      {/* Barra de Busca e Filtros */}
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca por Texto */}
          <input
            type="text"
            placeholder="🔍 Buscar título, artista, selo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3.5 py-2 text-xs text-parchment placeholder-parchment/40 focus:outline-none focus:border-amber-500/50"
          />

          {/* Filtro por Gênero */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3.5 py-2 text-xs text-parchment focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Todos os Gêneros</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {/* Filtro por Formato */}
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3.5 py-2 text-xs text-parchment focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Todos os Formatos</option>
            <option value="Vinil">Vinil</option>
            <option value="CD">CD</option>
            <option value="Fita Cassete">Fita Cassete</option>
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3.5 py-2 text-xs text-parchment focus:outline-none focus:border-amber-500/50"
          >
            <option value="recent">Mais Recentes</option>
            <option value="title">Título (A-Z)</option>
            <option value="artist">Artista (A-Z)</option>
            <option value="year-desc">Ano (Mais Novo)</option>
            <option value="year-asc">Ano (Mais Antigo)</option>
            <option value="price-desc">Maior Preço Pago</option>
            <option value="price-asc">Menor Preço Pago</option>
          </select>
        </div>

        {/* Resumo de resultados da busca */}
        {(searchTerm || selectedGenre !== "all" || selectedFormat !== "all") && (
          <div className="flex items-center justify-between text-xs text-parchment/60 pt-2 border-t border-[#2a1f1a]">
            <span>Exibindo {filteredDiscs.length} de {discs.length} discos</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedGenre("all");
                setSelectedFormat("all");
                setSortBy("recent");
              }}
              className="text-amber-500 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista da Coleção */}
      {loading ? (
        <p className="text-center py-12 text-sm text-parchment/60">
          Carregando sua coleção...
        </p>
      ) : (
        <DiscList discs={filteredDiscs} />
      )}
    </div>
  );
}