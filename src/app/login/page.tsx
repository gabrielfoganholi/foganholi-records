"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ text: "Conta criada com sucesso! Você já pode entrar.", type: "success" });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Ocorreu um erro na autenticação.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-6 bg-[#1c1613] border border-[#3d2d26] rounded-2xl shadow-xl">
      <h2 className="font-display font-bold text-parchment text-xl mb-1">
        {isSignUp ? "Criar Conta no Acervo" : "Entrar no Acervo"}
      </h2>
      <p className="text-xs text-parchment/60 mb-6">
        {isSignUp
          ? "Preencha seus dados para começar sua coleção."
          : "Acesse sua conta para gerenciar sua coleção."}
      </p>

      {message && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs ${
            message.type === "error" ? "bg-rose-950/60 text-rose-300 border border-rose-800" : "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-parchment/80 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-parchment/80 mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-[#120e0c] border border-[#3d2d26] rounded-xl px-4 py-2.5 text-sm text-parchment focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-50"
        >
          {loading ? "Processando..." : isSignUp ? "Criar Minha Conta" : "Acessar Conta"}
        </button>
      </form>

      <div className="mt-6 border-t border-[#2a1f1a] pt-4 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-amber-500 hover:underline font-medium"
        >
          {isSignUp ? "Já tem uma conta? Clique aqui para entrar." : "Ainda não tem conta? Clique aqui para se cadastrar."}
        </button>
      </div>
    </div>
  );
}