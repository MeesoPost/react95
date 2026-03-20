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
  padding: 16px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding-bottom: 64px;
    > * {
      zoom: 1.2;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 4px;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const LoadingText = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: 11px;
  color: #000;
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
  gap: 24px;
  margin-top: 4px;
`;

const StatusOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
`;

const Bsod = styled.div`
  position: fixed;
  inset: 0;
  background: #0000aa;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  padding: 48px;
  box-sizing: border-box;
`;

const BsodInner = styled.div`
  max-width: 640px;
  width: 100%;
  font-size: 14px;
  line-height: 1.6;
`;

const BsodHighlight = styled.span`
  background: #aaaaaa;
  color: #0000aa;
  padding: 0 4px;
`;
  
const SearchButton = styled(Button)<{ $active: boolean }>`
  ${(p) => p.$active && `
    outline: 3px dashed #001441;
    outline-offset: 2px;
  `}
`;

const ResultListBox = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 2px solid;
  border-color: #808080 #fff #fff #808080;
  background: #fff;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
`;

const ResultItem = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  background: ${(p) => (p.$selected ? "#000080" : "transparent")};
  color: ${(p) => (p.$selected ? "#fff" : "#000")};
  font-size: 11px;

  &:hover {
    background: ${(p) => (p.$selected ? "#000080" : "#c0c0c0")};
  }
`;

const PosterImg = styled.img`
  width: 32px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #808080;
`;

const PosterPlaceholder = styled.div`
  width: 32px;
  height: 48px;
  flex-shrink: 0;
  background: #c0c0c0;
  border: 1px solid #808080;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #808080;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ResultTitle = styled.span`
  font-size: 11px;
  font-weight: bold;
  white-space: normal;
  word-break: break-word;
`;

const ResultYear = styled.span`
  font-size: 10px;
  opacity: 0.8;
`;

const SelectionConfirm = styled.div`
  margin-top: 6px;
  padding: 4px 8px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fff #808080 #808080 #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
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
  const [showBsod, setShowBsod] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownOffense, setCooldownOffense] = useState(0);

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
        <Window style={{ width: "min(520px, 100%)" }}>
          <WindowHeader className="window-title" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ flex: 1 }}>MS Maas — Submit Request</span>
            <Button onClick={() => setShowBsod(true)}>?</Button>
            <Button onClick={() => setShowLogout(true)}>X</Button>
          </WindowHeader>
          <WindowContent>
            <form onSubmit={handleSubmit}>
              <GroupBox label="Title">
                <FormGroup>
                  <SearchRow>
                    <TextInput
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
                      }}
                    >
                      Clear
                    </Button>
                  </SearchRow>

                  {searchResults.length > 0 && !selectedResult && (
                    <ResultListBox>
                      {searchResults.map((r) => (
                        <ResultItem
                          key={r.id}
                          $selected={false}
                          onClick={() => { setSelectedResult(r); setTimeout(() => nameRef.current?.focus(), 50); }}
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
                    <ResultListBox>
                      <ResultItem
                        $selected={true}
                        onClick={() => { setSelectedResult(null); }}
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

              <GroupBox label="Type" style={{ marginTop: 12 }}>
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

              <GroupBox label="Your name" style={{ marginTop: 12 }}>
                <TextInput
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  placeholder="John Doe"
                />
              </GroupBox>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 16, gap: 4 }}>
                <Button
                  type="submit"
                  primary
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                {isRateLimited && (
                  <span style={{ fontSize: 11, color: "#808080" }}>
                    {COOLDOWN_MESSAGES[Math.min(cooldownOffense - 1, COOLDOWN_MESSAGES.length - 1)]} {cooldownRemaining}s.
                  </span>
                )}
              </div>
            </form>
          </WindowContent>
        </Window>

        {showBsod && (
          <Bsod onClick={() => setShowBsod(false)} onKeyDown={() => setShowBsod(false)}>
            <BsodInner>
              <p style={{ marginBottom: 24 }}>
                <BsodHighlight>Windows</BsodHighlight>
              </p>
              <p style={{ marginBottom: 16 }}>
                A fatal exception 0E has occurred at 0028:C15F4B21 in MS Maas95.
                The current application will be terminated.
              </p>
              <p style={{ marginBottom: 24 }}>
                * Press any key to terminate the current application.<br />
                * Press CTRL+ALT+DEL to restart your computer. You will<br />
                &nbsp;&nbsp;lose any unsaved information in all applications.
              </p>
              <p style={{ marginBottom: 32, color: "#aaaaaa" }}>
                Error: MAAS_REQUEST_KERNEL_PANIC (0x0000006B)<br />
                0x00000000 0x00000000 0x00000000 0x00000000
              </p>
              <p style={{ animation: "blink 1s step-start infinite" }}>
                Press any key to continue <span style={{ borderBottom: "2px solid #fff" }}>_</span>
              </p>
              <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
            </BsodInner>
          </Bsod>
        )}

        {showLogout && (
          <StatusOverlay>
            <Window style={{ width: "min(360px, calc(100vw - 32px))" }}>
              <WindowHeader style={{ display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1 }}>MS Maas</span>
                <Button onClick={() => setShowLogout(false)}>X</Button>
              </WindowHeader>
              <WindowContent>
                <p style={{ fontSize: 14, margin: "0 0 20px 0" }}>
                  Are you sure you want to log out of MS Maas?
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
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
            <Window style={{ width: "min(360px, calc(100vw - 32px))" }}>
              <WindowHeader>
                <span>{submitStatus === "success" ? "Request Submitted" : "Error"}</span>
              </WindowHeader>
              <WindowContent>
                <p style={{ fontSize: 11, margin: "0 0 20px 0" }}>
                  {submitStatus === "success"
                    ? "Your request has been submitted successfully. You will receive a confirmation email shortly."
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
