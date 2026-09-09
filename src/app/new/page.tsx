"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import DiscForm from "@/components/DiscForm";

function NewItemForm() {
  const searchParams = useSearchParams();
  const initialDestino = searchParams.get("destino") === "wishlist" ? "wishlist" : "discs";
  const [table, setTable] = useState<"discs" | "wishlist">(initialDestino);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl text-parchment">Adicionar</h1>
      <p className="mb-6 text-sm text-parchment/50">
        Preencha manualmente, busque no Discogs pelo título ou escaneie o código de barras do disco.
      </p>

      <div className="mb-6 flex gap-1 rounded-md border border-walnut-700 p-0.5 w-fit">
        <button
          onClick={() => setTable("discs")}
          className={`rounded px-3 py-1.5 text-sm ${
            table === "discs" ? "bg-amber-500 text-walnut-950" : "text-parchment/60"
          }`}
        >
          Coleção
        </button>
        <button
          onClick={() => setTable("wishlist")}
          className={`rounded px-3 py-1.5 text-sm ${
            table === "wishlist" ? "bg-amber-500 text-walnut-950" : "text-parchment/60"
          }`}
        >
          Wishlist
        </button>
      </div>

      <DiscForm key={table} table={table} mode="create" />
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={null}>
      <NewItemForm />
    </Suspense>
  );
}
