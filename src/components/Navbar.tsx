"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fecha o menu sempre que a rota mudar
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Coleção", href: "/" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Importar Discogs", href: "/import" },
    { name: "Adicionar", href: "/new" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <nav className="bg-[#1c1613] border-b border-[#3d2d26] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href={user ? "/" : "/login"}
          className="font-display font-bold text-xl text-amber-500 hover:text-amber-400 transition"
          onClick={() => setIsOpen(false)}
        >
          Foganholi Records
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-2">
          {user &&
            navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-amber-500 text-walnut-950"
                      : "text-parchment/80 hover:text-parchment hover:bg-[#2a1f1a]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

          {user ? (
            <button
              onClick={handleLogout}
              className="ml-2 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-300 font-bold px-4 py-2 rounded-xl text-sm transition"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold px-4 py-2 rounded-xl text-sm transition shadow-sm"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* BOTÃO HAMBÚRGUER (MOBILE) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-parchment p-2 rounded-lg bg-[#2a1f1a] focus:outline-none"
          aria-label="Abrir Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MENU DROPDOWN MOBILE */}
      {isOpen && (
        <div className="md:hidden bg-[#1c1613] border-b border-[#3d2d26] px-4 pt-2 pb-4 space-y-2 absolute top-16 left-0 right-0 z-50 shadow-2xl">
          {user &&
            navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-amber-500 text-walnut-950"
                      : "text-parchment/80 hover:text-parchment hover:bg-[#2a1f1a]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

          <div className="pt-2 border-t border-[#2a1f1a]">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center bg-rose-950/80 border border-rose-800 text-rose-300 font-bold px-4 py-2.5 rounded-xl text-sm transition"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-amber-500 text-walnut-950 font-bold px-4 py-2.5 rounded-xl text-sm transition"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}