"use client";

import DiscCard from "./DiscCard";

interface RandomPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  disc: any;
  onPickAgain: () => void;
}

export default function RandomPickModal({
  isOpen,
  onClose,
  disc,
  onPickAgain,
}: RandomPickModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1c1613] border border-[#3d2d26] rounded-3xl p-6 max-w-sm w-full space-y-4 text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-parchment/60 hover:text-parchment text-lg font-bold"
        >
          ✕
        </button>

        <div>
          <span className="text-3xl block mb-1">🎲</span>
          <h2 className="font-display font-bold text-xl text-amber-500">
            O que ouvir hoje?
          </h2>
          <p className="text-xs text-parchment/60">
            A sorte escolheu este álbum do seu acervo:
          </p>
        </div>

        {disc ? (
          <div className="pt-2">
            <DiscCard disc={disc} />
          </div>
        ) : (
          <p className="text-sm text-parchment/50 py-8">
            Nenhum disco disponível para sorteio.
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onPickAgain}
            className="flex-1 bg-[#2a1f1a] hover:bg-[#3d2d26] text-parchment text-xs font-semibold py-2.5 rounded-xl transition"
          >
            Sortear Outro
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-walnut-950 text-xs font-bold py-2.5 rounded-xl transition"
          >
            Vou ouvir este!
          </button>
        </div>
      </div>
    </div>
  );
}