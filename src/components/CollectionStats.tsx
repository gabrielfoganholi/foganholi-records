interface Disc {
  format?: string | null;
  favorite?: boolean;
  genre?: string | null;
  purchase_price?: number | null;
  estimated_value?: number | null;
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

  // Calculando totais financeiros
  const totalSpent = discs.reduce((acc, curr) => acc + (Number(curr.purchase_price) || 0), 0);
  const totalEstimated = discs.reduce((acc, curr) => acc + (Number(curr.estimated_value) || 0), 0);

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
        <p className="text-base font-bold text-emerald-400">R$ {totalSpent.toFixed(2)}</p>
        <p className="text-xs text-parchment/60">Total Investido</p>
      </div>
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 rounded-xl text-center">
        <p className="text-base font-bold text-amber-400">R$ {totalEstimated.toFixed(2)}</p>
        <p className="text-xs text-parchment/60">Valor da Coleção</p>
      </div>
    </div>
  );
}