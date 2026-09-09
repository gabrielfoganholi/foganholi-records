"use client";

export type SortOption =
  | "recent"
  | "title_asc"
  | "artist_asc"
  | "year_desc"
  | "year_asc"
  | "rating_desc";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Adicionados recentemente",
  title_asc: "Título (A-Z)",
  artist_asc: "Artista (A-Z)",
  year_desc: "Ano (mais recente)",
  year_asc: "Ano (mais antigo)",
  rating_desc: "Avaliação",
};

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  artist: string;
  onArtistChange: (v: string) => void;
  genre: string;
  onGenreChange: (v: string) => void;
  artists: string[];
  genres: string[];
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  sort?: SortOption;
  onSortChange?: (v: SortOption) => void;
  sortOptions?: SortOption[];
  favoritesOnly?: boolean;
  onFavoritesOnlyChange?: (v: boolean) => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  artist,
  onArtistChange,
  genre,
  onGenreChange,
  artists,
  genres,
  view,
  onViewChange,
  sort,
  onSortChange,
  sortOptions,
  favoritesOnly,
  onFavoritesOnlyChange,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título ou artista…"
            className="w-full rounded-md border border-walnut-700 bg-walnut-900 px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 focus:border-amber-500 focus:outline-none sm:w-auto sm:max-w-xs"
          />
          <select
            value={artist}
            onChange={(e) => onArtistChange(e.target.value)}
            className="rounded-md border border-walnut-700 bg-walnut-900 px-3 py-2 text-sm text-parchment focus:border-amber-500 focus:outline-none"
          >
            <option value="">Todos os artistas</option>
            {artists.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="rounded-md border border-walnut-700 bg-walnut-900 px-3 py-2 text-sm text-parchment focus:border-amber-500 focus:outline-none"
          >
            <option value="">Todos os gêneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {onSortChange && (
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-md border border-walnut-700 bg-walnut-900 px-3 py-2 text-sm text-parchment focus:border-amber-500 focus:outline-none"
            >
              {Object.entries(SORT_LABELS)
                .filter(([value]) => !sortOptions || sortOptions.includes(value as SortOption))
                .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {onFavoritesOnlyChange && (
            <button
              type="button"
              onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
                favoritesOnly
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-walnut-700 text-parchment/60 hover:text-parchment"
              }`}
            >
              <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-amber-400" : "fill-none stroke-current stroke-[1.5]"}`}>
                <path d="M10 3.5c1.4-2 5.6-1.8 5.6 2 0 3-3 5.4-5.6 8-2.6-2.6-5.6-5-5.6-8 0-3.8 4.2-4 5.6-2z" />
              </svg>
              Favoritos
            </button>
          )}

          <div className="flex gap-1 rounded-md border border-walnut-700 p-0.5">
            <button
              onClick={() => onViewChange("grid")}
              className={`rounded px-2.5 py-1 text-sm ${
                view === "grid"
                  ? "bg-amber-500 text-walnut-950"
                  : "text-parchment/60 hover:text-parchment"
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => onViewChange("list")}
              className={`rounded px-2.5 py-1 text-sm ${
                view === "list"
                  ? "bg-amber-500 text-walnut-950"
                  : "text-parchment/60 hover:text-parchment"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
