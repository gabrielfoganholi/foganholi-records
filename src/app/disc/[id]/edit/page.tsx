"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditDiscPage() {
  const router = useRouter();
  const params = useParams();
  const discId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    genre: "",
    format: "Vinil",
    year: "",
    label: "",
    cover_url: "",
    is_favorite: false,
  });

  useEffect(() => {
    const fetchDisc = async () => {
      const { data, error } = await supabase
        .from("discs")
        .select("*")
        .eq("id", discId)
        .single();

      if (!error && data) {
        setFormData({
          title: data.title || "",
          artist: data.artist || "",
          genre: data.genre || "",
          format: data.format || "Vinil",
          year: data.year ? String(data.year) : "",
          label: data.label || "",
          cover_url: data.cover_url || "",
          is_favorite: data.is_favorite || false,
        });
      }
      setLoading(false);
    };

    if (discId) fetchDisc();
  }, [discId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("discs")
      .update({
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
      })
      .eq("id", discId);

    setSaving(false);

    if (!error) {
      router.push("/");
      router.refresh();
    } else {
      alert("Erro ao salvar alterações: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-amber-500 font-semibold animate-pulse">Carregando dados do disco...</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-parchment">Editar Cadastro</h1>
          <button
            onClick={() => router.back()}
            className="text-xs text-parchment/60 hover:text-parchment bg-[#2a1f1a] px-3 py-1.5 rounded-lg"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-parchment/80 mb-1">Título do Álbum</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment/80 mb-1">Banda / Artista</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment/80 mb-1">Gênero (Digite ou altere livremente)</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Ex: Rock, MPB, Jazz..."
                className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment/80 mb-1">Formato</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              >
                <option value="Vinil">Vinil</option>
                <option value="CD">CD</option>
                <option value="K7">K7</option>
                <option value="Digital">Digital</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment/80 mb-1">Ano de Lançamento</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment/80 mb-1">Gravadora / Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">URL da Capa (Imagem)</label>
            <input
              type="text"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_favorite"
              checked={formData.is_favorite}
              onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="is_favorite" className="text-sm font-semibold text-parchment cursor-pointer">
              Markar como Favorito ⭐
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-50 mt-4"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </main>
  );
}