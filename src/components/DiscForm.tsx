"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface DiscFormProps {
  initialData?: any;
  mode?: "create" | "edit";
  table?: "discs" | "wishlist";
  onSuccess?: () => void;
}

export default function DiscForm({
  initialData,
  mode = "create",
  table = "discs",
  onSuccess,
}: DiscFormProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Estados do Formulário
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [year, setYear] = useState(initialData?.year || "");
  const [genre, setGenre] = useState(initialData?.genre || "");
  const [format, setFormat] = useState(initialData?.format || "Vinil");
  const [label, setLabel] = useState(initialData?.label || "");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || "");
  const [discogsId, setDiscogsId] = useState(initialData?.discogs_id || "");
  const [mediaCondition, setMediaCondition] = useState(
    initialData?.media_condition || "VG+"
  );
  const [rating, setRating] = useState(
    initialData?.rating ? String(initialData.rating) : "5"
  );
  const [purchasePrice, setPurchasePrice] = useState(
    initialData?.purchase_price || ""
  );
  const [estimatedValue, setEstimatedValue] = useState(
    initialData?.estimated_value || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [loading, setLoading] = useState(false);

  // Busca na API do Discogs
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);

    try {
      const res = await fetch(
        `/api/discogs/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Erro na busca:", err);
    } finally {
      setSearching(false);
    }
  };

  // Seleciona o disco do Discogs e preenche os campos do formulário
  const handleSelectDisc = async (item: any) => {
    let itemTitle = item.title || "";
    let itemArtist = "";

    if (itemTitle.includes(" - ")) {
      const parts = itemTitle.split(" - ");
      itemArtist = parts[0].trim();
      itemTitle = parts.slice(1).join(" - ").trim();
    }

    setTitle(itemTitle);
    setArtist(itemArtist);
    setYear(item.year || "");
    setGenre(item.genre?.[0] || item.style?.[0] || "");
    setCoverUrl(item.cover_image || item.thumb || "");
    setDiscogsId(item.id?.toString() || "");
    setLabel(item.label?.[0] || "");

    if (item.barcode && item.barcode.length > 0) {
      setBarcode(item.barcode[0]);
    }

    setShowSearch(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const targetTable = table || "discs";

    const payload: Record<string, any> = {
      title,
      artist,
      year: year ? parseInt(String(year)) : null,
      genre: genre || null,
      format: format || "Vinil",
      label: label || null,
      barcode: barcode || null,
      cover_url: coverUrl || null,
      discogs_id: discogsId || null,
      media_condition: mediaCondition || null,
      rating: rating ? parseInt(rating) : 5,
      purchase_price: purchasePrice ? parseFloat(String(purchasePrice)) : 0,
      estimated_value: estimatedValue ? parseFloat(String(estimatedValue)) : 0,
      notes: notes || null,
    };

    try {
      if (mode === "edit" && initialData?.id) {
        const { error } = await supabase
          .from(targetTable)
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from(targetTable).insert([payload]);
        if (error) throw error;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(targetTable === "wishlist" ? "/wishlist" : "/");
        router.refresh();
      }
    } catch (err: any) {
      alert("Erro ao salvar no banco de dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Botões de Busca Externa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
        >
          🔍 Buscar dados no Discogs
        </button>
        <button
          type="button"
          onClick={() => {
            const code = prompt("Digite ou escaneie o código de barras:");
            if (code) {
              setBarcode(code);
              setQuery(code);
              setShowSearch(true);
            }
          }}
          className="bg-[#2a1f1a] hover:bg-[#3d2d26] text-parchment border border-[#3d2d26] font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2"
        >
          📷 Buscar por Código de Barras
        </button>
      </div>

      {/* Modal do Discogs */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#2a1f1a] pb-3">
              <h3 className="font-display font-bold text-parchment text-lg">
                Buscar no Discogs
              </h3>
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="text-parchment/60 hover:text-parchment text-sm px-3 py-1 rounded-lg bg-[#120e0c]"
              >
                Fechar ✕
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Raul Seixas, Dark Side of the Moon..."
                className="flex-1 bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
              >
                {searching ? "Buscando..." : "Buscar"}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectDisc(item)}
                  className="flex items-center gap-4 bg-[#120e0c] border border-[#2a1f1a] hover:border-amber-500 p-3 rounded-xl transition cursor-pointer group"
                >
                  <img
                    src={item.cover_image || item.thumb || "/placeholder.png"}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg bg-[#1c1613] flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-parchment group-hover:text-amber-400 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-parchment/60 truncate mt-0.5">
                      {item.year || "Ano N/I"} •{" "}
                      {item.format?.join(", ") || "Formato N/I"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs bg-amber-500 text-walnut-950 font-bold px-3 py-1.5 rounded-lg group-hover:bg-amber-400 transition"
                  >
                    Selecionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulário do Disco */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1c1613] border border-[#3d2d26] p-6 rounded-2xl space-y-5 shadow-xl"
      >
        <h2 className="font-display font-bold text-parchment text-lg border-b border-[#2a1f1a] pb-3">
          {table === "wishlist"
            ? mode === "edit"
              ? "Editar Item da Wishlist"
              : "Adicionar Item à Wishlist"
            : mode === "edit"
            ? "Editar Disco da Coleção"
            : "Cadastrar Disco na Coleção"}
        </h2>

        {coverUrl && (
          <div className="flex items-center gap-4 bg-[#120e0c] p-3 rounded-xl border border-[#2a1f1a]">
            <img
              src={coverUrl}
              alt="Capa"
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="text-xs text-parchment/70 flex-1 truncate">
              <p className="font-semibold text-parchment">Capa Selecionada</p>
              <p className="truncate text-parchment/50">{coverUrl}</p>
            </div>
            <button
              type="button"
              onClick={() => setCoverUrl("")}
              className="text-xs text-rose-400 hover:underline px-2 py-1"
            >
              Remover
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Título do Disco *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Artista / Banda *
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Ano de Lançamento
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Formato
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            >
              <option value="Vinil">Vinil / LP</option>
              <option value="CD">CD</option>
              <option value="K7">Fita Cassete</option>
              <option value="Digital">Digital</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Gênero
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Gravadora / Selo
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Código de Barras
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* VALORES FINANCEIROS (MERCADO E COMPRA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#120e0c] p-4 rounded-xl border border-[#2a1f1a]">
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              {table === "wishlist"
                ? "Preço Esperado / Compra (R$)"
                : "Valor Pago / Compra (R$)"}
            </label>
            <input
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1c1613] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              Valor Estimado de Mercado (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1c1613] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Conservação da Mídia
            </label>
            <select
              value={mediaCondition}
              onChange={(e) => setMediaCondition(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            >
              <option value="Mint (M)">Mint (M) - Novo / Perfeito</option>
              <option value="Near Mint (NM)">Near Mint (NM) - Quase Novo</option>
              <option value="Very Good Plus (VG+)">
                Very Good Plus (VG+) - Excelente
              </option>
              <option value="Very Good (VG)">
                Very Good (VG) - Bom Estado
              </option>
              <option value="Good (G)">Good (G) - Marcas Visíveis</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">
              Sua Avaliação (1 a 5 estrelas)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-3 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            >
              <option value="5">★★★★★ (5/5)</option>
              <option value="4">★★★★☆ (4/5)</option>
              <option value="3">★★★☆☆ (3/5)</option>
              <option value="2">★★☆☆☆ (2/5)</option>
              <option value="1">★☆☆☆☆ (1/5)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-parchment/80 mb-1">
            Anotações e Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Edição especial, local onde comprou, conservação da capa..."
            className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-50"
        >
          {loading
            ? "Salvando..."
            : table === "wishlist"
            ? mode === "edit"
              ? "Salvar Alterações na Wishlist"
              : "Adicionar à Wishlist"
            : mode === "edit"
            ? "Salvar Alterações na Coleção"
            : "Salvar Disco na Coleção"}
        </button>
      </form>
    </div>
  );
}