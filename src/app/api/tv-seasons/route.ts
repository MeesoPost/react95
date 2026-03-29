import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const PLEX_URL = process.env.PLEX_URL;
const PLEX_TOKEN = process.env.PLEX_TOKEN;

async function plexFetch(path: string) {
  return fetch(
    `${PLEX_URL}${path}${path.includes("?") ? "&" : "?"}X-Plex-Token=${PLEX_TOKEN}`,
    { headers: { Accept: "application/json" } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");

  if (!tmdbId || !TMDB_API_KEY) {
    return NextResponse.json({ error: "tmdbId required" }, { status: 400 });
  }

  // Fetch TMDB show details and Plex show lookup in parallel
  const [tmdbRes, plexRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`),
    PLEX_URL && PLEX_TOKEN
      ? plexFetch(`/library/all?guid=tmdb%3A%2F%2F${tmdbId}`)
      : Promise.resolve(null),
  ]);

  if (!tmdbRes.ok) {
    return NextResponse.json({ error: "TMDB fetch failed" }, { status: 500 });
  }

  const tmdbData = await tmdbRes.json();
  const tmdbSeasons: { number: number; name: string; episodeCount: number }[] = (
    tmdbData.seasons ?? []
  )
    .filter((s: { season_number: number }) => s.season_number > 0)
    .map((s: { season_number: number; name: string; episode_count: number }) => ({
      number: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
    }));

  // Resolve which seasons Plex has
  let plexSeasonNumbers: number[] = [];

  if (PLEX_URL && PLEX_TOKEN) {
    try {
      let ratingKey: string | undefined;

      // 1. Try GUID lookup (works when Plex uses TMDB agent)
      if (plexRes && plexRes.ok) {
        const plexData = await plexRes.json();
        ratingKey = plexData?.MediaContainer?.Metadata?.[0]?.ratingKey;
      }

      // 2. Fall back to title search (covers TVDB-indexed libraries)
      if (!ratingKey && tmdbData.name) {
        const searchRes = await plexFetch(
          `/library/search?query=${encodeURIComponent(tmdbData.name)}`
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const results: { type?: string; title?: string; year?: number; ratingKey?: string }[] =
            searchData?.MediaContainer?.SearchResult?.map(
              (r: { Metadata?: unknown }) => r.Metadata
            ).filter(Boolean) ?? [];
          const titleLower = tmdbData.name.toLowerCase();
          const match = results.find(
            (r) => r?.type === "show" && (r?.title ?? "").toLowerCase() === titleLower
          );
          ratingKey = match?.ratingKey;
        }
      }

      if (ratingKey) {
        const childrenRes = await plexFetch(`/library/metadata/${ratingKey}/children`);
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          const seasonItems: { type?: string; index?: number }[] =
            childrenData?.MediaContainer?.Metadata ?? [];
          plexSeasonNumbers = seasonItems
            .filter((s) => s.type === "season" && (s.index ?? 0) > 0)
            .map((s) => s.index as number);
        }
      }
    } catch {
      // Plex unavailable — availability stays empty
    }
  }

  const seasons = tmdbSeasons.map((s) => ({
    ...s,
    available: plexSeasonNumbers.includes(s.number),
  }));

  return NextResponse.json({ seasons });
}
