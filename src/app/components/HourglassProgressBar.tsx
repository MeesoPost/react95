import React from "react";
import styled, { keyframes } from "styled-components";
import { ProgressBar, Hourglass } from "react95";

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 300px;
`;

const HourglassWrapper = styled.div<{ $isAnimating: boolean }>`
  animation: ${rotateAnimation} 2s linear infinite;
  animation-play-state: ${(props) => (props.$isAnimating ? "running" : "paused")};
`;

interface HourglassProgressBarProps {
  value: number;
}

const HourglassProgressBar: React.FC<HourglassProgressBarProps> = ({ value }) => {
  return (
    <Wrapper>
      <HourglassWrapper $isAnimating={value < 100}>
        <Hourglass size={32} />
      </HourglassWrapper>
      <ProgressBar variant="tile" value={value} style={{ width: "100%" }} />
    </Wrapper>
  );
};

export default HourglassProgressBar;
