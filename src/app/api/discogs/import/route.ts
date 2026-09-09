import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Usuário é obrigatório" }, { status: 400 });
    }

    const cleanUsername = username.trim();
    const token = process.env.DISCOGS_TOKEN;

    const headers: HeadersInit = {
      "User-Agent": "FoganholiRecordsApp/1.0 (+http://localhost:3000)",
    };

    if (token) {
      headers["Authorization"] = `Discogs token=${token}`;
    }

    // 1. Busca as pastas de coleção do usuário
    const foldersRes = await fetch(
      `https://api.discogs.com/users/${encodeURIComponent(cleanUsername)}/collection/folders`,
      { headers }
    );

    if (!foldersRes.ok) {
      return NextResponse.json(
        { error: "Não foi possível acessar a coleção do Discogs. Verifique se o perfil/coleção está público." },
        { status: foldersRes.status }
      );
    }

    const foldersData = await foldersRes.json();
    const folders = foldersData.folders || [];
    let allReleases: any[] = [];

    // 2. Percorre todas as pastas que possuem discos e realiza paginação
    for (const folder of folders) {
      if (folder.count > 0) {
        let page = 1;
        let totalPages = 1;

        do {
          const res = await fetch(
            `https://api.discogs.com/users/${encodeURIComponent(cleanUsername)}/collection/folders/${folder.id}/releases?per_page=100&page=${page}`,
            { headers }
          );

          if (res.ok) {
            const data = await res.json();
            const releases = data.releases || [];
            allReleases = [...allReleases, ...releases];
            totalPages = data.pagination?.pages || 1;
          }

          page++;
        } while (page <= totalPages);
      }
    }

    if (allReleases.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // 3. Conecta ao Supabase para inserir os discos no banco de dados
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let importados = 0;

    for (const item of allReleases) {
      const rel = item.basic_information;
      const title = rel.title || "Sem título";
      const artist = rel.artists?.map((a: any) => a.name).join(", ") || "Artista Desconhecido";
      const year = rel.year || null;
      const genre = rel.genres?.[0] || "Outro";
      const coverUrl = rel.cover_image || rel.thumb || "";
      const mediaType = rel.formats?.[0]?.name?.toLowerCase().includes("cd") ? "CD" : "Vinil";

      const { error } = await supabase.from("discs").insert([
        {
          title,
          artist,
          year,
          genre,
          cover_url: coverUrl,
          media_type: mediaType,
          favorite: false,
        },
      ]);

      if (!error) importados++;
    }

    return NextResponse.json({ success: true, count: importados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}