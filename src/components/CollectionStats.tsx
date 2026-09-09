interface Disc {
  format?: string | null;
  favorite?: boolean;
  genre?: string | null;
  [key: string]: any;
}

interface CollectionStatsProps {
  discs: Disc[];
}

export default function CollectionStats({ discs = [] }: CollectionStatsProps) {
  const total = discs.length;
  const favorites = discs.filter((d) => Boolean(d.favorite)).length;
  const vinyls = discs.filter((d) => {
    const fmt = String(d.format || "").toLowerCase();
    return fmt.includes("vinil") || fmt.includes("lp");
  }).length;
  const genresCount = new Set(discs.map((d) => d.genre).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-xl text-center">
        <p className="text-2xl font-bold text-amber-500">{total}</p>
        <p className="text-xs text-parchment/60">Total de Discos</p>
      </div>
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-xl text-center">
        <p className="text-2xl font-bold text-amber-500">{favorites}</p>
        <p className="text-xs text-parchment/60">Favoritos</p>
      </div>
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-xl text-center">
        <p className="text-2xl font-bold text-amber-500">{vinyls}</p>
        <p className="text-xs text-parchment/60">Vinil / LPs</p>
      </div>
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-xl text-center">
        <p className="text-2xl font-bold text-amber-500">{genresCount}</p>
        <p className="text-xs text-parchment/60">Gêneros</p>
      </div>
    </div>
  );
}