import { ComponentPropsWithRef } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { MatIcon } from "../Common/Containers";
import AllButtonProps, * as UI from "./Button.Helpers";

const classOverrides = css`
  &.error {
    border-color: transparent;
    &:hover {
      background-color: ${({ theme }) => theme.colors.errorDark};
    }
  }
`;
const defaultButtonCSS = css`
  align-items: center;
  background-color: ${UI.bgColor};
  border-radius: ${UI.borderRadius};
  border: ${UI.border};
  color: ${UI.textColor};
  cursor: pointer;
  display: inline-flex;
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  font-size: 0.8rem;
  margin: 0;
  padding: ${UI.padding};
  place-content: center;
  text-decoration: none;
  transition: border-color 150ms background-color 150ms filter 150ms;
  width: ${UI.width};

  &:not([disabled]):hover {
    background-color: ${UI.bgColorHover};
    box-shadow: 0 1px 0.4em #030630b5;
    filter: drop-shadow(0 0 1.2em #aa64ffaa);
    transform: scale(0.99, 0.99);
    transition: 0.12s linear;
  }

  &[disabled],
  &.disabled {
    transition: none;
    opacity: 0.5;
    cursor: not-allowed;
  }
  ${classOverrides}
`;
const ButtonBase = styled.button<AllButtonProps>`
  ${defaultButtonCSS}
`;
export const Button = styled(ButtonBase)``;
export default Button;

export const ButtonLink = styled.a`
  ${defaultButtonCSS}
  color: inherit;
  padding: ${({ theme }) => theme.sizes.xs};

`;
export const StyledLink = styled(Link)`
  ${defaultButtonCSS}
  color: inherit;
  height: auto;
`;
type WithIconProps = {
  /** Name of Material Icon to apply (e.g. `account_circle`) */
  icon: string;
  /** Link or Button text */
  text: string | JSX.Element;
};
type LinkWithIconProps = Pick<
  ComponentPropsWithRef<"a">,
  "title" | "target" | "href"
> &
  WithIconProps & {
    /** Appends `target=_blank` attribute when true */
    external?: boolean;
  };

/** An anchor tag that looks mostly like the buttons used on the site */
export const LinkWithIcon = (props: LinkWithIconProps) => {
  const { icon, text, external, href = "", ...linkProps } = props;

  return external ? (
    <ButtonLink size="sm" target="_blank" href={href} {...linkProps}>
      <MatIcon icon={icon} />
      {text}
    </ButtonLink>
  ) : (
    <StyledLink to={href} {...linkProps}>
      <MatIcon icon={icon} />
      {text}
    </StyledLink>
  );
};
type ButtonWithIconProps = Partial<AllButtonProps> & WithIconProps;

export const ButtonWithIcon = (props: ButtonWithIconProps) => {
  const { icon, text, ...buttonProps } = props;

  return (
    <Button {...buttonProps}>
      <MatIcon icon={icon} />
      &nbsp;
      {text}
    </Button>
  );
};

export const RoundButton = styled(ButtonBase).attrs({
  round: true,
  size: "lg"
})`
  height: ${UI.width};
  width: ${UI.width};
`;

export const TransparentButton = styled(ButtonBase).attrs({
  variant: "transparent"
})``;

export const WideButton = styled(ButtonBase).attrs({ size: "lg" })`
  bottom: 0;
  position: sticky;
  margin: 0 0 ${({ theme }) => theme.sizes.sm};
  max-width: calc(100% - 2px);
`;
