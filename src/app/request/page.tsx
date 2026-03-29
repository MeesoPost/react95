"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
  Radio,
  GroupBox,
} from "react95";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import styled from "styled-components";
import "@react95/icons/icons.css";
import HourglassProgressBar from "../components/HourglassProgressBar";
import Taskbar from "../components/Taskbar";

const TMDB_IMG = "https://image.tmdb.org/t/p/w92";

const Desktop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;

  @media (min-width: 48rem) {
    padding-bottom: var(--space-800);
    > * {
      zoom: 1.2;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: var(--space-50);
`;

const SearchRow = styled.div`
  display: flex;
  gap: var(--space-100);
  margin-bottom: var(--space-100);
`;

const LoadingText = styled.div`
  text-align: center;
  margin-top: var(--space-100);
  font-size: var(--text-md);
  color: var(--fg-default);
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const RadioRow = styled.div`
  display: flex;
  gap: var(--space-300);
  margin-top: var(--space-50);
`;

const StatusOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-overlay);
  z-index: 100;
`;

const Bsod = styled.div`
  position: fixed;
  inset: 0;
  background: var(--bg-bsod);
  color: var(--fg-bsod);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  padding: var(--space-600);
  box-sizing: border-box;
`;

const BsodInner = styled.div`
  max-width: var(--bsod-max-w);
  width: 100%;
  font-size: var(--text-base);
  line-height: 1.6;
`;

const BsodHighlight = styled.span`
  background: var(--fg-bsod-highlight);
  color: var(--bg-bsod);           /* invert: highlight box on BSOD screen */
  padding: 0 var(--space-50);
`;

const SeasonList = styled.ul`
  list-style: none;
  margin: var(--space-25) 0 0 0;
  padding: 0;
  border: var(--space-25) solid;
  border-color: var(--border-default) var(--bg-default) var(--bg-default) var(--border-default);
  background: var(--bg-default);
  max-height: var(--list-max-h);
  overflow-y: auto;
`;

const SeasonRow = styled.li<{ $selected: boolean; $available?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-100);
  padding: 0.3125rem var(--space-100);
  cursor: pointer;
  background: ${(p) => (p.$selected ? "var(--bg-selected)" : "transparent")};
  color: ${(p) => (p.$selected ? "var(--bg-default)" : "var(--fg-default)")};
  border-bottom: var(--space-px) solid var(--border-subtle);
  border-left: ${(p) =>
    p.$available
      ? `0.1875rem solid ${p.$selected ? "var(--positive-on-selected)" : "var(--positive-default)"}`
      : "0.1875rem solid transparent"};
  &:last-child { border-bottom: none; }
  &:hover { background: ${(p) => (p.$selected ? "var(--bg-selected)" : "var(--bg-hover)")}; }
`;

const SeasonName = styled.span`
  font-size: var(--text-md);
  font-weight: bold;
  flex: 1;
`;

const SeasonEpisodes = styled.span<{ $selected: boolean }>`
  font-size: var(--text-sm);
  color: ${(p) => (p.$selected ? "var(--fg-on-selected-muted)" : "var(--fg-subtle)")};
  flex-shrink: 0;
`;

const PlexTag = styled.span`
  font-size: var(--text-xs);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--positive-default);
  color: var(--bg-default);
  padding: var(--space-px) 0;
  flex-shrink: 0;
  line-height: 0.875rem;
  width: var(--plex-tag-w);
  text-align: center;
  display: inline-block;
`;

const SearchButton = styled(Button)<{ $active: boolean }>`
  ${(p) => p.$active && `
    outline: 0.1875rem dashed var(--color-focus);
    outline-offset: var(--space-25);
  `}
`;

const ResultListBox = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: var(--space-25) solid;
  border-color: var(--border-default) var(--bg-default) var(--bg-default) var(--border-default);
  background: var(--bg-default);
  max-height: var(--results-max-h);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
`;

const ResultItem = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-100);
  padding: 0.375rem var(--space-100);
  cursor: pointer;
  background: ${(p) => (p.$selected ? "var(--bg-selected)" : "transparent")};
  color: ${(p) => (p.$selected ? "var(--bg-default)" : "var(--fg-default)")};
  font-size: var(--text-md);

  &:hover {
    background: ${(p) => (p.$selected ? "var(--bg-selected)" : "var(--bg-hover)")};
  }
`;

const PosterImg = styled.img`
  width: var(--poster-w);
  height: var(--poster-h);
  object-fit: cover;
  flex-shrink: 0;
  border: var(--space-px) solid var(--border-default);
`;

const PosterPlaceholder = styled.div`
  width: var(--poster-w);
  height: var(--poster-h);
  flex-shrink: 0;
  background: var(--bg-hover);
  border: var(--space-px) solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xs);
  color: var(--fg-subtle);
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-25);
  min-width: 0;
`;

const ResultTitle = styled.span`
  font-size: var(--text-md);
  font-weight: bold;
  white-space: normal;
  word-break: break-word;
`;

const ResultYear = styled.span`
  font-size: var(--text-sm);
  opacity: 0.8;
`;


const loadingMessages = [
  "Initializing...",
  "Loading resources...",
  "Preparing interface...",
  "Almost there...",
  "Finalizing...",
];

interface SearchResult {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  mediaType: "movie" | "tv" | "person";
}

const BURST_WINDOW = 10000;
const BURST_LIMIT = 5;
const COOLDOWN_DURATIONS = [30, 60, 120, 180];
const COOLDOWN_MESSAGES = ["easy.", "not so fast.", "hold up.", "take it easy."];

interface RateState {
  timestamps: number[];
  offenseCount: number;
  cooldownUntil: number;
}

function getRateState(): RateState {
  try {
    const stored = sessionStorage.getItem("maas95_rate");
    return stored ? JSON.parse(stored) : { timestamps: [], offenseCount: 0, cooldownUntil: 0 };
  } catch {
    return { timestamps: [], offenseCount: 0, cooldownUntil: 0 };
  }
}

const RequestPage: React.FC = () => {
  const [percent, setPercent] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"movie" | "series">("movie");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showLogout, setShowLogout] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [showBsod, setShowBsod] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownOffense, setCooldownOffense] = useState(0);
  const [plexMatch, setPlexMatch] = useState<{ title: string; year: number; type: string } | null>(null);
  const [showPlexWarning, setShowPlexWarning] = useState(false);
  const [tvSeasons, setTvSeasons] = useState<{ number: number; name: string; episodeCount: number; available: boolean }[] | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);

  useEffect(() => {
    if (!showBsod) return;
    const handler = () => setShowBsod(false);
    window.addEventListener("keyup", handler);
    return () => window.removeEventListener("keyup", handler);
  }, [showBsod]);

  useEffect(() => {
    const state = getRateState();
    if (state.cooldownUntil <= Date.now()) return;
    setCooldownOffense(state.offenseCount);
    const interval = setInterval(() => {
      const remaining = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
      if (remaining <= 0) { setCooldownRemaining(0); clearInterval(interval); }
      else setCooldownRemaining(remaining);
    }, 250);
    setCooldownRemaining(Math.ceil((state.cooldownUntil - Date.now()) / 1000));
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isReload = sessionStorage.getItem("maas95_loaded") === "true";
    sessionStorage.setItem("maas95_loaded", "true");

    const phases = isReload
      ? [
          { target: 60, speed: 200 },
          { target: 100, speed: 300 },
        ]
      : [
          { target: 30, speed: 1000 },
          { target: 60, speed: 1500 },
          { target: 80, speed: 2000 },
          { target: 98, speed: 2500 },
          { target: 100, speed: 1000 },
        ];

    const animate = (phase: number) => {
      if (phase >= phases.length) {
        setTimeout(() => setIsLoaded(true), 200);
        return;
      }

      const { target, speed } = phases[phase];
      const startVal = phase === 0 ? 0 : phases[phase - 1].target;
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / speed);
        setPercent(Math.floor(startVal + (target - startVal) * progress));

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setLoadingPhase(phase + 1);
        }
      };

      requestAnimationFrame(tick);
    };

    animate(loadingPhase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPhase]);

  const handleSearch = async () => {
    const q = title;
    if (!q) return;
    setIsSearching(true);
    setSearchResults([]);
    setSelectedResult(null);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(q)}`);
      const data = await response.json();
      setSearchResults(
        (data.results ?? []).map((item: {
          id: number;
          title?: string;
          name?: string;
          release_date?: string;
          first_air_date?: string;
          poster_path?: string;
          media_type?: string;
        }) => ({
          id: item.id,
          title: item.title || item.name || "Unknown",
          year: item.release_date
            ? new Date(item.release_date).getFullYear().toString()
            : item.first_air_date
            ? new Date(item.first_air_date).getFullYear().toString()
            : "N/A",
          poster: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null,
          mediaType: (item.media_type ?? "movie") as "movie" | "tv" | "person",
        }))
      );
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitTitle = selectedResult?.title || title;
    if (!canSubmit || !name || !submitTitle) return;

    const now = Date.now();
    const state = getRateState();

    if (state.cooldownUntil > now) return;

    const recent = state.timestamps.filter((t) => now - t < BURST_WINDOW);
    if (recent.length >= BURST_LIMIT) {
      const offense = state.offenseCount + 1;
      const secs = COOLDOWN_DURATIONS[Math.min(offense - 1, COOLDOWN_DURATIONS.length - 1)];
      const newState: RateState = { timestamps: [...recent, now], offenseCount: offense, cooldownUntil: now + secs * 1000 };
      sessionStorage.setItem("maas95_rate", JSON.stringify(newState));
      setCooldownOffense(offense);
      setCooldownRemaining(secs);
      const interval = setInterval(() => {
        const remaining = Math.ceil((newState.cooldownUntil - Date.now()) / 1000);
        if (remaining <= 0) { setCooldownRemaining(0); clearInterval(interval); }
        else setCooldownRemaining(remaining);
      }, 250);
      return;
    }

    const newState: RateState = { ...state, timestamps: [...recent, now], cooldownUntil: 0 };
    sessionStorage.setItem("maas95_rate", JSON.stringify(newState));

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: submitTitle,
          name,
          type,
          year: selectedResult?.year ?? null,
          tmdbId: selectedResult?.id ?? null,
          mediaType: selectedResult?.mediaType ?? null,
          seasons: selectedSeasons.length > 0 ? selectedSeasons : null,
        }),
      });
      setSubmitStatus(res.ok ? "success" : "error");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusDismiss = () => {
    if (submitStatus === "success") {
      setTitle("");
      setSelectedResult(null);
      setName("");
      setType("movie");
      setSearchResults([]);
      setTvSeasons(null);
      setSelectedSeasons([]);
    }
    setSubmitStatus("idle");
  };

  const isRateLimited = cooldownRemaining > 0;
  const canSubmit = !isSubmitting && !isRateLimited && !!(name && (selectedResult || title));

  if (!isLoaded) {
    return (
      <ThemeProvider theme={original}>
        <CenteredContent>
          <HourglassProgressBar value={percent} />
          <LoadingText>{loadingMessages[Math.min(loadingPhase, loadingMessages.length - 1)]}</LoadingText>
        </CenteredContent>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={original}>
      <Desktop>
        <Window style={{ width: "min(var(--window-w), 100%)" }}>
          <WindowHeader className="window-title" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ flex: 1 }}>MS Maas — Submit Request</span>
            <Button aria-label="Help" onClick={() => setShowBsod(true)}>?</Button>
            <Button aria-label="Close" onClick={() => setShowLogout(true)}>X</Button>
          </WindowHeader>
          <WindowContent>
            <form onSubmit={handleSubmit}>
              <GroupBox label="Title">
                <FormGroup>
                  <SearchRow>
                    <TextInput
                      ref={titleRef}
                      id="title-input"
                      aria-label="Search for a movie or series"
                      value={selectedResult ? `${selectedResult.title} (${selectedResult.year})` : title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setSelectedResult(null);
                        setSearchResults([]);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      style={{ flex: 1 }}
                      placeholder="Search for a movie or series..."
                    />
                    <SearchButton type="button" onClick={() => handleSearch()} disabled={isSearching || !title} $active={!!title && !selectedResult && searchResults.length === 0}>
                      {isSearching ? "..." : "Search"}
                    </SearchButton>
                    <Button
                      type="button"
                      onClick={() => {
                        setTitle("");
                        setSelectedResult(null);
                        setSearchResults([]);
                        setTvSeasons(null);
                        setSelectedSeasons([]);
                      }}
                    >
                      Clear
                    </Button>
                  </SearchRow>

                  {searchResults.length > 0 && !selectedResult && (
                    <ResultListBox role="listbox" aria-label="Search results">
                      {searchResults.map((r) => (
                        <ResultItem
                          key={r.id}
                          $selected={false}
                          tabIndex={0}
                          role="option"
                          aria-selected={false}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
                          onClick={async () => {
                            setSelectedResult(r);
                            setPlexMatch(null);
                            setTvSeasons(null);
                            setSelectedSeasons([]);
                            setType(r.mediaType === "tv" ? "series" : "movie");

                            if (r.mediaType === "tv") {
                              setIsLoadingSeasons(true);
                              try {
                                const res = await fetch(`/api/tv-seasons?tmdbId=${r.id}`);
                                const data = await res.json();
                                setTvSeasons(data.seasons ?? null);
                                setTimeout(() => nameRef.current?.focus(), 50);
                              } catch {
                                setTvSeasons(null);
                              } finally {
                                setIsLoadingSeasons(false);
                              }
                            } else {
                              try {
                                const params = new URLSearchParams({ title: r.title });
                                if (r.year && r.year !== "N/A") params.set("year", r.year);
                                if (r.mediaType) params.set("mediaType", r.mediaType);
                                if (r.id) params.set("tmdbId", String(r.id));
                                const res = await fetch(`/api/plex-check?${params}`);
                                const data = await res.json();
                                if (data.found) {
                                  setPlexMatch({ title: data.title, year: data.year, type: data.type });
                                  setShowPlexWarning(true);
                                } else {
                                  setTimeout(() => nameRef.current?.focus(), 50);
                                }
                              } catch {
                                setTimeout(() => nameRef.current?.focus(), 50);
                              }
                            }
                          }}
                        >
                          {r.poster ? (
                            <PosterImg src={r.poster} alt={r.title} />
                          ) : (
                            <PosterPlaceholder>N/A</PosterPlaceholder>
                          )}
                          <ResultInfo>
                            <ResultTitle>{r.title}</ResultTitle>
                            <ResultYear>{r.year}</ResultYear>
                          </ResultInfo>
                        </ResultItem>
                      ))}
                    </ResultListBox>
                  )}
                  {selectedResult && (
                    <ResultListBox role="listbox" aria-label="Selected title">
                      <ResultItem
                        $selected={true}
                        tabIndex={0}
                        role="option"
                        aria-selected={true}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedResult(null); setTvSeasons(null); setSelectedSeasons([]); } }}
                        onClick={() => { setSelectedResult(null); setTvSeasons(null); setSelectedSeasons([]); }}
                        title="Click to change selection"
                      >
                        {selectedResult.poster ? (
                          <PosterImg src={selectedResult.poster} alt={selectedResult.title} />
                        ) : (
                          <PosterPlaceholder>N/A</PosterPlaceholder>
                        )}
                        <ResultInfo>
                          <ResultTitle>{selectedResult.title}</ResultTitle>
                          <ResultYear>{selectedResult.year}</ResultYear>
                        </ResultInfo>
                      </ResultItem>
                    </ResultListBox>
                  )}
                </FormGroup>
              </GroupBox>

              <GroupBox label="Type" style={{ marginTop: "var(--space-150)" }}>
                <RadioRow>
                  <Radio
                    checked={type === "movie"}
                    onChange={() => setType("movie")}
                    name="type"
                    value="movie"
                    label="Movie"
                  />
                  <Radio
                    checked={type === "series"}
                    onChange={() => setType("series")}
                    name="type"
                    value="series"
                    label="Series"
                  />
                </RadioRow>
              </GroupBox>

              {selectedResult?.mediaType === "tv" && (
                <GroupBox label="Season" style={{ marginTop: "var(--space-150)" }}>
                  {isLoadingSeasons ? (
                    <div style={{ fontSize: "var(--text-md)", padding: "var(--space-50) 0", color: "var(--fg-subtle)" }}>
                      Checking Plex…
                    </div>
                  ) : tvSeasons && tvSeasons.length > 0 ? (
                    <>
                      <SeasonList role="listbox" aria-label="Select seasons" aria-multiselectable="true">
                        <SeasonRow
                          $selected={selectedSeasons.length === 0}
                          tabIndex={0}
                          role="option"
                          aria-selected={selectedSeasons.length === 0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedSeasons([]); }}
                          onClick={() => setSelectedSeasons([])}
                        >
                          <SeasonName>All seasons</SeasonName>
                          <SeasonEpisodes $selected={selectedSeasons.length === 0}>
                            {selectedSeasons.length === 0 ? "selected" : "click to deselect all"}
                          </SeasonEpisodes>
                        </SeasonRow>
                        {tvSeasons.map((s) => {
                          const isSelected = selectedSeasons.includes(s.number);
                          return (
                            <SeasonRow
                              key={s.number}
                              $selected={isSelected}
                              $available={s.available}
                              tabIndex={0}
                              role="option"
                              aria-selected={isSelected}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                  setSelectedSeasons((prev) =>
                                    prev.includes(s.number)
                                      ? prev.filter((n) => n !== s.number)
                                      : [...prev, s.number]
                                  );
                              }}
                              onClick={() =>
                                setSelectedSeasons((prev) =>
                                  prev.includes(s.number)
                                    ? prev.filter((n) => n !== s.number)
                                    : [...prev, s.number]
                                )
                              }
                            >
                              <SeasonName>{s.name}</SeasonName>
                              {s.available && <PlexTag>On Plex</PlexTag>}
                              <SeasonEpisodes $selected={isSelected}>
                                {s.episodeCount} ep.
                              </SeasonEpisodes>
                            </SeasonRow>
                          );
                        })}
                      </SeasonList>

                    </>
                  ) : null}
                </GroupBox>
              )}

              <GroupBox label="Your name" style={{ marginTop: "var(--space-150)" }}>
                <TextInput
                  ref={nameRef}
                  id="name-input"
                  aria-label="Your name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  placeholder="John Doe"
                />
              </GroupBox>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: "var(--space-200)", gap: "var(--space-50)" }}>
                <Button
                  type="submit"
                  primary
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                {isRateLimited && (
                  <span style={{ fontSize: "var(--text-md)", color: "var(--fg-subtle)" }}>
                    {COOLDOWN_MESSAGES[Math.min(cooldownOffense - 1, COOLDOWN_MESSAGES.length - 1)]} {cooldownRemaining}s.
                  </span>
                )}
              </div>
            </form>
          </WindowContent>
        </Window>

        {showPlexWarning && plexMatch && (
          <StatusOverlay>
            <Window style={{ width: "min(var(--modal-w), calc(100vw - 2rem))" }}>
              <WindowHeader style={{ display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1 }}>Already on Plex</span>
                <Button aria-label="Close" onClick={() => setShowPlexWarning(false)}>X</Button>
              </WindowHeader>
              <WindowContent>
                <p style={{ fontSize: "0.84375rem", margin: "0 0 var(--space-200) 0" }}>
                  <strong>{plexMatch.title}{plexMatch.year ? ` (${plexMatch.year})` : ""}</strong>
                  {plexMatch.type === "show"
                    ? " is (partially) available on Plex. Check the seasons below — green means already available."
                    : " is already available on Plex."
                  }
                  {" "}You can still submit a request if you think something is missing or wrong.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-100)" }}>
                  <Button onClick={() => { setShowPlexWarning(false); setTimeout(() => titleRef.current?.focus(), 50); }} primary>OK</Button>
                </div>
              </WindowContent>
            </Window>
          </StatusOverlay>
        )}

        {showBsod && (
          <Bsod onClick={() => setShowBsod(false)} onKeyDown={() => setShowBsod(false)}>
            <BsodInner>
              <p style={{ marginBottom: "var(--space-300)" }}>
                <BsodHighlight>Windows</BsodHighlight>
              </p>
              <p style={{ marginBottom: "var(--space-200)" }}>
                A fatal exception 0E has occurred at 0028:C15F4B21 in MS Maas95.
                The current application will be terminated.
              </p>
              <p style={{ marginBottom: "var(--space-300)" }}>
                * Press any key to terminate the current application.<br />
                * Press CTRL+ALT+DEL to restart your computer. You will<br />
                &nbsp;&nbsp;lose any unsaved information in all applications.
              </p>
              <p style={{ marginBottom: "var(--space-400)", color: "var(--fg-bsod-highlight)" }}>
                Error: MAAS_REQUEST_KERNEL_PANIC (0x0000006B)<br />
                0x00000000 0x00000000 0x00000000 0x00000000
              </p>
              <p style={{ animation: "blink 1s step-start infinite" }}>
                Press any key to continue <span style={{ borderBottom: "var(--space-25) solid var(--bg-default)" }}>_</span>
              </p>
              <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
            </BsodInner>
          </Bsod>
        )}

        {showLogout && (
          <StatusOverlay>
            <Window style={{ width: "min(var(--modal-w), calc(100vw - 2rem))" }}>
              <WindowHeader style={{ display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1 }}>MS Maas</span>
                <Button aria-label="Close" onClick={() => setShowLogout(false)}>X</Button>
              </WindowHeader>
              <WindowContent>
                <p style={{ fontSize: "var(--text-base)", margin: "0 0 var(--space-250) 0" }}>
                  Are you sure you want to log out of MS Maas?
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-100)" }}>
                  <Button primary onClick={() => { sessionStorage.removeItem("maas95_loaded"); window.location.href = "/"; }}>
                    OK
                  </Button>
                  <Button onClick={() => setShowLogout(false)}>
                    Cancel
                  </Button>
                </div>
              </WindowContent>
            </Window>
          </StatusOverlay>
        )}

        {submitStatus !== "idle" && (
          <StatusOverlay>
            <Window style={{ width: "min(var(--modal-w), calc(100vw - 2rem))" }}>
              <WindowHeader>
                <span>{submitStatus === "success" ? "Request Submitted" : "Error"}</span>
              </WindowHeader>
              <WindowContent>
                <p style={{ fontSize: "var(--text-md)", margin: "0 0 var(--space-250) 0" }}>
                  {submitStatus === "success"
                    ? "Your request has been submitted successfully."
                    : "Something went wrong. Please try again."}
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={handleStatusDismiss} primary>
                    OK
                  </Button>
                </div>
              </WindowContent>
            </Window>
          </StatusOverlay>
        )}
      </Desktop>
      <Taskbar windowTitle="MS Maas — Submit Request" onShutDown={() => setShowLogout(true)} />
    </ThemeProvider>
  );
};

export default RequestPage;
