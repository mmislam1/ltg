/**
 * Fixed data-visualization colors. These intentionally do not follow the
 * environment-driven brand palette because each nutrient must keep the same
 * meaning throughout charts, reports, and exported PDFs.
 */
export const NUTRITION_COLORS = {
  calories: "#c026d3",
  protein: "#059669",
  carbs: "#2563eb",
  fat: "#dc2626",
} as const;
