"use client"; // Move this to the top of the file as per Next.js conventions
import React, { useState } from "react";
import {
  AppBar,
  Button,
  MenuList,
  MenuListItem,
  Separator,
  TextInput,
  Toolbar,
} from "react95";

import styled, { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import { Document, PageContent } from "@utrecht/component-library-react";
import "@react95/icons/icons.css";
import { Logo } from "@react95/icons";

// Move the Wrapper style and Storybook configuration outside the component function
const Wrapper = styled.div`
  padding: 5rem;
  background: ${({ theme }) => theme.desktopBackground};
`;

// Main component function
function App() {
  const [open, setOpen] = useState(false);

  return (
    <Document className="Document">
      <ThemeProvider theme={original}>
        <PageContent className="PageContent">
          <AppBar>
            <Toolbar style={{ justifyContent: "space-between" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Button
                  onClick={() => setOpen(!open)}
                  active={open}
                  style={{ fontWeight: "bold" }}
                >
                  <Logo></Logo>
                  Start
                </Button>
                {open && (
                  <MenuList
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "100%",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    <MenuListItem>
                      <span role="img" aria-label="👨‍💻">
                        👨‍💻
                      </span>
                      Profile
                    </MenuListItem>
                    <MenuListItem>
                      <span role="img" aria-label="📁">
                        📁
                      </span>
                      My account
                    </MenuListItem>
                    <Separator />
                    <MenuListItem disabled>
                      <span role="img" aria-label="🔙">
                        🔙
                      </span>
                      Logout
                    </MenuListItem>
                  </MenuList>
                )}
              </div>

              <TextInput placeholder="Search..." width={150} />
            </Toolbar>
          </AppBar>
        </PageContent>
      </ThemeProvider>
    </Document>
  );
}

// Export both the component and the Storybook configuration
export default App;
