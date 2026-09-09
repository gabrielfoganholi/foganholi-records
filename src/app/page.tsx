"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DiscList from "@/components/DiscList";

export default function HomePage() {
  const [discs, setDiscs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalSpent = discs.reduce((acc, curr) => acc + (Number(curr.purchase_price) || 0), 0);
  const totalEstimated = discs.reduce((acc, curr) => acc + (Number(curr.estimated_value) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1c1613] p-6 rounded-2xl border border-[#3d2d26]">
        <div>
          <h1 className="text-2xl font-display font-bold text-parchment">Minha Coleção</h1>
          <p className="text-xs text-parchment/60 mt-1">
            Total: <span className="text-amber-500 font-bold">{discs.length} discos</span>
            {totalSpent > 0 && (
              <span> • Investido: <span className="text-emerald-400 font-bold">R$ {totalSpent.toFixed(2)}</span></span>
            )}
            {totalEstimated > 0 && (
              <span> • Est. Mercado: <span className="text-amber-400 font-bold">R$ {totalEstimated.toFixed(2)}</span></span>
            )}
          </p>
        </div>
        <Link
          href="/disc/new"
          className="bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold px-4 py-2.5 rounded-xl text-sm transition text-center shadow-md"
        >
          + Adicionar Disco
        </Link>
      </div>

      {/* Lista da Coleção */}
      {loading ? (
        <p className="text-center py-12 text-sm text-parchment/60">Carregando sua coleção...</p>
      ) : (
        <DiscList discs={discs} />
      )}
    </div>
  );
}