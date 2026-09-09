"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function DiscDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [disc, setDisc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDisc() {
      if (!params.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("discs") // <--- Busca explicitamente na tabela 'discs'
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Erro ao carregar o disco:", error);
      } else {
        setDisc(data);
      }
      setLoading(false);
    }

    fetchDisc();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este disco da sua coleção?")) return;

    const { error } = await supabase
      .from("discs")
      .delete()
      .eq("id", disc.id);

    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-parchment/60">Carregando...</div>;
  }

  if (!disc) {
    return (
      <div className="text-center py-12 text-parchment/60 space-y-4">
        <p>Item não encontrado na sua coleção.</p>
        <Link href="/" className="text-amber-500 hover:underline block">
          ← Voltar para a Coleção
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-parchment/60 hover:text-parchment transition">
          ← Voltar para a Coleção
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/disc/${disc.id}/edit`}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-sm transition font-semibold"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={handleDelete}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm transition font-semibold"
          >
            🗑 Excluir
          </button>
        </div>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
        {disc.cover_url ? (
          <img
            src={disc.cover_url}
            alt={disc.title}
            className="w-full sm:w-64 h-64 object-cover rounded-xl border border-[#3d2d26] flex-shrink-0"
          />
        ) : (
          <div className="w-full sm:w-64 h-64 bg-[#120e0c] border border-[#3d2d26] rounded-xl flex items-center justify-center text-4xl text-amber-500/40 font-bold flex-shrink-0">
            🎵
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-parchment">
              {disc.title}
            </h1>
            <p className="text-lg text-amber-500 font-medium">{disc.artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#120e0c] border border-[#2a1f1a] p-3 rounded-xl">
              <p className="text-xs text-parchment/60">Preço Pago</p>
              <p className="text-lg font-bold text-emerald-400">
                R$ {Number(disc.purchase_price || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#120e0c] border border-[#2a1f1a] p-3 rounded-xl">
              <p className="text-xs text-parchment/60">Valor Estimado</p>
              <p className="text-lg font-bold text-amber-400">
                R$ {Number(disc.estimated_value || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pt-2 border-t border-[#2a1f1a]">
            <div>
              <p className="text-xs text-parchment/50">Ano</p>
              <p className="font-semibold text-parchment">{disc.year || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Formato</p>
              <p className="font-semibold text-parchment">{disc.format || "Vinil"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Gênero</p>
              <p className="font-semibold text-parchment">{disc.genre || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Gravadora</p>
              <p className="font-semibold text-parchment">{disc.label || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Condição</p>
              <p className="font-semibold text-parchment">{disc.media_condition || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Avaliação</p>
              <p className="font-semibold text-parchment">
                {"⭐".repeat(disc.rating || 5)} ({disc.rating || 5}/5)
              </p>
            </div>
          </div>

          {disc.notes && (
            <div className="pt-2 border-t border-[#2a1f1a]">
              <p className="text-xs text-parchment/50 mb-1">Anotações</p>
              <p className="text-sm text-parchment/80 whitespace-pre-line bg-[#120e0c] p-3 rounded-xl border border-[#2a1f1a]">
                {disc.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}