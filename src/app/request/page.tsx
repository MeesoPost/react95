"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  ProgressBar,
  Window,
  WindowContent,
  WindowHeader,
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
import { Password1010 } from "@react95/icons";

const StyledProgressBar = styled(ProgressBar)`
  width: 1000px;
  margin-block-start: 350px;
`;

const App = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((prevPercent) => {
        const newPercent = Math.min(prevPercent + Math.random() * 10, 110);
        if (newPercent === 110) {
          // Check if the bar is full
          clearInterval(timer); // Stop the timer when the bar reaches 100%
        }
        return newPercent;
      });
    }, 1000);
  }, []);

  return (
    <Document className="Document">
      <ThemeProvider theme={original}>
        <PageContent className="PageContent">
          {percent < 110 && ( // Show progress bar if it's not full yet
            <StyledProgressBar
              className="progressBar"
              variant="tile"
              value={Math.floor(percent)}
            />
          )}
          {percent === 110 && ( // Show content only when the bar reaches 100%
            <Window resizable className="window">
              <WindowHeader className="window-title">
                <span>Welcome to MS Maas</span>
                <Button>?</Button>
                <Button>X</Button>
              </WindowHeader>
              <WindowContent>
                <Password1010 className="login-icon" />
                <p>
                  Type a user name and password to log on to the MS Maas system.
                </p>
                <Paragraph className="">User name:</Paragraph>
                <TextInput />
                <Paragraph>Password:</Paragraph>
                <TextInput type="password" className="TextInput" />
                <Button primary>OK</Button>
                <Button>Cancel</Button>
              </WindowContent>
            </Window>
          )}
        </PageContent>
      </ThemeProvider>
    </Document>
  );
};

export default App;
