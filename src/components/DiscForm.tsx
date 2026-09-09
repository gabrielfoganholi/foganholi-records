"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  searchDiscogsByText,
  searchDiscogsByBarcode,
  getDiscogsRelease,
} from "@/lib/discogs";
import { CONDITIONS, DiscogsSearchResult, Format } from "@/lib/types";
import BarcodeScanner from "./BarcodeScanner";
import StarRating from "./StarRating";

interface FormState {
  title: string;
  artist: string;
  year: string;
  genre: string;
  format: Format;
  label: string;
  catalog_number: string;
  notes: string;
  tracklist: string;
  cover_url: string;
  discogs_id: number | null;
  // colecionador — coleção
  media_condition: string;
  sleeve_condition: string;
  rating: number;
  favorite: boolean;
  special_edition: string;
  storage_location: string;
  purchase_price: string;
  purchase_place: string;
  purchase_date: string;
  estimated_value: string;
  // colecionador — wishlist
  priority: string;
  max_price: string;
}

interface Props {
  table: "discs" | "wishlist";
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<FormState>;
  onDeleted?: () => void;
}

const emptyForm: FormState = {
  title: "",
  artist: "",
  year: "",
  genre: "",
  format: "Vinil",
  label: "",
  catalog_number: "",
  notes: "",
  tracklist: "",
  cover_url: "",
  discogs_id: null,
  media_condition: "",
  sleeve_condition: "",
  rating: 0,
  favorite: false,
  special_edition: "",
  storage_location: "",
  purchase_price: "",
  purchase_place: "",
  purchase_date: "",
  estimated_value: "",
  priority: "Média",
  max_price: "",
};

interface DuplicateHit {
  id: string;
  title: string;
  artist: string;
}

