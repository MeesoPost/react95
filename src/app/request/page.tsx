"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  ProgressBar,
  Window,
  WindowContent,
  WindowHeader,
  Select,
} from "react95";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import styled from "styled-components";
import {
  Document,
  PageContent,
  Paragraph,
} from "@utrecht/component-library-react";
import "@react95/icons/icons.css";
import HourglassProgressBar from "../components/HourGlassProgressbar"; // Make sure to create this file

const StyledProgressBar = styled(ProgressBar)`
  width: 300px;
  margin: 20px auto;
`;

const StyledSelect = styled(Select)`
  width: 300px;
  margin-bottom: 16px;

  .react-select__control {
    width: 300px;
  }

  .react-select__menu {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
  }

  .react-select__option {
    white-space: normal;
    word-wrap: break-word;
    padding: 8px;
    font-size: 14px;
  }

  .react-select__single-value {
    white-space: normal;
    word-wrap: break-word;
    max-width: 100%;
    right: 0;
    max-height: none;
    overflow: visible;
  }

  .react-select__value-container {
    padding: 0 8px;
  }

  .react-select__menu-list {
    max-height: 300px;
  }
`;
const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const StyledTextInput = styled(TextInput)`
  width: 100%;
  margin-bottom: 8px;
`;

const SearchButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;
`;

const LoadingText = styled.div`
  text-align: center;
  margin-top: 10px;
  font-family: "MS Sans Serif", sans-serif;
  color: #000;
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledWindowContent = styled(WindowContent)`
  width: 700px;
  max-width: 100%;
`;

const RequestPage: React.FC = () => {
  const [percent, setPercent] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [title, setTitle] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("movie");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: number; title: string; year: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const phases = [
      { target: 30, speed: 1000 },
      { target: 60, speed: 1500 },
      { target: 80, speed: 2000 },
      { target: 98, speed: 2500 },
      { target: 100, speed: 1000 },
    ];

    const animate = (phase: number) => {
      if (phase >= phases.length) {
        setTimeout(() => setPercent(110), 500);
        return;
      }

      const { target, speed } = phases[phase];
      const start = percent;
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / speed);
        const currentPercent = start + (target - start) * progress;

        setPercent(currentPercent);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setLoadingPhase(phase + 1);
        }
      };

      requestAnimationFrame(tick);
    };

    animate(loadingPhase);
  }, [loadingPhase, percent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", {
      email,
      title: selectedTitle || title,
      type,
    });
    // TODO: Implement form submission logic
  };

  const handleSearch = async () => {
    if (!title) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      setSearchResults(
        data.results.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          year: item.release_date
            ? new Date(item.release_date).getFullYear().toString()
            : "N/A",
        }))
      );
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Document className="Document">
      <ThemeProvider theme={original}>
        <PageContent className="PageContent">
          {percent < 100 && (
            <CenteredContent>
              <HourglassProgressBar value={Math.floor(percent)} />
              <LoadingText>
                {loadingPhase === 0 && "Initializing..."}
                {loadingPhase === 1 && "Loading resources..."}
                {loadingPhase === 2 && "Preparing interface..."}
                {loadingPhase === 3 && "Almost there..."}
                {loadingPhase === 4 && "Finalizing..."}
              </LoadingText>
            </CenteredContent>
          )}
          {percent === 110 && (
            <Window resizable className="window">
              <WindowHeader className="window-title">
                <span>MS Maas - Submit Request</span>
                <Button>?</Button>
                <Button>X</Button>
              </WindowHeader>
              <StyledWindowContent>
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Paragraph>Title:</Paragraph>
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                      <StyledTextInput
                        value={selectedTitle || title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setSelectedTitle("");
                        }}
                        style={{ flexGrow: 1, marginRight: "8px" }}
                      />
                      <Button
                        onClick={() => {
                          setTitle("");
                          setSelectedTitle("");
                          setSearchResults([]);
                        }}
                        style={{ minWidth: "80px" }}
                      >
                        Clear
                      </Button>
                    </div>
                    <SearchButton
                      primary
                      onClick={handleSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </SearchButton>

                    {searchResults.length > 0 && (
                      <StyledSelect
                        options={[
                          { value: "", label: "Select a movie/series" },
                          ...searchResults.map((result) => ({
                            value: result.id.toString(),
                            label: `${result.title} (${result.year})`,
                          })),
                        ]}
                        onChange={(selectedOption) => {
                          if (selectedOption) {
                            const selected = selectedOption as {
                              label: string;
                              value: string;
                            };
                            if (selected.value === "") {
                              setSelectedTitle("");
                              setTitle("");
                            } else {
                              setSelectedTitle(selected.label);
                              setTitle(selected.label);
                            }
                          }
                        }}
                        value={
                          selectedTitle
                            ? { label: selectedTitle, value: selectedTitle }
                            : { value: "", label: "Select a movie/series" }
                        }
                      />
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Paragraph>Type:</Paragraph>
                    <StyledSelect
                      options={[
                        { value: "movie", label: "Movie" },
                        { value: "series", label: "Series" },
                      ]}
                      onChange={(value) =>
                        setType((value as { value: string }).value)
                      }
                      value={type}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Paragraph>Email:</Paragraph>
                    <StyledTextInput
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>

                  <Button type="submit" primary>
                    Submit Request
                  </Button>
                </form>
              </StyledWindowContent>
            </Window>
          )}
        </PageContent>
      </ThemeProvider>
    </Document>
  );
};

export default RequestPage;
