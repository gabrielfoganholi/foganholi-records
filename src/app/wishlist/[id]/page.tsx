"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { WishlistItem } from "@/lib/types";
import DiscForm from "@/components/DiscForm";

export default function WishlistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("wishlist")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        setItem(data as WishlistItem);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <p className="text-sm text-parchment/50">Carregando…</p>;
  if (!item) return <p className="text-sm text-parchment/50">Item não encontrado.</p>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-parchment/50 hover:text-parchment"
      >
        ← Voltar
      </button>
      <h1 className="mb-6 font-display text-2xl text-parchment">Editar item da wishlist</h1>
      <DiscForm
        table="wishlist"
        mode="edit"
        id={item.id}
        initial={{
          title: item.title,
          artist: item.artist,
          year: item.year ? String(item.year) : "",
          genre: item.genre ?? "",
          format: item.format,
          notes: item.notes ?? "",
          tracklist: item.tracklist?.join("\n") ?? "",
          cover_url: item.cover_url ?? "",
          discogs_id: item.discogs_id,
          priority: item.priority ?? "Média",
          max_price: item.max_price ? String(item.max_price) : "",
        }}
      />
    </div>
  );
}
