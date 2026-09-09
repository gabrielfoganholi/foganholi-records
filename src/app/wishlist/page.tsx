"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar wishlist:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Remover este item da sua lista de desejos?")) return;
    try {
      const { error } = await supabase.from("wishlist").delete().eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert("Erro ao deletar: " + err.message);
    }
  };

  const totalTarget = items.reduce((acc, curr) => acc + (Number(curr.purchase_price) || 0), 0);
  const totalEstimated = items.reduce((acc, curr) => acc + (Number(curr.estimated_value) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1c1613] p-6 rounded-2xl border border-[#3d2d26]">
        <div>
          <h1 className="text-2xl font-display font-bold text-parchment">Wishlist / Lista de Desejos</h1>
          <p className="text-xs text-parchment/60 mt-1">
            Total na lista: <span className="text-amber-500 font-bold">{items.length} discos</span>
            {totalTarget > 0 && (
              <span> • Meta Total: <span className="text-emerald-400 font-bold">R$ {totalTarget.toFixed(2)}</span></span>
            )}
            {totalEstimated > 0 && (
              <span> • Est. Mercado: <span className="text-amber-400 font-bold">R$ {totalEstimated.toFixed(2)}</span></span>
            )}
          </p>
        </div>
        <Link
          href="/wishlist/new"
          className="bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold px-4 py-2.5 rounded-xl text-sm transition text-center shadow-md"
        >
          + Adicionar à Wishlist
        </Link>
      </div>

      {loading ? (
        <p className="text-center py-12 text-sm text-parchment/60">Carregando sua lista de desejos...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-[#1c1613] rounded-2xl border border-[#3d2d26] space-y-3">
          <p className="text-4xl">🖤</p>
          <p className="text-sm text-parchment/70">Sua Lista de Desejos está vazia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((disc) => (
            <div
              key={disc.id}
              className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition group"
            >
              <Link href={`/wishlist/${disc.id}`} className="space-y-3 block">
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

              <div className="mt-4 pt-3 border-t border-[#2a1f1a] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-semibold">
                    Meta: R$ {Number(disc.purchase_price || 0).toFixed(2)}
                  </span>
                  <span className="text-amber-400 font-semibold">
                    Val: R$ {Number(disc.estimated_value || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Link
                    href={`/wishlist/${disc.id}`}
                    className="text-xs text-amber-500 hover:underline px-2 py-1"
                  >
                    Ver detalhes
                  </Link>
                  <button
                    onClick={() => handleDelete(disc.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-950 transition"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}