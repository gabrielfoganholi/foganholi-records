"use client";

import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-walnut-700 bg-walnut-950/95 backdrop-blur w-full">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-parchment">
            Foganholi Records
          </span>
        </Link>

        {/* Botão Hambúrguer (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-label="Menu"
          className="block sm:hidden rounded-lg p-2 text-parchment/80 hover:bg-walnut-800 hover:text-parchment focus:outline-none"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Links Desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-amber-500 font-semibold text-walnut-950"
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
              className="ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
            >
              Sair
            </button>
          )}
        </nav>
      </div>

      {/* Menu Mobile Dropdown */}
      {isOpen && (
        <div className="block sm:hidden border-t border-walnut-800 bg-walnut-950 px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    active
                      ? "bg-amber-500 font-semibold text-walnut-950"
                      : "text-parchment/80 hover:bg-walnut-800 hover:text-parchment"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="mt-2 flex w-full items-center justify-start rounded-lg px-3 py-2.5 text-base font-medium text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}