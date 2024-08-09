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

const StyledProgressBar = styled(ProgressBar)`
  width: 1000px;
  margin-block-start: 350px;
`;

const StyledSelect = styled(Select)`
  width: 100%;
  margin-bottom: 16px;
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

const RequestPage: React.FC = () => {
  const [percent, setPercent] = useState(0);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("movie");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((prevPercent) => {
        const newPercent = Math.min(prevPercent + Math.random() * 10, 110);
        if (newPercent === 110) {
          clearInterval(timer);
        }
        return newPercent;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", { title, email, type });
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
          {percent < 110 && (
            <StyledProgressBar
              className="progressBar"
              variant="tile"
              value={Math.floor(percent)}
            />
          )}
          {percent === 110 && (
            <Window resizable className="window">
              <WindowHeader className="window-title">
                <span>MS Maas - Submit Request</span>
                <Button>?</Button>
                <Button>X</Button>
              </WindowHeader>
              <WindowContent>
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Paragraph>Title:</Paragraph>
                    <StyledTextInput
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <SearchButton onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? "Searching..." : "Search"}
                    </SearchButton>

                    {searchResults.length > 0 && (
                      <StyledSelect
                        options={searchResults.map((result) => ({
                          value: result.id.toString(),
                          label: result.title,
                        }))}
                        onChange={(value) =>
                          setTitle((value as { label: string }).label)
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
              </WindowContent>
            </Window>
          )}
        </PageContent>
      </ThemeProvider>
    </Document>
  );
};

export default RequestPage;