export default function DiscForm({ table, mode, id, initial, onDeleted }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({ ...emptyForm, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscogsSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const [duplicate, setDuplicate] = useState<DuplicateHit | null>(null);
  const [duplicateChecked, setDuplicateChecked] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "title" || key === "artist") {
      setDuplicateChecked(false);
      setDuplicate(null);
    }
  }

  async function runTextSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const r = await searchDiscogsByText(query);
      setResults(r);
    } catch (e) {
      setError("Não foi possível buscar no Discogs. Verifique o DISCOGS_TOKEN no servidor.");
    } finally {
      setSearching(false);
    }
  }

  async function pickResult(result: DiscogsSearchResult) {
    setSearching(true);
    try {
      const release = await getDiscogsRelease(result.id);
      if (release) {
        setForm((f) => ({
          ...f,
          title: release.title?.split(" - ").slice(-1)[0] ?? result.title,
          artist:
            release.artists?.map((a) => a.name).join(", ") ??
            result.title?.split(" - ")[0] ??
            f.artist,
          year: release.year ? String(release.year) : f.year,
          genre: release.genres?.[0] ?? release.styles?.[0] ?? f.genre,
          label: release.labels?.[0]?.name ?? f.label,
          catalog_number: release.labels?.[0]?.catno ?? f.catalog_number,
          cover_url: release.images?.[0]?.uri ?? result.cover_image ?? f.cover_url,
          tracklist:
            release.tracklist
              ?.map((t) => t.title)
              .filter(Boolean)
              .join("\n") ?? f.tracklist,
          discogs_id: release.id,
        }));
        setDuplicateChecked(false);
      }
    } finally {
      setSearching(false);
      setShowSearch(false);
      setResults([]);
      setQuery("");
    }
  }

  async function handleBarcodeDetected(code: string) {
    setShowScanner(false);
    setScanMessage("Buscando pelo código de barras…");
    try {
      const r = await searchDiscogsByBarcode(code);
      if (r.length === 0) {
        setScanMessage(
          `Nenhum resultado para o código ${code}. Tente a busca por texto.`
        );
      } else {
        setScanMessage(null);
        setResults(r);
        setShowSearch(true);
      }
    } catch {
      setScanMessage("Erro ao consultar o Discogs pelo código de barras.");
    }
  }

  async function handleCoverUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user?.id ?? "anon"}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      update("cover_url", data.publicUrl);
    } catch (e) {
      setError("Falha ao enviar a foto da capa. Verifique se o bucket 'covers' existe e é público.");
    } finally {
      setUploading(false);
    }
  }

  async function checkDuplicate(): Promise<boolean> {
    if (table !== "discs" || mode !== "create") return false;
    const { data } = await supabase
      .from("discs")
      .select("id, title, artist")
      .ilike("artist", form.artist.trim())
      .ilike("title", form.title.trim())
      .limit(1);
    if (data && data.length > 0) {
      setDuplicate(data[0] as DuplicateHit);
      return true;
    }
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) {
      setError("Preencha ao menos título e artista.");
      return;
    }
    setError(null);

    if (!duplicateChecked) {
      setDuplicateChecked(true);
      const hasDuplicate = await checkDuplicate();
      if (hasDuplicate) return; // mostra o aviso e espera confirmação
    }

    setSaving(true);

    const num = (v: string) => (v.trim() ? parseFloat(v.replace(",", ".")) : null);

    const payload = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      year: form.year ? parseInt(form.year, 10) : null,
      genre: form.genre.trim() || null,
      format: form.format,
      cover_url: form.cover_url || null,
      notes: form.notes.trim() || null,
      discogs_id: form.discogs_id,
      tracklist: form.tracklist
        ? form.tracklist.split("\n").map((t) => t.trim()).filter(Boolean)
        : null,
      ...(table === "discs"
        ? {
            label: form.label.trim() || null,
            catalog_number: form.catalog_number.trim() || null,
            media_condition: form.media_condition || null,
            sleeve_condition: form.sleeve_condition || null,
            rating: form.rating || null,
            favorite: form.favorite,
            special_edition: form.special_edition.trim() || null,
            storage_location: form.storage_location.trim() || null,
            purchase_price: num(form.purchase_price),
            purchase_place: form.purchase_place.trim() || null,
            purchase_date: form.purchase_date || null,
            estimated_value: num(form.estimated_value),
          }
        : {
            priority: form.priority || "Média",
            max_price: num(form.max_price),
          }),
    };

    try {
      if (mode === "create") {
        const { data, error: insertError } = await supabase
          .from(table)
          .insert({ ...payload, created_by: user?.id })
          .select("id")
          .single();
        if (insertError) throw insertError;
        router.push(table === "discs" ? `/discs/${data.id}` : `/wishlist`);
      } else if (id) {
        const { error: updateError } = await supabase
          .from(table)
          .update(payload)
          .eq("id", id);
        if (updateError) throw updateError;
        router.push(table === "discs" ? `/discs/${id}` : `/wishlist`);
      }
      router.refresh();
    } catch (e) {
      setError("Não foi possível salvar. Confira a configuração do Supabase.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Remover este item definitivamente?")) return;
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
    if (!deleteError) {
      onDeleted?.();
      router.push(table === "discs" ? "/" : "/wishlist");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:flex-row">
      {/* Coluna da capa */}
      <div className="flex flex-col items-center gap-3 sm:w-52">
        <div className="aspect-square w-full overflow-hidden rounded-lg border border-walnut-700 bg-walnut-900">
          {form.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_url} alt="Capa" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-parchment/30">
              Sem capa
            </div>
          )}
        </div>
        <label className="w-full cursor-pointer rounded-md border border-walnut-700 px-3 py-2 text-center text-sm text-parchment hover:bg-walnut-800">
          {uploading ? "Enviando…" : "Tirar/enviar foto da capa"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
          />
        </label>

        {table === "discs" && (
          <button
            type="button"
            onClick={() => update("favorite", !form.favorite)}
            className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm ${
              form.favorite
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-walnut-700 text-parchment/60 hover:text-parchment"
            }`}
          >
            <svg viewBox="0 0 20 20" className={`h-4 w-4 ${form.favorite ? "fill-amber-400" : "fill-none stroke-current stroke-[1.5]"}`}>
              <path d="M10 3.5c1.4-2 5.6-1.8 5.6 2 0 3-3 5.4-5.6 8-2.6-2.6-5.6-5-5.6-8 0-3.8 4.2-4 5.6-2z" />
            </svg>
            {form.favorite ? "Favorito" : "Marcar como favorito"}
          </button>
        )}

        {table === "discs" && (
          <div className="flex w-full flex-col items-center gap-1 rounded-md border border-walnut-700 py-2">
            <span className="text-xs text-parchment/50">Sua avaliação</span>
            <StarRating value={form.rating} onChange={(v) => update("rating", v)} />
          </div>
        )}
      </div>

      {/* Coluna dos campos */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-walnut-950 hover:bg-amber-400"
          >
            Buscar dados no Discogs
          </button>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="rounded-md border border-walnut-700 px-3 py-2 text-sm text-parchment hover:bg-walnut-800"
          >
            Escanear código de barras
          </button>
        </div>
        {scanMessage && <p className="text-sm text-parchment/60">{scanMessage}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Título *">
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Artista *">
            <input
              value={form.artist}
              onChange={(e) => update("artist", e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Ano">
            <input
              value={form.year}
              onChange={(e) => update("year", e.target.value.replace(/\D/g, ""))}
              className="input"
              inputMode="numeric"
            />
          </Field>
          <Field label="Gênero">
            <input
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Formato">
            <select
              value={form.format}
              onChange={(e) => update("format", e.target.value as Format)}
              className="input"
            >
              <option value="Vinil">Vinil</option>
              <option value="CD">CD</option>
            </select>
          </Field>
          {table === "discs" && (
            <>
              <Field label="Selo">
                <input
                  value={form.label}
                  onChange={(e) => update("label", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Número de catálogo">
                <input
                  value={form.catalog_number}
                  onChange={(e) => update("catalog_number", e.target.value)}
                  className="input"
                />
              </Field>
            </>
          )}
          {table === "wishlist" && (
            <>
              <Field label="Prioridade">
                <select
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                  className="input"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </Field>
              <Field label="Topo pagar até (R$)">
                <input
                  value={form.max_price}
                  onChange={(e) => update("max_price", e.target.value)}
                  className="input"
                  inputMode="decimal"
                  placeholder="Ex: 120,00"
                />
              </Field>
            </>
          )}
        </div>

        <Field label="Faixas (uma por linha)">
          <textarea
            value={form.tracklist}
            onChange={(e) => update("tracklist", e.target.value)}
            rows={5}
            className="input font-mono text-sm"
          />
        </Field>

        <Field label="Notas">
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            className="input"
          />
        </Field>

        {table === "discs" && (
          <details className="rounded-md border border-walnut-700 p-3" open={mode === "edit"}>
            <summary className="cursor-pointer text-sm text-parchment/80">
              Detalhes de colecionador (condição, valor, edição)
            </summary>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Condição da mídia (disco)">
                <select
                  value={form.media_condition}
                  onChange={(e) => update("media_condition", e.target.value)}
                  className="input"
                >
                  <option value="">Não avaliado</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Condição da capa">
                <select
                  value={form.sleeve_condition}
                  onChange={(e) => update("sleeve_condition", e.target.value)}
                  className="input"
                >
                  <option value="">Não avaliado</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Edição especial">
                <input
                  value={form.special_edition}
                  onChange={(e) => update("special_edition", e.target.value)}
                  className="input"
                  placeholder="Ex: Vinil colorido, numerado 234/500"
                />
              </Field>
              <Field label="Local de guarda">
                <input
                  value={form.storage_location}
                  onChange={(e) => update("storage_location", e.target.value)}
                  className="input"
                  placeholder="Ex: Estante 2, caixa B"
                />
              </Field>
              <Field label="Preço pago (R$)">
                <input
                  value={form.purchase_price}
                  onChange={(e) => update("purchase_price", e.target.value)}
                  className="input"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Onde comprou">
                <input
                  value={form.purchase_place}
                  onChange={(e) => update("purchase_place", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Data da compra">
                <input
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => update("purchase_date", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Valor estimado hoje (R$)">
                <input
                  value={form.estimated_value}
                  onChange={(e) => update("estimated_value", e.target.value)}
                  className="input"
                  inputMode="decimal"
                />
              </Field>
            </div>
          </details>
        )}

        {duplicate && (
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-400">
            Você já tem <strong>{duplicate.title}</strong> de {duplicate.artist} na coleção.
            Clique em "Salvar mesmo assim" se quiser cadastrar outra cópia.
          </div>
        )}

        {error && <p className="text-sm text-rust">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-amber-500 px-5 py-2 text-sm font-medium text-walnut-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {saving
              ? "Salvando…"
              : duplicate
              ? "Salvar mesmo assim"
              : mode === "create"
              ? "Salvar"
              : "Salvar alterações"}
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-rust/50 px-4 py-2 text-sm text-rust hover:bg-rust/10"
            >
              Excluir
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-walnut-950/90 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-lg border border-walnut-700 bg-walnut-900 p-4">
            <div className="mb-3 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runTextSearch())}
                placeholder="Ex: Chico Buarque Construção 1971"
                className="input flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={runTextSearch}
                className="rounded-md bg-amber-500 px-3 text-sm font-medium text-walnut-950"
              >
                Buscar
              </button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {searching && <p className="text-sm text-parchment/60">Buscando…</p>}
              {!searching && results.length === 0 && (
                <p className="text-sm text-parchment/40">Nenhum resultado ainda.</p>
              )}
              {results.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => pickResult(r)}
                  className="flex w-full items-center gap-3 rounded-md border border-walnut-700 p-2 text-left hover:border-amber-500/60"
                >
                  {r.thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt="" className="h-12 w-12 rounded object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-parchment">{r.title}</p>
                    <p className="text-xs text-parchment/50">
                      {r.year ?? "—"} {r.format?.[0] ? `· ${r.format[0]}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="mt-3 w-full rounded-md border border-walnut-700 py-2 text-sm text-parchment hover:bg-walnut-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-parchment/50">{label}</span>
      {children}
    </label>
  );
}
