"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const action = mode === "signin" ? signIn : signUp;
      const res = await action(email, password);

      // Tratamento de erros do Supabase/AuthContext
      if (res?.error) {
        setError(typeof res.error === "string" ? res.error : res.error.message);
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        setInfo(
          "Conta criada! Se a confirmação por e-mail estiver ativa no Supabase, verifique sua caixa de entrada antes de entrar."
        );
        setLoading(false);
      } else {
        // Redirecionamento forçado para a página principal ao logar com sucesso
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao tentar autenticar.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090D16] px-4 text-slate-100">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">🎵</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-100">
            Foganholi Records
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            A coleção da família, sempre à mão.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-wood flex flex-col gap-4 p-6 shadow-2xl"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-300">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-300">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-lg border border-emerald-800/80 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50"
          >
            {loading
              ? "Aguarde..."
              : mode === "signin"
              ? "Entrar"
              : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="text-xs text-slate-400 transition-colors hover:text-amber-400"
          >
            {mode === "signin"
              ? "Ainda não tem conta? Criar uma"
              : "Já tem conta? Fazer login"}
          </button>
        </form>
      </div>
    </div>
  );
}