"use client";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedGenre: string;
  setSelectedGenre: (value: string) => void;
  selectedFormat: string;
  setSelectedFormat: (value: string) => void;
  onlyFavorites?: boolean;
  setOnlyFavorites?: (value: boolean) => void;
  genres?: string[];
  formats?: string[];
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedFormat,
  setSelectedFormat,
  onlyFavorites,
  setOnlyFavorites,
  genres = [],
  formats = [],
}: FilterBarProps) {
  // Garante que ambos sejam sempre arrays seguros
  const safeGenres = Array.isArray(genres) ? genres : [];
  const safeFormats = Array.isArray(formats) ? formats : [];

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-3 w-full items-center">
      {/* Busca por texto */}
      <div className="relative flex-1 w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por banda, artista ou título..."
          className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl pl-10 pr-4 py-2.5 text-sm text-parchment placeholder-parchment/40 focus:outline-none focus:border-amber-500 transition"
        />
        <span className="absolute left-3.5 top-3 text-parchment/40 text-sm">🔍</span>
      </div>

      {/* Filtro por Gênero */}
      <select
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
        className="bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500 transition w-full md:w-auto"
      >
        <option value="">Todos os Gêneros</option>
        {safeGenres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      {/* Filtro por Formato */}
      <select
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value)}
        className="bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500 transition w-full md:w-auto"
      >
        <option value="">Todos os Formatos</option>
        {safeFormats.map((format) => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>

      {/* Filtro de Favoritos (Opcional) */}
      {setOnlyFavorites !== undefined && (
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border whitespace-nowrap w-full md:w-auto ${
            onlyFavorites
              ? "bg-amber-500 text-walnut-950 border-amber-500 font-bold"
              : "bg-[#120e0c] text-parchment/80 border-[#3d2d26] hover:bg-[#2a1f1a]"
          }`}
        >
          {onlyFavorites ? "⭐ Favoritos" : "🤍 Favoritos"}
        </button>
      )}
    </div>
  );
}