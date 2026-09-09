"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMsg("Falha ao entrar: " + error.message);
    } else if (data?.session) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-parchment">Entrar no Acervo</h1>
          <p className="text-xs text-parchment/60 mt-1">Acesse sua conta para gerenciar sua coleção.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-parchment/80 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Acessar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
}