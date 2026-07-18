import type { CSSProperties } from "react";
import { NUTRITION_COLORS } from "./nutritionColors";

type ThemeProperties = CSSProperties &
  Record<`--theme-${string}` | `--nutrition-${string}`, string>;

const readThemeValue = (name: string, fallback: string) => {
  const value = process.env[name]?.trim();

  // These values are rendered as CSS custom properties. Exclude CSS
  // delimiters so a malformed environment value cannot escape its declaration.
  if (!value || value.length > 160 || /[;{}]/.test(value)) {
    return fallback;
  }

  return value;
};

const fontFamily = readThemeValue(
  "NEXT_PUBLIC_THEME_FONT_FAMILY",
  "Comfortaa",
);

const resolvedFontFamily =
  fontFamily.replace(/["']/g, "").toLowerCase() === "comfortaa"
    ? "var(--font-comfortaa), ui-rounded, system-ui, sans-serif"
    : fontFamily;

export const themeStyle: ThemeProperties = {
  "--nutrition-calories": NUTRITION_COLORS.calories,
  "--nutrition-protein": NUTRITION_COLORS.protein,
  "--nutrition-carbs": NUTRITION_COLORS.carbs,
  "--nutrition-fiber": NUTRITION_COLORS.fiber,
  "--nutrition-fat": NUTRITION_COLORS.fat,
  "--theme-font-family": resolvedFontFamily,
  "--theme-primary": readThemeValue(
    "NEXT_PUBLIC_THEME_PRIMARY",
    "#166534",
  ),
  "--theme-primary-hover": readThemeValue(
    "NEXT_PUBLIC_THEME_PRIMARY_HOVER",
    "color-mix(in srgb, var(--theme-primary) 85%, black)",
  ),
  "--theme-primary-active": readThemeValue(
    "NEXT_PUBLIC_THEME_PRIMARY_ACTIVE",
    "color-mix(in srgb, var(--theme-primary) 72%, black)",
  ),
  "--theme-primary-soft": readThemeValue(
    "NEXT_PUBLIC_THEME_PRIMARY_SOFT",
    "color-mix(in srgb, var(--theme-primary) 14%, white)",
  ),
  "--theme-on-primary": readThemeValue(
    "NEXT_PUBLIC_THEME_ON_PRIMARY",
    "#ffffff",
  ),
  "--theme-background": readThemeValue(
    "NEXT_PUBLIC_THEME_BACKGROUND",
    "#f8faf9",
  ),
  "--theme-surface": readThemeValue(
    "NEXT_PUBLIC_THEME_SURFACE",
    "#ffffff",
  ),
  "--theme-text": readThemeValue("NEXT_PUBLIC_THEME_TEXT", "#1f2937"),
  "--theme-muted": readThemeValue("NEXT_PUBLIC_THEME_MUTED", "#6b7280"),
  "--theme-border": readThemeValue("NEXT_PUBLIC_THEME_BORDER", "#d1d5db"),
  "--theme-danger": readThemeValue("NEXT_PUBLIC_THEME_DANGER", "#b91c1c"),
};
