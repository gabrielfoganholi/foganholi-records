"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DiscCard from "@/components/DiscCard";

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
          {items.map((item) => (
            <DiscCard key={item.id} disc={item} baseUrl="/wishlist" />
          ))}
        </div>
      )}
    </div>
  );
}