"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Selecione um arquivo CSV primeiro.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length <= 1) {
          alert("O arquivo CSV está vazio ou sem dados válidos.");
          setLoading(false);
          return;
        }

        // Pula o cabeçalho
        const rows = lines.slice(1);
        const recordsToInsert = [];

        for (const row of rows) {
          const cols = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (cols.length >= 2) {
            recordsToInsert.push({
              title: cols[0] || "Sem Título",
              artist: cols[1] || "Artista Desconhecido",
              year: cols[2] ? parseInt(cols[2]) || null : null,
              genre: cols[3] || null,
              format: cols[4] || "Vinil",
              label: cols[5] || null,
            });
          }
        }

        if (recordsToInsert.length > 0) {
          const { error } = await supabase.from("discs").insert(recordsToInsert);
          if (error) {
            alert("Erro ao importar CSV: " + error.message);
          } else {
            alert(`${recordsToInsert.length} discos importados com sucesso!`);
            router.push("/");
          }
        }
      } catch (err) {
        alert("Erro ao processar arquivo CSV.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-parchment">Importar via CSV / Discogs</h1>
          <p className="text-xs text-parchment/60 mt-1">
            Selecione uma planilha CSV contendo o acervo da sua coleção.
          </p>
        </div>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-2">Arquivo CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-parchment/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-walnut-950 hover:file:bg-amber-400 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3 rounded-xl text-sm transition shadow-md"
          >
            {loading ? "Processando..." : "Carregar Planilha CSV"}
          </button>
        </form>
      </div>
    </div>
  );
}