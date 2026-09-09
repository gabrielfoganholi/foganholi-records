"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DiscForm from "@/components/DiscForm";
import Link from "next/link";

export default function WishlistItemDetails() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchItem = async () => {
    if (!params.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Erro ao buscar item da wishlist:", error);
    } else {
      setItem(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este item da Wishlist?")) return;

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", item.id);

    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      router.push("/wishlist");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-parchment/60">
        Carregando detalhes...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12 text-parchment/60">
        Item não encontrado.
        <br />
        <Link href="/wishlist" className="text-amber-500 hover:underline mt-4 inline-block">
          ← Voltar para Wishlist
        </Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-parchment/60 hover:text-parchment transition"
          >
            ← Cancelar Edição
          </button>
        </div>

        <DiscForm
          mode="edit"
          table="wishlist"
          initialData={item}
          onSuccess={() => {
            setIsEditing(false);
            fetchItem();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/wishlist"
          className="text-sm text-parchment/60 hover:text-parchment transition"
        >
          ← Voltar para Wishlist
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-sm transition font-semibold"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm transition font-semibold"
          >
            🗑 Excluir
          </button>
        </div>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            className="w-full sm:w-64 h-64 object-cover rounded-xl border border-[#3d2d26] flex-shrink-0"
          />
        ) : (
          <div className="w-full sm:w-64 h-64 bg-[#120e0c] border border-[#3d2d26] rounded-xl flex items-center justify-center text-4xl text-amber-500/40 font-bold flex-shrink-0">
            🎵
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Wishlist
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-parchment mt-2">
              {item.title}
            </h1>
            <p className="text-lg text-amber-500 font-medium">{item.artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#120e0c] border border-[#2a1f1a] p-3 rounded-xl">
              <p className="text-xs text-parchment/60">Preço Meta / Compra</p>
              <p className="text-lg font-bold text-emerald-400">
                R$ {Number(item.purchase_price || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#120e0c] border border-[#2a1f1a] p-3 rounded-xl">
              <p className="text-xs text-parchment/60">Valor Estimado de Mercado</p>
              <p className="text-lg font-bold text-amber-400">
                R$ {Number(item.estimated_value || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pt-2 border-t border-[#2a1f1a]">
            <div>
              <p className="text-xs text-parchment/50">Ano</p>
              <p className="font-semibold text-parchment">{item.year || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Formato</p>
              <p className="font-semibold text-parchment">{item.format || "Vinil"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Gênero</p>
              <p className="font-semibold text-parchment">{item.genre || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Gravadora</p>
              <p className="font-semibold text-parchment">{item.label || "N/I"}</p>
            </div>
            <div>
              <p className="text-xs text-parchment/50">Mídia Recomendada</p>
              <p className="font-semibold text-parchment">{item.media_condition || "N/I"}</p>
            </div>
          </div>

          {item.notes && (
            <div className="pt-2 border-t border-[#2a1f1a]">
              <p className="text-xs text-parchment/50 mb-1">Anotações</p>
              <p className="text-sm text-parchment/80 whitespace-pre-line bg-[#120e0c] p-3 rounded-xl border border-[#2a1f1a]">
                {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}