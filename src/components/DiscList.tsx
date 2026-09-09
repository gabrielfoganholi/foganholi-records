import DiscCard from "./DiscCard";

interface DiscListProps {
  discs: any[];
}

export default function DiscList({ discs }: DiscListProps) {
  if (!discs || discs.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1c1613] rounded-2xl border border-[#3d2d26]">
        <p className="text-sm text-parchment/60">Nenhum disco encontrado na sua coleção.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {discs.map((disc) => (
        <DiscCard key={disc.id} disc={disc} baseUrl="/disc" />
      ))}
    </div>
  );
}