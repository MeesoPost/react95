import React from "react";
import styled, { keyframes } from "styled-components";
import { ProgressBar, Hourglass } from "react95";

const rotateAnimation = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

const HourglassWrapper = styled.div<{ isAnimating: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ${rotateAnimation} 2s linear infinite;
  animation-play-state: ${(props) =>
    props.isAnimating ? "running" : "paused"};
`;

const ProgressWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 40px; // Adjust this value to match the height of your ProgressBar
  margin: 40px auto 20px;
`;

interface HourglassProgressBarProps {
  value: number;
}

const HourglassProgressBar: React.FC<HourglassProgressBarProps> = ({
  value,
}) => {
  return (
    <ProgressWrapper>
      <HourglassWrapper isAnimating={value < 100}>
        <Hourglass size={32} />
      </HourglassWrapper>
      <ProgressBar variant="tile" value={value} />
    </ProgressWrapper>
  );
};

export default HourglassProgressBar;
