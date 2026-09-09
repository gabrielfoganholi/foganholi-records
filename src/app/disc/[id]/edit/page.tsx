// Busca Capa via iTunes (Livre/Gratuito) e fallback para Discogs
  const handleFetchCoverFromDiscogs = async () => {
    if (!disc?.title || !disc?.artist) return;
    setUpdatingCover(true);

    try {
      // 1. Tativa via iTunes Search API (Rápida, sem API Key e capas HD)
      const query = encodeURIComponent(`${disc.artist} ${disc.title}`);
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`
      );

      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results && itunesData.results.length > 0) {
          // Pega a imagem e troca a resolução para 600x600 px (alta qualidade)
          const rawArtwork = itunesData.results[0].artworkUrl100;
          const hdArtwork = rawArtwork.replace("100x100bb", "600x600bb");

          await updateCoverUrlInDb(hdArtwork);
          setUpdatingCover(false);
          return;
        }
      }

      // 2. Fallback: Busca via iTunes apenas pelo título do álbum
      const titleOnlyQuery = encodeURIComponent(disc.title);
      const fallbackRes = await fetch(
        `https://itunes.apple.com/search?term=${titleOnlyQuery}&entity=album&limit=3`
      );

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const matched = fallbackData.results?.find((album: any) =>
          album.artistName.toLowerCase().includes(disc.artist.toLowerCase())
        ) || fallbackData.results?.[0];

        if (matched?.artworkUrl100) {
          const hdArtwork = matched.artworkUrl100.replace("100x100bb", "600x600bb");
          await updateCoverUrlInDb(hdArtwork);
          setUpdatingCover(false);
          return;
        }
      }

      alert("Nenhuma imagem encontrada automaticamente para este disco. Tente escolher uma foto da galeria.");
    } catch (err: any) {
      console.error("Erro ao buscar capa:", err);
      alert("Erro de conexão ao buscar a capa.");
    } finally {
      setUpdatingCover(false);
    }
  };