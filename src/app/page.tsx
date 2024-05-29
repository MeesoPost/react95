"use client";
import React from "react";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";

import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import {
  Document,
  PageContent,
  Paragraph,
} from "@utrecht/component-library-react";
import "@react95/icons/icons.css";
import { Password1010 } from "@react95/icons";

const App: () => JSX.Element = () => {
  ({});

  return (
    <Document className="Document">
      <ThemeProvider theme={original}>
        <PageContent className="PageContent">
          <form action="../request" method="POST">
            <Window resizable className="window">
              <WindowHeader className="window-title">
                <span>Welcome to MS Maas</span>
                <Button>?</Button>
                <Button>X</Button>
              </WindowHeader>
              <WindowContent>
                <Password1010 className="login-icon"></Password1010>
                <p>
                  Type a user name and password to log on to the MS Maas system.
                </p>
                <Paragraph>User name:</Paragraph>
                <TextInput />
                <Paragraph>Password:</Paragraph>
                <TextInput type="password" className="TextInput" />
                <Button type="submit" name="OK" primary>
                  OK
                </Button>
                <Button>Cancel</Button>
              </WindowContent>
            </Window>
          </form>
        </PageContent>
      </ThemeProvider>
    </Document>
  );
};

export default App;
