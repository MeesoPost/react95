"use client";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
  styleReset,
} from "react95";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import { useState } from "react";
import { Paragraph } from "@utrecht/component-library-react";

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body {
    background-color: teal;
  }
`;

const App: () => JSX.Element = () => {
  const [state, setState] = useState({
    value: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setState({ value: e.target.value });
  const reset = () => setState({ value: "" });

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <Window resizable className="window">
          <WindowHeader className="window-title">
            <span>Welcome to MS Maas</span>
            <Button>?</Button>
            <Button>X</Button>
          </WindowHeader>
          <WindowContent>
            <p>
              Type a user name and password to log on to the MS Maas system.
            </p>
            <Paragraph>User name:</Paragraph>
            <TextInput value={state.value} onChange={handleChange} fullWidth />
            <Paragraph>Password:</Paragraph>
            <TextInput
              className="TextInput"
              value={state.value}
              onChange={handleChange}
              type="password"
              fullWidth
            />
          </WindowContent>
        </Window>
      </ThemeProvider>
    </div>
  );
};

export default App;
