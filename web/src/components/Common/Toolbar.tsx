import styled from "styled-components";
import { GridContainer } from "./Containers";
import { ButtonWithIcon } from "components/Forms/Button";

export const Toolbar = styled(GridContainer)`
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xs};
  overflow-x: auto;
  overflow-y: hidden;
  > .spacer {
    display: inline-block;
    width: 1px;
    height: 32px;
    background-color: ${({ theme }) => theme.colors.semitransparent};
    right: 0;
  }
  .material-icons {
    font-size: ${({ theme }) => theme.sizes.md};
  }
`;
export const ToolbarButton = styled(ButtonWithIcon)`
  padding: ${({ theme }) => `${theme.sizes.sm}`};
  .text {
    ${({ theme }) => theme.mixins.ellipsis};
    font-size: 0.5rem;
    text-transform: uppercase;
  }
`;
