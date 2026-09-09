import Link from "next/link";

interface DiscCardProps {
  disc: {
    id: string | number;
    title: string;
    artist: string;
    year?: number;
    cover_url?: string;
    purchase_price?: number;
    estimated_value?: number;
  };
}

export default function DiscCard({ disc }: DiscCardProps) {
  return (
    <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition group">
      <Link href={`/disc/${disc.id}`} className="space-y-3 block">
        <div className="aspect-square bg-[#120e0c] rounded-xl overflow-hidden relative">
          <img
            src={disc.cover_url || "/placeholder.png"}
            alt={disc.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div>
          <h3 className="font-bold text-sm text-parchment truncate">{disc.title}</h3>
          <p className="text-xs text-parchment/60 truncate">{disc.artist}</p>
        </div>
      </Link>

      <div className="mt-4 pt-3 border-t border-[#2a1f1a] flex justify-between items-center text-xs">
        <div>
          <span className="block text-[10px] text-parchment/50">Pago</span>
          <span className="text-emerald-400 font-bold">
            R$ {Number(disc.purchase_price || 0).toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-parchment/50">Estimado</span>
          <span className="text-amber-400 font-bold">
            R$ {Number(disc.estimated_value || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}