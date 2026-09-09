"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DiscList from "@/components/DiscList";
import CollectionStats from "@/components/CollectionStats";
import FilterBar from "@/components/FilterBar";
import RandomPickModal from "@/components/RandomPickModal";

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [discs, setDiscs] = useState<any[]>([]);

  // Estados para busca e filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  // Estado para o Modal do Sorteio Aleatório
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [randomDisc, setRandomDisc] = useState<any>(null);

  useEffect(() => {
    // 1. Escuta mudanças na autenticação do Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push("/login");
        } else {
          setCheckingAuth(false);
          fetchDiscs();
        }
      }
    );

    // 2. Verificação inicial da sessão
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setCheckingAuth(false);
        fetchDiscs();
      }
    };

    initAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Função para carregar os discos do banco de dados
  const fetchDiscs = async () => {
    const { data, error } = await supabase
      .from("discs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDiscs(data);
    }
  };

  // Lógica de filtragem em tempo real (Artista/Banda, Título, Gravadora, Gênero e Formato)
  const filteredDiscs = useMemo(() => {
    return discs.filter((disc) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        disc.title?.toLowerCase().includes(query) ||
        disc.artist?.toLowerCase().includes(query) ||
        disc.label?.toLowerCase().includes(query);

      const matchesGenre = !selectedGenre || disc.genre === selectedGenre;
      const matchesFormat = !selectedFormat || disc.format === selectedFormat;

      return matchesSearch && matchesGenre && matchesFormat;
    });
  }, [discs, searchQuery, selectedGenre, selectedFormat]);

  // Função para sortear um disco entre os filtrados
  const handleRandomPick = () => {
    if (filteredDiscs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredDiscs.length);
    setRandomDisc(filteredDiscs[randomIndex]);
    setIsModalOpen(true);
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-amber-500 text-sm font-semibold animate-pulse">
          Carregando sua coleção...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* DASHBOARD COM ESTATÍSTICAS DO ACERVO */}
      <CollectionStats discs={discs} />

      {/* BARRA DE BUSCA, FILTROS E BOTÃO DE SORTEIO */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#1c1613] border border-[#3d2d26] p-4 rounded-2xl shadow-md">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          genres={Array.from(
            new Set(discs.map((d) => d.genre).filter(Boolean))
          )}
          formats={Array.from(
            new Set(discs.map((d) => d.format).filter(Boolean))
          )}
        />

        <button
          onClick={handleRandomPick}
          className="bg-amber-500 hover:bg-amber-400 text-walnut-950 font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md active:scale-95"
        >
          <span>🎲</span> O que ouvir hoje?
        </button>
      </div>

      {/* GRID DE DISCOS EXIBINDO OS RESULTADOS */}
      <DiscList discs={filteredDiscs} />

      {/* MODAL DO SORTEIO ALEATÓRIO */}
      <RandomPickModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        disc={randomDisc}
        onPickAgain={handleRandomPick}
      />
    </main>
  );
}