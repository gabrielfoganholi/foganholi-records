"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Não exibe o AppShell na tela de login
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Coleção", href: "/" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Importar Discogs", href: "/import" },
    { label: "+ Adicionar", href: "/new" },
  ];

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🎵</span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors">
              Foganholi Records
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="ml-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-rose-900 hover:bg-rose-950/30 hover:text-rose-300 sm:text-sm"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo da Página */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}