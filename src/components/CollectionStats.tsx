interface CollectionStatsProps {
  discs: Array<{
    purchase_price?: number;
    estimated_value?: number;
  }>;
}

export default function CollectionStats({ discs = [] }: CollectionStatsProps) {
  const totalDiscs = discs.length;

  const totalSpent = discs.reduce(
    (sum, disc) => sum + (Number(disc.purchase_price) || 0),
    0
  );

  const totalEstimated = discs.reduce(
    (sum, disc) => sum + (Number(disc.estimated_value) || 0),
    0
  );

  const difference = totalEstimated - totalSpent;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 sm:p-5 rounded-2xl">
        <p className="text-xs font-semibold text-parchment/60">Total da Coleção</p>
        <p className="text-xl sm:text-2xl font-bold text-parchment mt-1">
          {totalDiscs} <span className="text-xs font-normal text-parchment/50">itens</span>
        </p>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 sm:p-5 rounded-2xl">
        <p className="text-xs font-semibold text-emerald-400">Total Investido</p>
        <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
          R$ {totalSpent.toFixed(2)}
        </p>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 sm:p-5 rounded-2xl">
        <p className="text-xs font-semibold text-amber-400">Valor de Mercado</p>
        <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
          R$ {totalEstimated.toFixed(2)}
        </p>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] p-4 sm:p-5 rounded-2xl">
        <p className="text-xs font-semibold text-parchment/60">Valorização</p>
        <p
          className={`text-xl sm:text-2xl font-bold mt-1 ${
            difference >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {difference >= 0 ? "+" : ""}R$ {difference.toFixed(2)}
        </p>
      </div>
    </div>
  );
}