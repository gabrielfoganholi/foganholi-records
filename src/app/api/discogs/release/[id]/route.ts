import { NextRequest, NextResponse } from "next/server";

const DISCOGS_BASE = "https://api.discogs.com";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "DISCOGS_TOKEN não configurado no servidor" },
      { status: 500 }
    );
  }

  const url = `${DISCOGS_BASE}/releases/${params.id}?token=${token}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "FoganholiRecords/1.0" },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Release não encontrado" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
