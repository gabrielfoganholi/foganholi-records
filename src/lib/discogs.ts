import { DiscogsRelease, DiscogsSearchResult } from "./types";

// Estas funções chamam as nossas próprias rotas de API (src/app/api/discogs/...),
// que por sua vez conversam com a API pública do Discogs no servidor.
// Isso mantém o token do Discogs fora do navegador e evita problemas de CORS.

export async function searchDiscogsByText(
  query: string
): Promise<DiscogsSearchResult[]> {
  const res = await fetch(`/api/discogs/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Falha ao buscar no Discogs");
  const data = await res.json();
  return data.results ?? [];
}

export async function searchDiscogsByBarcode(
  barcode: string
): Promise<DiscogsSearchResult[]> {
  const res = await fetch(
    `/api/discogs/barcode?barcode=${encodeURIComponent(barcode)}`
  );
  if (!res.ok) throw new Error("Falha ao buscar por código de barras");
  const data = await res.json();
  return data.results ?? [];
}

export async function getDiscogsRelease(
  id: number
): Promise<DiscogsRelease | null> {
  const res = await fetch(`/api/discogs/release/${id}`);
  if (!res.ok) return null;
  return res.json();
}
