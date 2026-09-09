"use client";

import DiscForm from "@/components/DiscForm";
import Link from "next/link";

export default function NewWishlistItemPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/wishlist"
          className="text-sm text-parchment/60 hover:text-parchment transition"
        >
          ← Voltar para Wishlist
        </Link>
      </div>

      <DiscForm mode="create" table="wishlist" />
    </div>
  );
}