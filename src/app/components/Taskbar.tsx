"use client";
import React, { useState, useEffect, useRef } from "react";
import { AppBar, Toolbar, Button } from "react95";
import styled from "styled-components";

const BottomAppBar = styled(AppBar)`
  top: auto !important;
  bottom: 0;
  height: 48px;
`;

const StartMenu = styled.div`
  position: fixed;
  bottom: 48px;
  left: 0;
  width: 160px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  z-index: 1001;
  box-shadow: 2px 2px 0 #000;
  display: flex;
`;

const MenuSidebar = styled.div`
  width: 20px;
  background: #808080;
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
  flex-shrink: 0;
`;

const MenuSidebarText = styled.span`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: bold;
  color: #c0c0c0;
  letter-spacing: 1px;
`;

const MenuItems = styled.div`
  flex: 1;
  padding: 2px 0;
`;

const MenuItem = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 8px;
  font-size: 11px;
  background: transparent;
  border: none;
  cursor: ${(p) => (p.$disabled ? "default" : "pointer")};
  color: ${(p) => (p.$disabled ? "#808080" : "#000")};
  text-align: left;

  &:hover {
    background: ${(p) => (p.$disabled ? "transparent" : "#000080")};
    color: ${(p) => (p.$disabled ? "#808080" : "#fff")};
  }
  &:focus { outline: none; }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #808080;
  margin: 2px 4px;
  border-bottom: 1px solid #fff;
`;

const AppButton = styled(Button)`
  height: 36px !important;
  font-size: 13px;
  min-width: 160px;
  max-width: 240px;
  padding: 0 8px !important;
  border-top-color: #808080 !important;
  border-left-color: #808080 !important;
  border-right-color: #fff !important;
  border-bottom-color: #fff !important;

  &::before {
    border-top-color: #0a0a0a !important;
    border-left-color: #0a0a0a !important;
    border-right-color: #dfdfdf !important;
    border-bottom-color: #dfdfdf !important;
    box-shadow: none !important;
  }

  &:focus-visible, &::after {
    outline: none !important;
  }
`;

const Clock = styled.div`
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  padding: 2px 8px;
  font-size: 11px;
  min-width: 44px;
  text-align: center;
`;

const WinLogo = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="5" height="5" fill="#f00" />
    <rect x="7" y="0" width="5" height="5" fill="#0f0" />
    <rect x="0" y="7" width="5" height="5" fill="#00f" />
    <rect x="7" y="7" width="5" height="5" fill="#ff0" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="14" height="12" viewBox="0 0 14 12" style={{ flexShrink: 0 }}>
    <rect x="1" y="0" width="12" height="8" fill="none" stroke="#000" strokeWidth="1" />
    <rect x="2" y="1" width="10" height="6" fill="#000080" />
    <rect x="5" y="9" width="4" height="1" fill="#808080" />
    <rect x="3" y="10" width="8" height="1" fill="#808080" />
  </svg>
);

interface TaskbarProps {
  windowTitle: string;
  onShutDown?: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windowTitle, onShutDown }) => {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        startBtnRef.current && !startBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div style={{ display: "none" }} className="taskbar-wrapper">
      <style>{`
        @media (min-width: 768px) {
          .taskbar-wrapper { display: block !important; }
        }
        .taskbar-wrapper button:focus-visible,
        .taskbar-wrapper button::after {
          outline: none !important;
        }
      `}</style>

      {menuOpen && (
        <StartMenu ref={menuRef}>
          <MenuSidebar>
            <MenuSidebarText>MS Maas95</MenuSidebarText>
          </MenuSidebar>
          <MenuItems>
            <MenuItem $disabled>
              <MonitorIcon />
              MS Maas
            </MenuItem>
            <MenuDivider />
            <MenuItem onClick={() => { setMenuOpen(false); onShutDown?.(); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="12" height="12" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
                <line x1="4" y1="4" x2="10" y2="10" stroke="#000" strokeWidth="1.5" />
                <line x1="10" y1="4" x2="4" y2="10" stroke="#000" strokeWidth="1.5" />
              </svg>
              Shut Down...
            </MenuItem>
          </MenuItems>
        </StartMenu>
      )}

      <BottomAppBar>
        <Toolbar style={{ gap: 6, padding: "0 6px", height: "100%", alignItems: "center" }}>
          <Button
            ref={startBtnRef}
            onClick={() => setMenuOpen((v) => !v)}
            active={menuOpen}
            style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 6, height: 36, fontSize: 13, padding: "0 10px", outline: "none" }}
          >
            <WinLogo />
            Start
          </Button>

          <div style={{ width: 2, height: 22, borderLeft: "1px solid #808080", borderRight: "1px solid #fff", margin: "0 2px" }} />

          <AppButton>
            <MonitorIcon />
            <span style={{ marginLeft: 4 }}>{windowTitle}</span>
          </AppButton>

          <div style={{ marginLeft: "auto" }}>
            <Clock>{time}</Clock>
          </div>
        </Toolbar>
      </BottomAppBar>
    </div>
  );
};

export default Taskbar;
