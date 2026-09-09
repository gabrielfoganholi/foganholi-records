"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/", label: "Coleção" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/import", label: "Importar Discogs" },
  { href: "/new", label: "Adicionar" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-walnut-700 bg-walnut-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:gap-0">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-parchment">
            Foganholi Records
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "bg-amber-500 text-walnut-950 font-semibold"
                    : "text-parchment/80 hover:bg-walnut-800 hover:text-parchment"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={() => signOut()}
              className="ml-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors sm:ml-2 sm:px-3 sm:text-sm"
              title={user.email ?? ""}
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}