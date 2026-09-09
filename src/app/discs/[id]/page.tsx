"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Disc } from "@/lib/types";
import DiscForm from "@/components/DiscForm";
import StarRating from "@/components/StarRating";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DiscDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [disc, setDisc] = useState<Disc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("discs")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        setDisc(data as Disc);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <p className="text-sm text-parchment/50">Carregando…</p>;
  if (!disc) return <p className="text-sm text-parchment/50">Disco não encontrado.</p>;

  const hasCollectorInfo =
    disc.media_condition ||
    disc.sleeve_condition ||
    disc.special_edition ||
    disc.storage_location ||
    disc.estimated_value ||
    disc.purchase_price;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-parchment/50 hover:text-parchment"
      >
        ← Voltar
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-parchment">Editar disco</h1>
        <div className="flex items-center gap-3">
          {disc.favorite && (
            <span className="flex items-center gap-1 text-sm text-amber-400">
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-amber-400">
                <path d="M10 3.5c1.4-2 5.6-1.8 5.6 2 0 3-3 5.4-5.6 8-2.6-2.6-5.6-5-5.6-8 0-3.8 4.2-4 5.6-2z" />
              </svg>
              Favorito
            </span>
          )}
          <StarRating value={disc.rating} />
        </div>
      </div>

      {hasCollectorInfo && (
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          {disc.media_condition && (
            <span className="rounded-full border border-walnut-700 px-3 py-1 text-parchment/70">
              Mídia: {disc.media_condition}
            </span>
          )}
          {disc.sleeve_condition && (
            <span className="rounded-full border border-walnut-700 px-3 py-1 text-parchment/70">
              Capa: {disc.sleeve_condition}
            </span>
          )}
          {disc.special_edition && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-400">
              {disc.special_edition}
            </span>
          )}
          {disc.storage_location && (
            <span className="rounded-full border border-walnut-700 px-3 py-1 text-parchment/70">
              📍 {disc.storage_location}
            </span>
          )}
          {disc.estimated_value && (
            <span className="rounded-full border border-sage-500/40 bg-sage-500/10 px-3 py-1 text-sage-400">
              Valor estimado: {formatBRL(disc.estimated_value)}
            </span>
          )}
        </div>
      )}

      <DiscForm
        table="discs"
        mode="edit"
        id={disc.id}
        initial={{
          title: disc.title,
          artist: disc.artist,
          year: disc.year ? String(disc.year) : "",
          genre: disc.genre ?? "",
          format: disc.format,
          label: disc.label ?? "",
          catalog_number: disc.catalog_number ?? "",
          notes: disc.notes ?? "",
          tracklist: disc.tracklist?.join("\n") ?? "",
          cover_url: disc.cover_url ?? "",
          discogs_id: disc.discogs_id,
          media_condition: disc.media_condition ?? "",
          sleeve_condition: disc.sleeve_condition ?? "",
          rating: disc.rating ?? 0,
          favorite: disc.favorite,
          special_edition: disc.special_edition ?? "",
          storage_location: disc.storage_location ?? "",
          purchase_price: disc.purchase_price ? String(disc.purchase_price) : "",
          purchase_place: disc.purchase_place ?? "",
          purchase_date: disc.purchase_date ?? "",
          estimated_value: disc.estimated_value ? String(disc.estimated_value) : "",
        }}
      />
    </div>
  );
}
