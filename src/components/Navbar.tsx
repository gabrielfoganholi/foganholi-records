"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/", label: "Coleção" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/new", label: "Adicionar" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-walnut-700 bg-walnut-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl text-parchment">
            Foganholi Records
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-amber-500 text-walnut-950"
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
              className="ml-2 rounded-md px-3 py-1.5 text-sm text-parchment/60 hover:bg-walnut-800 hover:text-parchment"
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
