"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn(email, password);
      if (res?.error) {
        const errObj = res.error as any;
        setError(typeof errObj === "string" ? errObj : errObj?.message || "Erro ao fazer login.");
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signUp(email, password);
      if (res?.error) {
        const errObj = res.error as any;
        setError(typeof errObj === "string" ? errObj : errObj?.message || "Erro ao cadastrar.");
        setLoading(false);
        return;
      }
      alert("Cadastro realizado! Verifique seu e-mail ou faça login.");
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Foganholi Records</h1>

        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}