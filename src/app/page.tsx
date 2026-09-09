"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao importar coleção.");
      }

      setMessage(`Sucesso! ${data.count || 0} discos foram importados.`);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 w-full">
      <h1 className="font-display text-2xl font-bold text-parchment mb-2">
        Importar do Discogs
      </h1>
      <p className="text-sm text-parchment/60 mb-6">
        Digite seu nome de usuário do Discogs para sincronizar sua coleção.
      </p>

      <form onSubmit={handleImport} className="space-y-4 bg-walnut-900/60 p-6 rounded-2xl border border-walnut-800">
        <div>
          <label className="block text-xs font-medium text-parchment/80 mb-1.5">
            Usuário do Discogs
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ex: gabrielfoganholi"
            className="w-full bg-walnut-950 border border-walnut-700 rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        {message && (
          <p className={`text-xs p-3 rounded-lg ${message.startsWith("Sucesso") ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-rose-950/80 text-rose-400 border border-rose-800"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Importando discos..." : "Iniciar Importação"}
        </button>
      </form>
    </div>
  );
}