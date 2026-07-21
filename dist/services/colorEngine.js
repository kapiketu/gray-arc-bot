"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToHsl = hexToHsl;
exports.hslToHex = hslToHex;
exports.generateThemePalette = generateThemePalette;
function hexToHsl(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}
function hslToHex({ h, s, l }) {
    l /= 100;
    s /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
function generateThemePalette(brandHex, isDark = true) {
    const brandHsl = hexToHsl(brandHex);
    // Set theme limits from specification
    const bgL = isDark ? 8 : 99;
    const surfaceL = isDark ? 12 : 97;
    const cardL = isDark ? 16 : 95;
    const borderL = isDark ? 26 : 87;
    const textPrimaryL = isDark ? 94 : 12;
    const textSecondaryL = isDark ? 75 : 40;
    // Primary Hover / Active
    const primaryHoverL = Math.max(0, Math.min(100, brandHsl.l - 8));
    const secondaryL = Math.max(0, Math.min(100, brandHsl.l + 15));
    return {
        primary: hslToHex(brandHsl),
        primaryHover: hslToHex({ ...brandHsl, l: primaryHoverL }),
        secondary: hslToHex({ ...brandHsl, l: secondaryL }),
        background: hslToHex({ h: brandHsl.h, s: Math.min(15, brandHsl.s), l: bgL }),
        surface: hslToHex({ h: brandHsl.h, s: Math.min(15, brandHsl.s), l: surfaceL }),
        card: hslToHex({ h: brandHsl.h, s: Math.min(15, brandHsl.s), l: cardL }),
        border: hslToHex({ h: brandHsl.h, s: Math.min(15, brandHsl.s), l: borderL }),
        textPrimary: hslToHex({ h: brandHsl.h, s: Math.min(10, brandHsl.s), l: textPrimaryL }),
        textSecondary: hslToHex({ h: brandHsl.h, s: Math.min(10, brandHsl.s), l: textSecondaryL }),
        muted: hslToHex({ h: brandHsl.h, s: Math.min(10, brandHsl.s), l: Math.round((textPrimaryL + textSecondaryL) / 2) })
    };
}
