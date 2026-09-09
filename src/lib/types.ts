export type Format = "Vinil" | "CD";
export type Destino = "colecao" | "wishlist";

// Escala de condição usada por colecionadores (padrão Goldmine/Discogs)
export type Condition =
  | "Lacrado"
  | "Mint (M)"
  | "Near Mint (NM)"
  | "VG+"
  | "VG"
  | "G+"
  | "G"
  | "Regular";

export type Priority = "Baixa" | "Média" | "Alta";

export const CONDITIONS: Condition[] = [
  "Lacrado",
  "Mint (M)",
  "Near Mint (NM)",
  "VG+",
  "VG",
  "G+",
  "G",
  "Regular",
];

export interface Disc {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  genre: string | null;
  format: Format;
  label: string | null;
  catalog_number: string | null;
  cover_url: string | null;
  tracklist: string[] | null;
  discogs_id: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Campos de colecionador
  media_condition: Condition | null;
  sleeve_condition: Condition | null;
  rating: number | null;
  favorite: boolean;
  special_edition: string | null;
  storage_location: string | null;
  purchase_price: number | null;
  purchase_place: string | null;
  purchase_date: string | null;
  estimated_value: number | null;
}

export interface WishlistItem {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  genre: string | null;
  format: Format;
  cover_url: string | null;
  tracklist: string[] | null;
  discogs_id: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  priority: Priority | null;
  max_price: number | null;
}

export interface DiscogsSearchResult {
  id: number;
  title: string;
  year?: string;
  genre?: string[];
  cover_image?: string;
  thumb?: string;
  format?: string[];
  label?: string[];
  catno?: string;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists?: { name: string }[];
  year?: number;
  genres?: string[];
  styles?: string[];
  images?: { uri: string }[];
  labels?: { name: string; catno: string }[];
  tracklist?: { position: string; title: string; duration?: string }[];
  formats?: { name: string }[];
}
