import { NextResponse } from "next/server";

const PLEX_URL = process.env.PLEX_URL;
const PLEX_TOKEN = process.env.PLEX_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!PLEX_URL || !PLEX_TOKEN) {
    return NextResponse.json({ found: false });
  }

  try {
    const url = `${PLEX_URL}/library/search?query=${encodeURIComponent(title)}&X-Plex-Token=${PLEX_TOKEN}`;
    console.log("[plex-check] Fetching:", url.replace(PLEX_TOKEN, "***"));

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    console.log("[plex-check] Response status:", response.status);

    if (!response.ok) {
      console.warn("[plex-check] Non-OK response, returning not found");
      return NextResponse.json({ found: false });
    }

    const data = await response.json();
    const results = data?.MediaContainer?.SearchResult ?? [];
    console.log("[plex-check] Results count:", results.length);

    const found = results.length > 0;
    const match = found ? results[0]?.Metadata : null;
    console.log("[plex-check] Match:", match ? `${match.title} (${match.year})` : "none");

    return NextResponse.json({
      found,
      title: match?.title ?? null,
      year: match?.year ?? null,
      type: match?.type ?? null,
    });
  } catch (error) {
    console.error("[plex-check] Error:", error);
    return NextResponse.json({ found: false });
  }
}
