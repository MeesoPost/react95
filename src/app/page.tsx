"use client";
import React, { useState } from "react";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import "@react95/icons/icons.css";
import { Password1010 } from "@react95/icons";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const Desktop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
`;

const StyledWindow = styled(Window)`
  width: min(400px, 100%);
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
`;

const Label = styled.p`
  font-family: "MS Sans Serif", sans-serif;
  font-size: 11px;
  margin: 0 0 4px 0;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const ErrorText = styled.p`
  color: red;
  font-family: "MS Sans Serif", sans-serif;
  font-size: 11px;
  margin: 8px 0 0 0;
`;

const App: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "password") {
      router.push("/request");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <ThemeProvider theme={original}>
      <Desktop>
        <StyledWindow>
          <WindowHeader className="window-title" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ flex: 1 }}>Welcome to MS Maas</span>
            <Button>?</Button>
            <Button>X</Button>
          </WindowHeader>
          <WindowContent>
            <form onSubmit={handleLogin}>
              <FlexContainer>
                <Password1010 variant="32x32_4" />
                <p style={{ margin: 0, fontSize: 11, fontFamily: "MS Sans Serif, sans-serif" }}>
                  Type a user name and password to log on to MS Maas.
                </p>
              </FlexContainer>
              <Label>User name:</Label>
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
              <Label style={{ marginTop: 12 }}>Password:</Label>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              {error && <ErrorText>{error}</ErrorText>}
              <ButtonRow>
                <Button type="submit" primary>
                  OK
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </ButtonRow>
            </form>
          </WindowContent>
        </StyledWindow>
      </Desktop>
    </ThemeProvider>
  );
};

export default App;
