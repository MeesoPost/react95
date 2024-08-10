"use client";
import React, { useState } from "react";
import {
  Button,
  TextInput,
  Window,
  WindowContent,
  WindowHeader,
  List,
  ListItem,
  Divider,
} from "react95";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import {
  Document,
  PageContent,
  Paragraph,
} from "@utrecht/component-library-react";
import "@react95/icons/icons.css";
import { Password1010, Computer3, Folder } from "@react95/icons";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const StyledWindow = styled(Window)`
  width: 400px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const IconWrapper = styled.div`
  margin-right: 20px;
`;

const App: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDesktop, setShowDesktop] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "password") {
      setError("");
      setShowDesktop(true);
    } else {
      setError("Invalid username or password");
    }
  };

  if (showDesktop) {
    return (
      <Document className="Document">
        <ThemeProvider theme={original}>
          <PageContent className="PageContent">
            <StyledWindow resizable className="window">
              <WindowHeader className="window-title">
                <span>MS Maas Desktop</span>
                <Button>X</Button>
              </WindowHeader>
              <WindowContent>
                <List>
                  <ListItem>
                    <Computer3 variant="32x32_4" />
                    My Computer
                  </ListItem>
                  <ListItem>
                    <Folder variant="32x32_4" />
                    My Documents
                  </ListItem>
                  <Divider />
                  <ListItem onClick={() => router.push("/request")}>
                    <Password1010 variant="32x32_4" />
                    Submit Request
                  </ListItem>
                </List>
              </WindowContent>
            </StyledWindow>
          </PageContent>
        </ThemeProvider>
      </Document>
    );
  }

  return (
    <Document className="Document">
      <ThemeProvider theme={original}>
        <PageContent className="PageContent">
          <StyledWindow resizable className="window">
            <WindowHeader className="window-title">
              <span>Welcome to MS Maas</span>
              <Button>?</Button>
              <Button>X</Button>
            </WindowHeader>
            <WindowContent>
              <form onSubmit={handleLogin}>
                <FlexContainer>
                  <IconWrapper>
                    <Password1010 variant="32x32_4" />
                  </IconWrapper>
                  <p>
                    Type a user name and password to log on to the MS Maas
                    system.
                  </p>
                </FlexContainer>
                <Paragraph>User name:</Paragraph>
                <TextInput
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                />
                <Paragraph>Password:</Paragraph>
                <TextInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
                {error && (
                  <Paragraph style={{ color: "red" }}>{error}</Paragraph>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}
                >
                  <Button type="submit" primary>
                    OK
                  </Button>
                  <Button
                    onClick={() => {
                      setUsername("");
                      setPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </WindowContent>
          </StyledWindow>
        </PageContent>
      </ThemeProvider>
    </Document>
  );
};

export default App;
