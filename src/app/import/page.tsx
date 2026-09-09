"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const mapDiscogsFormat = (rawFormat: string): string => {
    const lower = rawFormat.toLowerCase();
    if (lower.includes("cd")) return "CD";
    if (lower.includes("cass") || lower.includes("k7") || lower.includes("tape")) return "Cassete";
    if (lower.includes("dvd")) return "DVD";
    if (lower.includes("digital") || lower.includes("file")) return "Digital";
    return "Vinil";
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    setProgress("Lendo arquivo...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("Não foi possível ler o arquivo.");

        const parseCSVLine = (line: string) => {
          const result: string[] = [];
          let cur = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(cur.trim());
              cur = "";
            } else {
              cur += char;
            }
          }
          result.push(cur.trim());
          return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
        };

        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
          throw new Error("O arquivo CSV está vazio.");
        }

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        
        const artistIndex = headers.indexOf("artist");
        const titleIndex = headers.indexOf("title");
        const yearIndex = headers.indexOf("released");
        const formatIndex = headers.indexOf("format");
        const genreIndex = headers.indexOf("genre");

        if (artistIndex === -1 || titleIndex === -1) {
          throw new Error("Formato de CSV inválido. Certifique-se de usar o arquivo do Discogs.");
        }

        const discsToInsert = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = parseCSVLine(line);

          let artist = values[artistIndex] || "Artista Desconhecido";
          artist = artist.replace(/\s*\(\d+\)$/, "");

          const title = values[titleIndex] || "Título Desconhecido";
          const rawYear = values[yearIndex];
          const year = rawYear ? parseInt(rawYear) || null : null;

          const rawFormat = values[formatIndex] || "";
          const format = mapDiscogsFormat(rawFormat);

          const genre = values[genreIndex] || "Rock"; // Gênero padrão

          discsToInsert.push({
            title,
            artist,
            year,
            genre: genre || "Rock",
            format,
            favorite: false,
          });
        }

        if (discsToInsert.length === 0) {
          throw new Error("Nenhum disco encontrado no CSV.");
        }

        setProgress(`Inserindo ${discsToInsert.length} discos no banco de dados...`);

        // Tenta inserção direta
        const { data, error } = await supabase
          .from("discs")
          .insert(discsToInsert)
          .select();

        if (error) {
          console.error("Erro no batch, tentando inserir individualmente...", error);
          
          // Se o lote falhar, insere um por um para registrar o máximo possível e capturar o erro exato
          let insertedCount = 0;
          let lastError = "";

          for (const disc of discsToInsert) {
            const { error: singleError } = await supabase.from("discs").insert([disc]);
            if (!singleError) {
              insertedCount++;
            } else {
              lastError = singleError.message;
            }
          }

          if (insertedCount > 0) {
            setMessage({
              type: "success",
              text: `Sucesso parcial! ${insertedCount} de ${discsToInsert.length} discos foram importados.`,
            });
          } else {
            throw new Error(`Erro do Supabase: ${lastError || error.message}`);
          }
        } else {
          setMessage({
            type: "success",
            text: `Sucesso! Todos os ${data ? data.length : discsToInsert.length} discos foram gravados na coleção!`,
          });
        }
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.message || "Erro ao processar o arquivo CSV.",
        });
      } finally {
        setLoading(false);
        setProgress("");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="text-amber-500 hover:underline text-sm mb-6 inline-block">
        ← Voltar para a Coleção
      </Link>

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Importar Coleção via CSV</h1>
        <p className="text-slate-400 text-sm mb-6">
          Selecione o arquivo CSV baixado do Discogs para carregar seus discos diretamente.
        </p>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg p-8 bg-slate-900/50 hover:border-amber-500 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
          />
          {loading && <p className="mt-4 text-amber-400 text-sm">{progress || "Importando seus discos..."}</p>}
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300"
                : "bg-rose-950/80 border border-rose-800 text-rose-300"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}