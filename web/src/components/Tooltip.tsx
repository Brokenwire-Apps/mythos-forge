import { MouseEventHandler, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const TooltipContainer = styled.div`
  border-bottom: 1px dotted ${({ theme }) => theme.colors.semitransparent};
  cursor: help;
  display: inline-block;
  overflow: visible;
  position: relative;

  &:hover {
    border-bottom-color: ${({ theme }) => theme.colors.accent};
    > .tooltip-text {
      opacity: 1;
      position: absolute;
      visibility: visible;
    }
  }
`;
const TooltipText = styled.div`
  ${({ theme }) => theme.mixins.lineclamp(7)};
  background-color: black;
  border-radius: 6px;
  color: #fff;
  font-size: initial;
  font-weight: initial;
  left: 50%;
  margin-left: -60px;
  max-height: 400px;
  max-width: 400px;
  opacity: 0;
  padding: ${({ theme }) => theme.sizes.sm};
  pointer-events: none;
  position: fixed;
  top: 100%;
  transition: opacity 0.3s;
  visibility: hidden;
  width: minmax(max-content, 300px);
  z-index: 9;
`;

type TooltipProps = { text: string } & React.ComponentPropsWithRef<"div">;

/** Extremely basic tooltip container (no hovertext positioning) */
const Tooltip = ({ children, text }: TooltipProps) => {
  return (
    <TooltipContainer>
      {children}
      <TooltipText
        className="tooltip-text"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </TooltipContainer>
  );
};

export default Tooltip;
