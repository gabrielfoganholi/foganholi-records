"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function EditDiscPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Campos do formulário
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    year: "",
    genre: "",
    format: "Vinil",
    label: "",
    media_condition: "VG+",
    purchase_price: "",
    estimated_value: "",
    cover_url: "",
    rating: 5,
    notes: "",
  });

  useEffect(() => {
    async function fetchDisc() {
      if (!params?.id) return;
      setLoading(true);

      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);

      const { data, error } = await supabase
        .from("discs")
        .select("*")
        .eq("id", parsedId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar disco para edição:", error);
      } else if (data) {
        setFormData({
          title: data.title || "",
          artist: data.artist || "",
          year: data.year ? String(data.year) : "",
          genre: data.genre || "",
          format: data.format || "Vinil",
          label: data.label || "",
          media_condition: data.media_condition || "VG+",
          purchase_price: data.purchase_price !== null && data.purchase_price !== undefined ? String(data.purchase_price) : "",
          estimated_value: data.estimated_value !== null && data.estimated_value !== undefined ? String(data.estimated_value) : "",
          cover_url: data.cover_url || "",
          rating: data.rating || 5,
          notes: data.notes || "",
        });
      }
      setLoading(false);
    }

    fetchDisc();
  }, [params?.id]);

  // Upload de imagem de capa para o Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setFormData((prev) => ({ ...prev, cover_url: publicUrlData.publicUrl }));
      }
    } catch (err: any) {
      console.error("Erro no upload da imagem:", err);
      alert("Erro ao enviar imagem: " + (err.message || "Tente colar a URL diretamente."));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const parsedId = isNaN(Number(rawId)) ? rawId : Number(rawId);

      const payload = {
        title: formData.title,
        artist: formData.artist,
        year: formData.year ? parseInt(formData.year, 10) : null,
        genre: formData.genre,
        format: formData.format,
        label: formData.label,
        media_condition: formData.media_condition,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
        cover_url: formData.cover_url,
        rating: Number(formData.rating),
        notes: formData.notes,
      };

      const { error } = await supabase
        .from("discs")
        .update(payload)
        .eq("id", parsedId);

      if (error) throw error;

      router.push(`/disc/${parsedId}`);
    } catch (err: any) {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-parchment/60">Carregando dados para edição...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/disc/${params.id}`} className="text-sm text-parchment/60 hover:text-parchment transition">
          ← Voltar ao Disco
        </Link>
        <h1 className="text-xl font-bold font-display text-parchment">Editar Disco</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1c1613] border border-[#3d2d26] p-6 rounded-2xl space-y-4">
        {/* Foto de Capa / Upload */}
        <div>
          <label className="block text-xs font-semibold text-parchment/70 mb-2">Foto da Capa</label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {formData.cover_url ? (
              <img
                src={formData.cover_url}
                alt="Capa"
                className="w-24 h-24 object-cover rounded-xl border border-[#3d2d26]"
              />
            ) : (
              <div className="w-24 h-24 bg-[#120e0c] border border-[#3d2d26] rounded-xl flex items-center justify-center text-2xl">
                🎵
              </div>
            )}
            <div className="flex-1 space-y-2 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="text-xs text-parchment/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
              />
              {uploadingImage && <p className="text-xs text-amber-400">Enviando foto...</p>}
              <input
                type="text"
                placeholder="Ou cole a URL da imagem aqui"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-xs text-parchment focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Título e Artista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Título *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Artista *</label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Preço Pago (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.purchase_price}
              onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">Valor Estimado (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.estimated_value}
              onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Ano, Gênero e Formato */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Ano</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Gênero</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Formato</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            >
              <option value="Vinil">Vinil</option>
              <option value="CD">CD</option>
              <option value="Fita Cassete">Fita Cassete</option>
            </select>
          </div>
        </div>

        {/* Gravadora e Condição */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Gravadora / Selo</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/70 mb-1">Condição Mídia</label>
            <select
              value={formData.media_condition}
              onChange={(e) => setFormData({ ...formData, media_condition: e.target.value })}
              className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50"
            >
              <option value="M">M (Mint / Perfeito)</option>
              <option value="NM">NM (Near Mint / Quase Perfeito)</option>
              <option value="VG+">VG+ (Very Good Plus)</option>
              <option value="VG">VG (Very Good)</option>
              <option value="G+">G+ (Good Plus)</option>
              <option value="F">F (Fair)</option>
              <option value="P">P (Poor)</option>
            </select>
          </div>
        </div>

        {/* Anotações */}
        <div>
          <label className="block text-xs font-semibold text-parchment/70 mb-1">Anotações</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-[#120e0c] border border-[#2a1f1a] rounded-xl px-3 py-2 text-sm text-parchment focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3 rounded-xl transition text-sm shadow-md disabled:opacity-50"
        >
          {saving ? "Salvando Alterações..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}