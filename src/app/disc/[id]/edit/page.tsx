"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function DiscDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [disc, setDisc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingCover, setUpdatingCover] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDisc() {
      if (!params?.id) return;
      setLoading(true);
      setErrorMsg(null);

      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);

      const { data, error } = await supabase
        .from("discs")
        .select("*")
        .eq("id", parsedId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar disco na coleção:", error);
        setErrorMsg(error.message);
      } else {
        setDisc(data);
      }
      setLoading(false);
    }

    fetchDisc();
  }, [params?.id]);

  // Atualiza a URL da capa no Supabase
  const updateCoverUrlInDb = async (newCoverUrl: string) => {
    if (!disc) return;
    setUpdatingCover(true);

    try {
      const { error } = await supabase
        .from("discs")
        .update({ cover_url: newCoverUrl })
        .eq("id", disc.id);

      if (error) throw error;

      setDisc((prev: any) => ({ ...prev, cover_url: newCoverUrl }));
    } catch (err: any) {
      alert("Erro ao atualizar a capa: " + err.message);
    } finally {
      setUpdatingCover(false);
    }
  };

  // 1. Busca Capa no Discogs
  const handleFetchCoverFromDiscogs = async () => {
    if (!disc?.title || !disc?.artist) return;
    setUpdatingCover(true);

    try {
      const query = encodeURIComponent(`${disc.artist} ${disc.title}`);
      const response = await fetch(
        `https://api.discogs.com/database/search?q=${query}&type=release&per_page=1`,
        {
          headers: {
            "User-Agent": "FoganholiRecords/1.0",
          },
        }
      );

      const data = await response.json();
      const foundCover = data.results?.[0]?.cover_image || data.results?.[0]?.thumb;

      if (foundCover) {
        await updateCoverUrlInDb(foundCover);
      } else {
        alert("Nenhuma imagem encontrada no Discogs para este título e artista.");
      }
    } catch (err: any) {
      console.error("Erro ao buscar capa no Discogs:", err);
      alert("Erro ao consultar o Discogs.");
    } finally {
      setUpdatingCover(false);
    }
  };

  // 2. Upload de Imagem da Galeria
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !disc) return;

    setUpdatingCover(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        await updateCoverUrlInDb(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      console.error("Erro no upload da imagem:", err);
      alert("Erro ao enviar imagem: " + err.message);
    } finally {
      setUpdatingCover(false);
    }
  };

  const handleDelete = async () => {
    if (!disc) return;
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
    return <div className="text-center py-12 text-parchment/60">Carregando informações do disco...</div>;
  }

  if (!disc) {
    return (
      <div className="text-center py-12 text-parchment/60 space-y-4">
        <p className="text-lg font-semibold text-rose-400">Item não encontrado na sua coleção.</p>
        {errorMsg && <p className="text-xs text-parchment/40">Detalhes: {errorMsg}</p>}
        <Link href="/" className="text-amber-500 hover:underline block font-medium">
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
        {/* Foto de Capa + Ações quando não há foto */}
        <div className="flex flex-col items-center gap-3 w-full sm:w-64 flex-shrink-0">
          {disc.cover_url ? (
            <img
              src={disc.cover_url}
              alt={disc.title}
              className="w-full sm:w-64 h-64 object-cover rounded-xl border border-[#3d2d26]"
            />
          ) : (
            <div className="w-full h-64 bg-[#120e0c] border border-[#3d2d26] rounded-xl flex items-center justify-center text-4xl text-amber-500/40 font-bold">
              🎵
            </div>
          )}

          {/* Botões para Atualizar Capa */}
          <div className="w-full space-y-2">
            <button
              onClick={handleFetchCoverFromDiscogs}
              disabled={updatingCover}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold py-2 px-3 rounded-xl transition text-center disabled:opacity-50"
            >
              {updatingCover ? "Buscando..." : "🔍 Puxar Capa do Discogs"}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={updatingCover}
              className="w-full bg-[#120e0c] hover:bg-[#1f1714] text-parchment/80 border border-[#2a1f1a] text-xs font-semibold py-2 px-3 rounded-xl transition text-center disabled:opacity-50"
            >
              🖼️ Escolher da Galeria
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleGalleryImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Na Coleção
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-parchment mt-2">
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