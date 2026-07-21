"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THEME_MAP = void 0;
exports.getThemeForIndustry = getThemeForIndustry;
exports.THEME_MAP = {
    "Healthcare/Dentistry": {
        hue_primary: "195", // Trustworthy Teal-Blue
        hue_secondary: "160", // Clean Mint
        font_heading: "'Outfit', sans-serif",
        font_body: "'Inter', sans-serif"
    },
    "Food/Bakery": {
        hue_primary: "35", // Warm Amber
        hue_secondary: "15", // Soft Terracotta
        font_heading: "'Playfair Display', serif",
        font_body: "'Plus Jakarta Sans', sans-serif"
    },
    "Tech/Startup": {
        hue_primary: "250", // Vibrant Purple-Blue
        hue_secondary: "320", // Neon Pink
        font_heading: "'Space Grotesk', sans-serif",
        font_body: "'Inter', sans-serif"
    },
    "Law/Legal": {
        hue_primary: "215", // Conservative Navy
        hue_secondary: "45", // Gold accent
        font_heading: "'Merriweather', serif",
        font_body: "'Roboto', sans-serif"
    }
};
/**
 * Returns a complete HSL theme config based on industry.
 * Implements a graceful fallback to a neutral, professional theme if not found.
 */
function getThemeForIndustry(industry, tone) {
    const matched = exports.THEME_MAP[industry];
    if (matched) {
        return matched;
    }
    // Default neutral business theme fallback
    return {
        hue_primary: "220", // Trustworthy navy
        hue_secondary: "200", // Accent slate blue
        font_heading: "'Inter', sans-serif",
        font_body: "'Inter', sans-serif"
    };
}
