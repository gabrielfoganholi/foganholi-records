import { NextRequest, NextResponse } from "next/server";

const DISCOGS_BASE = "https://api.discogs.com";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Parâmetro 'q' é obrigatório" }, { status: 400 });
  }

  const token = process.env.DISCOGS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "DISCOGS_TOKEN não configurado no servidor" },
      { status: 500 }
    );
  }

  const url = `${DISCOGS_BASE}/database/search?q=${encodeURIComponent(
    q
  )}&type=release&per_page=15&token=${token}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "FoganholiRecords/1.0" },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Erro ao consultar o Discogs" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ results: data.results ?? [] });
}
