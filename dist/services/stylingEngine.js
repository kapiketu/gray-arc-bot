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
function getThemeForIndustry(industry, tone) {
    const ind = (industry || '').toLowerCase();
    if (ind.includes('health') || ind.includes('dental') || ind.includes('clinic') || ind.includes('doctor') || ind.includes('medical') || ind.includes('dentist')) {
        return {
            hue_primary: "195", // Trustworthy Teal-Blue
            hue_secondary: "160", // Clean Mint
            font_heading: "'Outfit', sans-serif",
            font_body: "'Inter', sans-serif"
        };
    }
    if (ind.includes('bakery') || ind.includes('cake') || ind.includes('sweet') || ind.includes('food') || ind.includes('restaurant') || ind.includes('cafe')) {
        return {
            hue_primary: "35", // Warm Amber
            hue_secondary: "15", // Soft Terracotta
            font_heading: "'Playfair Display', serif",
            font_body: "'Plus Jakarta Sans', sans-serif"
        };
    }
    if (ind.includes('tech') || ind.includes('software') || ind.includes('startup') || ind.includes('digital') || ind.includes('web') || ind.includes('app') || ind.includes('coding')) {
        return {
            hue_primary: "250", // Vibrant Purple-Blue
            hue_secondary: "320", // Neon Pink
            font_heading: "'Space Grotesk', sans-serif",
            font_body: "'Inter', sans-serif"
        };
    }
    if (ind.includes('law') || ind.includes('legal') || ind.includes('consult') || ind.includes('finance') || ind.includes('firm')) {
        return {
            hue_primary: "215", // Conservative Navy
            hue_secondary: "45", // Gold accent
            font_heading: "'Merriweather', serif",
            font_body: "'Roboto', sans-serif"
        };
    }
    if (ind.includes('gym') || ind.includes('fit') || ind.includes('sport') || ind.includes('yoga') || ind.includes('train') || ind.includes('athletics')) {
        return {
            hue_primary: "145", // High-Energy Green/Teal
            hue_secondary: "180", // Electric Cyan
            font_heading: "'Space Grotesk', sans-serif",
            font_body: "'Plus Jakarta Sans', sans-serif"
        };
    }
    if (ind.includes('beauty') || ind.includes('salon') || ind.includes('spa') || ind.includes('hair') || ind.includes('cosmetic') || ind.includes('makeup')) {
        return {
            hue_primary: "340", // Blush Pink/Rose Gold
            hue_secondary: "45", // Elegant Gold Accent
            font_heading: "'Outfit', sans-serif",
            font_body: "'Inter', sans-serif"
        };
    }
    // Default neutral business theme fallback
    return {
        hue_primary: "220", // Trustworthy navy
        hue_secondary: "200", // Accent slate blue
        font_heading: "'Inter', sans-serif",
        font_body: "'Inter', sans-serif"
    };
}
