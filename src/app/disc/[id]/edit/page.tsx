"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DiscForm from "@/components/DiscForm";
import Link from "next/link";

export default function EditDiscPage() {
  const params = useParams();
  const router = useRouter();
  const [disc, setDisc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDisc() {
      if (!params.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("discs")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Erro ao buscar disco:", error);
      } else {
        setDisc(data);
      }
      setLoading(false);
    }

    fetchDisc();
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-parchment/60">
        Carregando dados do disco...
      </div>
    );
  }

  if (!disc) {
    return (
      <div className="text-center py-12 text-sm text-parchment/60">
        Disco não encontrado.
        <br />
        <Link href="/" className="text-amber-500 hover:underline mt-4 inline-block">
          ← Voltar para a Coleção
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/disc/${disc.id}`}
          className="text-sm text-parchment/60 hover:text-parchment transition"
        >
          ← Voltar para Detalhes
        </Link>
      </div>

      <DiscForm mode="edit" table="discs" initialData={disc} />
    </div>
  );
}