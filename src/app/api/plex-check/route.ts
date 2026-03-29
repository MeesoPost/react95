import { NextResponse } from "next/server";

const PLEX_URL = process.env.PLEX_URL;
const PLEX_TOKEN = process.env.PLEX_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

type PlexMetadata = {
  ratingKey?: string;
  title?: string;
  year?: number;
  type?: string;
};

async function plexFetch(path: string): Promise<Response> {
  return fetch(`${PLEX_URL}${path}${path.includes("?") ? "&" : "?"}X-Plex-Token=${PLEX_TOKEN}`, {
    headers: { Accept: "application/json" },
  });
}

async function checkByGuid(guid: string): Promise<PlexMetadata | null> {
  const encoded = encodeURIComponent(guid);
  const res = await plexFetch(`/library/all?guid=${encoded}`);
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.MediaContainer?.Metadata?.[0] as PlexMetadata | undefined) ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const mediaType = searchParams.get("mediaType"); // "movie" or "tv"
  const tmdbId = searchParams.get("tmdbId");

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!PLEX_URL || !PLEX_TOKEN) {
    return NextResponse.json({ found: false });
  }

  if (!tmdbId) {
    return NextResponse.json({ found: false });
  }

  try {
    const tmdbType = mediaType === "tv" ? "tv" : "movie";

    // Fetch TMDB external IDs in parallel with the tmdb:// GUID lookup
    const [tmdbMatch, externalIdsRes] = await Promise.all([
      checkByGuid(`tmdb://${tmdbId}`),
      TMDB_API_KEY
        ? fetch(
            `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`
          )
        : Promise.resolve(null),
    ]);

    if (tmdbMatch) {
      console.log("[plex-check] Found via tmdb:// GUID");
      return NextResponse.json({
        found: true,
        title: tmdbMatch.title ?? null,
        year: tmdbMatch.year ?? null,
        type: tmdbMatch.type ?? null,
        ratingKey: tmdbMatch.ratingKey ?? null,
      });
    }

    // Try imdb:// and tvdb:// GUIDs from external IDs
    let imdbId: string | null = null;
    let tvdbId: string | number | null = null;

    if (externalIdsRes?.ok) {
      const ext = await externalIdsRes.json();
      imdbId = ext.imdb_id ?? null;
      tvdbId = ext.tvdb_id ?? null;
    }

    // Try in parallel
    const [imdbMatch, tvdbMatch] = await Promise.all([
      imdbId ? checkByGuid(`imdb://${imdbId}`) : Promise.resolve(null),
      tvdbId ? checkByGuid(`tvdb://${tvdbId}`) : Promise.resolve(null),
    ]);

    let match = imdbMatch ?? tvdbMatch ?? null;

    // Last resort: title search with exact year — covers old Plex agents that don't store GUIDs
    if (!match && title) {
      const year = searchParams.get("year");
      const plexType = mediaType === "tv" ? "show" : "movie";
      const searchRes = await plexFetch(`/library/search?query=${encodeURIComponent(title)}`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results: PlexMetadata[] = (searchData?.MediaContainer?.SearchResult ?? [])
          .map((r: { Metadata?: PlexMetadata }) => r.Metadata)
          .filter(Boolean);
        const titleLower = title.toLowerCase();
        match = results.find(
          (m) =>
            m.type === plexType &&
            (m.title ?? "").toLowerCase() === titleLower &&
            year != null &&
            String(m.year) === year
        ) ?? null;
        if (match) console.log("[plex-check] Found via title+exact-year search");
      }
    }

    if (!match) {
      console.log("[plex-check] Not found via any GUID or title search");
      return NextResponse.json({ found: false });
    }

    const source = imdbMatch ? "imdb://" : tvdbMatch ? "tvdb://" : "title";
    console.log(`[plex-check] Found via ${source}: ${match.title} (${match.year})`);

    return NextResponse.json({
      found: true,
      title: match.title ?? null,
      year: match.year ?? null,
      type: match.type ?? null,
      ratingKey: match.ratingKey ?? null,
    });
  } catch (error) {
    console.error("[plex-check] Error:", error);
    return NextResponse.json({ found: false });
  }
}
