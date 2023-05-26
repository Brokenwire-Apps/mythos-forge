import shared, { AppTheme } from "./theme.shared";

const accent = "#2F80B8"; // "#87c0cb", // --sky-blue: #87c0cbff;
const accentDark = "#08419f"; // "#87c0cb", // --sky-blue: #87c0cbff;
const bgColor = "#324965"; // "#101918"; // --eerie-black: #101918ff;
const bgDark = "#091838";
const bgGradientDir = (dir = "45deg") =>
  `linear-gradient(${dir}, ${accentDark}, ${bgDark})`;

/**
 * Define the colors for your application's `dark` theme here.
 * When using styled components, the properties of `DARK_THEME`
 * can be accessed inline using the `theme` object, e.g.:
 *
 * border-color: ${({ theme }) => theme.colors.accent}; // #36b4c7
 */
const DARK_THEME: AppTheme = {
  ...shared,

  colors: {
    ...shared.colors,

    accent,
    bgColor,
    bgGradient: bgGradientDir(),
    bgGradientDir,
    semitransparent: "#6d7c7d60",
    error: "#4a2734", // "#EF476F", // --barn-red: #77100aff;
    errorDark: "#380703", // --black-bean: #380703ff;
    primary: "#e6dad8", // --timberwolf: #e6dad8ff;
    secondary: "#6d7c7d", // --gray: #6d7c7dff;
    warning: "#2b312f" // --onyx: #2b312fff;
  }
};

export default DARK_THEME;
