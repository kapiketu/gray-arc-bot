"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectAOSAnimations = injectAOSAnimations;
function injectAOSAnimations(html, level = 'dynamic') {
    console.log(`[Animation Engine] Processing AOS animation rules for level: "${level}"...`);
    if (level === 'none') {
        // Strip all data-aos, data-aos-delay, data-aos-duration tags
        let clean = html.replace(/\s*data-aos="[^"]*"/gi, '');
        clean = clean.replace(/\s*data-aos-delay="[^"]*"/gi, '');
        clean = clean.replace(/\s*data-aos-duration="[^"]*"/gi, '');
        // Also remove the AOS script initialize block
        clean = clean.replace(/<script[^>]*>[\s\S]*?AOS\.init\([\s\S]*?<\/script>/gi, '');
        return clean;
    }
    if (level === 'subtle') {
        // Map heavy dynamic effects to simple fades and limit delays to max 200ms
        let subtle = html.replace(/data-aos="zoom-in"/gi, 'data-aos="fade-in"');
        subtle = subtle.replace(/data-aos="zoom-out"/gi, 'data-aos="fade-in"');
        subtle = subtle.replace(/data-aos="fade-up-right"/gi, 'data-aos="fade-up"');
        // Auto-initialize AOS with fast 400ms duration
        subtle = subtle.replace(/AOS\.init\(\{[\s\S]*?\}\)/gi, 'AOS.init({ duration: 400, once: true, disable: "mobile" })');
        return subtle;
    }
    // Default dynamic mode: Keep the premium effects, initialize AOS with 800ms
    return html.replace(/AOS\.init\(\{[\s\S]*?\}\)/gi, 'AOS.init({ duration: 800, once: true })');
}
