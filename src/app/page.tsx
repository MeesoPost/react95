"use client";
import React, { useState, useRef } from "react";
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

  @media (min-width: 768px) {
    zoom: 1.15;
  }
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

const FieldError = styled.p`
  color: #c0000c;
  font-family: "MS Sans Serif", sans-serif;
  font-size: 11px;
  margin: 3px 0 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "⚠";
    font-size: 10px;
  }
`;

const App: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [credentialsError, setCredentialsError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateUsername = (val: string) => {
    if (!val.trim()) { setUsernameError("Enter your username."); return false; }
    setUsernameError(""); return true;
  };

  const validatePassword = (val: string) => {
    if (!val) { setPasswordError("Enter your password."); return false; }
    setPasswordError(""); return true;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError("");
    const uOk = validateUsername(username);
    const pOk = validatePassword(password);
    if (!uOk) { usernameRef.current?.focus(); return; }
    if (!pOk) { passwordRef.current?.focus(); return; }
    if (username === "admin" && password === "password") {
      router.push("/request");
    } else {
      setCredentialsError("The username or password is incorrect. Try again.");
      usernameRef.current?.focus();
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
                <p style={{ margin: 0, fontSize: 13.5, fontFamily: "MS Sans Serif, sans-serif" }}>
                  Type a user name and password to log on to MS Maas.
                </p>
              </FlexContainer>
              <Label>User name:</Label>
              {usernameError && <FieldError id="username-error" role="alert">{usernameError}</FieldError>}
              <TextInput
                ref={usernameRef}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setCredentialsError(""); }}
                onBlur={(e) => validateUsername(e.target.value)}
                aria-invalid={!!usernameError || !!credentialsError}
                aria-describedby={usernameError ? "username-error" : credentialsError ? "credentials-error" : undefined}
                fullWidth
              />
              <Label style={{ marginTop: 12 }}>Password:</Label>
              {passwordError && <FieldError id="password-error" role="alert">{passwordError}</FieldError>}
              <TextInput
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setCredentialsError(""); }}
                onBlur={(e) => validatePassword(e.target.value)}
                aria-invalid={!!passwordError || !!credentialsError}
                aria-describedby={passwordError ? "password-error" : credentialsError ? "credentials-error" : undefined}
                fullWidth
              />
              {credentialsError && <FieldError id="credentials-error" role="alert" style={{ marginTop: 8 }}>{credentialsError}</FieldError>}
              <ButtonRow>
                <Button type="submit" primary>
                  OK
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setUsernameError("");
                    setPasswordError("");
                    setCredentialsError("");
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
