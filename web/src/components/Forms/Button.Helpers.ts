import { ComponentPropsWithRef } from "react";
import { AppTheme } from "shared";

export interface SharedButtonProps {
  /** Application Theme */
  theme: AppTheme;
  /** Circular button when `true` */
  round?: boolean;
  /** Button size preset */
  size?: "sm" | "md" | "lg";
  /** Button theme preset */
  variant?: "accent" | "outlined" | "transparent";
}
type AllButtonProps = ComponentPropsWithRef<"button"> & SharedButtonProps;

export default AllButtonProps;

export function bgColor({ theme, variant, disabled }: AllButtonProps) {
  switch (true) {
    case ["outlined", "transparent"].includes(variant as string):
    case disabled: {
      return "transparent";
    }
    case !variant:
    case variant === "accent": {
      return theme.colors.accent;
    }
    default:
      return "white";
  }
}

export function bgColorHover({ theme, variant, disabled }: AllButtonProps) {
  if (variant === "transparent") return theme.colors.semitransparent;
  return bgColor({ theme, variant, disabled });
}

export function border({ variant, disabled, theme }: AllButtonProps) {
  if (variant === "transparent") return 0;
  const style = disabled ? "dotted" : "solid";
  const borderColor = variant === "outlined" ? textColor : bgColor;
  return `1px ${style} ${borderColor({ theme, variant, disabled })}`;
}

export function padding({ theme, size, round }: SharedButtonProps) {
  const { sizes } = theme;
  if (round) return "0.8rem";
  return size === "sm" ? sizes.xs : sizes.sm;
}

export function borderRadius({ theme, round }: SharedButtonProps) {
  if (round) return "100%";
  const { round: corners } = theme.presets;
  return corners.sm;
}

export function textColor({ variant, disabled, theme }: AllButtonProps) {
  const { primary, accent } = theme.colors;
  if (disabled) return accent;
  return variant === "outlined" ? primary : "#fff";
}

export function textShadow({ variant, theme }: SharedButtonProps) {
  if (variant === "transparent") {
    return `${theme.presets.elevate.xs} #222`;
  }
  return `${theme.presets.elevate.xxs} #2226`;
}

export function width({ theme, size, round }: SharedButtonProps) {
  if (round) return theme.sizes.lg;
  return size === "lg" ? "100%" : "initial";
}
