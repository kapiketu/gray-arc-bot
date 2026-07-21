export interface ThemeConfig {
  hue_primary: string;
  hue_secondary: string;
  font_heading: string;
  font_body: string;
}

export const THEME_MAP: Record<string, ThemeConfig> = {
  "Healthcare/Dentistry": {
    hue_primary: "195",   // Trustworthy Teal-Blue
    hue_secondary: "160", // Clean Mint
    font_heading: "'Outfit', sans-serif",
    font_body: "'Inter', sans-serif"
  },
  "Food/Bakery": {
    hue_primary: "35",    // Warm Amber
    hue_secondary: "15",  // Soft Terracotta
    font_heading: "'Playfair Display', serif",
    font_body: "'Plus Jakarta Sans', sans-serif"
  },
  "Tech/Startup": {
    hue_primary: "250",   // Vibrant Purple-Blue
    hue_secondary: "320", // Neon Pink
    font_heading: "'Space Grotesk', sans-serif",
    font_body: "'Inter', sans-serif"
  },
  "Law/Legal": {
    hue_primary: "215",   // Conservative Navy
    hue_secondary: "45",  // Gold accent
    font_heading: "'Merriweather', serif",
    font_body: "'Roboto', sans-serif"
  }
};

/**
 * Returns a complete HSL theme config based on industry.
 * Implements a graceful fallback to a neutral, professional theme if not found.
 */
export function getThemeForIndustry(industry: string, tone?: string): ThemeConfig {
  const matched = THEME_MAP[industry];
  if (matched) {
    return matched;
  }
  
  // Default neutral business theme fallback
  return {
    hue_primary: "220",     // Trustworthy navy
    hue_secondary: "200",   // Accent slate blue
    font_heading: "'Inter', sans-serif",
    font_body: "'Inter', sans-serif"
  };
}
