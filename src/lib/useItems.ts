"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { Disc, WishlistItem } from "./types";

export function useItems<T extends Disc | WishlistItem>(table: "discs" | "wishlist") {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as T[]);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const artists = useMemo(
    () => Array.from(new Set(items.map((i) => i.artist))).sort(),
    [items]
  );
  const genres = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.genre).filter(Boolean) as string[])).sort(),
    [items]
  );

  return { items, loading, refresh, artists, genres };
}
