"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DiscDetailPage() {
  const params = useParams();
  const router = useRouter();
  const discId = params?.id as string;

  const [disc, setDisc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingDiscogs, setFetchingDiscogs] = useState(false);

  const fetchDisc = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session) {
      const { data: checkSession } = await supabase.auth.getSession();
      if (!checkSession.session) {
        router.push("/login");
        return;
      }
    }

    if (!discId) return;

    const { data, error } = await supabase
      .from("discs")
      .select("*")
      .eq("id", discId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao carregar disco:", error.message);
    } else if (data) {
      setDisc(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDisc();
  }, [discId, router]);

  const handleFetchDiscogsData = async () => {
    if (!disc?.artist || !disc?.title) {
      alert("É necessário ter Artista e Título cadastrados para buscar no Discogs.");
      return;
    }

    setFetchingDiscogs(true);

    try {
      const query = encodeURIComponent(`${disc.artist} ${disc.title}`);
      const res = await fetch(`/api/discogs/search?q=${query}`);
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
        const match = data.results[0];

        const updatedData = {
          cover_url: match.cover_image || match.thumb || disc.cover_url,
          year: disc.year || (match.year ? parseInt(match.year) : null),
          label: disc.label || (match.label ? match.label[0] : null),
          genre: disc.genre || (match.genre ? match.genre[0] : null),
        };

        const { error } = await supabase
          .from("discs")
          .update(updatedData)
          .eq("id", discId);

        if (!error) {
          await fetchDisc();
        } else {
          alert("Erro ao salvar dados do Discogs: " + error.message);
        }
      } else {
        alert("Nenhum resultado correspondente foi encontrado no Discogs.");
      }
    } catch (err: any) {
      alert("Erro ao consultar a API do Discogs: " + err.message);
    } finally {
      setFetchingDiscogs(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este disco do acervo?")) return;

    const { error } = await supabase.from("discs").delete().eq("id", discId);
    if (!error) {
      router.push("/");
      router.refresh();
    } else {
      alert("Erro ao remover disco: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-amber-500 font-semibold animate-pulse">
          Carregando informações do disco...
        </p>
      </div>
    );
  }

  if (!disc) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-parchment/60">Disco não encontrado ou ID inválido.</p>
        <Link
          href="/"
          className="inline-block bg-amber-500 text-walnut-950 font-bold px-4 py-2 rounded-xl text-xs"
        >
          Voltar para a Coleção
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xs text-parchment/60 hover:text-parchment bg-[#2a1f1a] px-3 py-1.5 rounded-lg transition"
        >
          ← Voltar para a coleção
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/disc/${disc.id}/edit`}
            className="bg-amber-500 hover:bg-amber-400 text-walnut-950 text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={handleDelete}
            className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>

      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl">
        {/* CAPA DO DISCO */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square bg-[#120e0c] rounded-2xl overflow-hidden border border-[#3d2d26] relative flex items-center justify-center">
            {disc.cover_url ? (
              <img
                src={disc.cover_url}
                alt={disc.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl block mb-2">💿</span>
                <p className="text-xs text-parchment/40">Sem capa cadastrada</p>
              </div>
            )}
          </div>

          <button
            onClick={handleFetchDiscogsData}
            disabled={fetchingDiscogs}
            className="w-full bg-[#2a1f1a] hover:bg-[#3d2d26] border border-amber-500/30 text-amber-500 text-xs font-semibold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {fetchingDiscogs ? (
              <span className="animate-pulse">Buscando no Discogs...</span>
            ) : (
              <>🔍 {disc.cover_url ? "Atualizar Capa/Infos" : "Buscar Capa no Discogs"}</>
            )}
          </button>
        </div>

        {/* INFORMAÇÕES DETALHADAS */}
        <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {disc.format || "Vinil"}
              </span>
              {disc.genre && (
                <span className="bg-[#2a1f1a] text-parchment/70 text-xs px-2.5 py-0.5 rounded-md">
                  {disc.genre}
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-3xl text-parchment">
              {disc.title}
            </h1>
            <p className="text-lg font-medium text-amber-500/90">
              {disc.artist}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#120e0c] border border-[#3d2d26] p-4 rounded-2xl text-xs">
            <div>
              <p className="text-parchment/40 font-semibold mb-0.5">Ano</p>
              <p className="text-parchment font-bold">{disc.year || "-"}</p>
            </div>
            <div>
              <p className="text-parchment/40 font-semibold mb-0.5">Gravadora</p>
              <p className="text-parchment font-bold">{disc.label || "-"}</p>
            </div>
            <div>
              <p className="text-parchment/40 font-semibold mb-0.5">Conservação</p>
              <p className="text-parchment font-bold">{disc.media_condition || "-"}</p>
            </div>
            <div>
              <p className="text-parchment/40 font-semibold mb-0.5">Código de Barras</p>
              <p className="text-parchment font-bold">{disc.barcode || "-"}</p>
            </div>
          </div>

          {disc.notes && (
            <div className="bg-[#120e0c] border border-[#3d2d26] p-4 rounded-2xl space-y-1">
              <p className="text-xs text-parchment/40 font-semibold">Observações:</p>
              <p className="text-xs text-parchment/80 leading-relaxed">{disc.notes}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}