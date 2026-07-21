"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToReact = exportToReact;
exports.exportToNextJS = exportToNextJS;
const viewer_1 = require("../routes/viewer");
// Helper to convert lowercase hyphenated Lucide names to PascalCase React components
function toPascalCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}
function exportToReact(site, templateId = 'GA004') {
    console.log(`[Publishing Engine] Exporting site "${site.businessName}" to React JSX...`);
    // 1. Compile final static HTML first using our existing engine
    const html = (0, viewer_1.renderPremiumWebsite)(site, templateId);
    // 2. Parse out the contents inside the <body> tag to convert to React component body
    const bodyStartIdx = html.indexOf('<body');
    const bodyCloseStartIdx = html.indexOf('</body>');
    let jsxBody = '';
    if (bodyStartIdx !== -1 && bodyCloseStartIdx !== -1) {
        const bodyContentStart = html.indexOf('>', bodyStartIdx) + 1;
        jsxBody = html.substring(bodyContentStart, bodyCloseStartIdx).trim();
    }
    else {
        jsxBody = '<div><h1>' + site.businessName + '</h1></div>';
    }
    // Remove any injected script tags (like Lucide and AOS script tags) from the React body
    jsxBody = jsxBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // 3. Translate HTML strings to React JSX syntax
    // - Replace class with className
    jsxBody = jsxBody.split('class="').join('className="');
    // - Replace self-closing tags
    jsxBody = jsxBody.replace(/<img([^>]+)>/g, '<img$1 />');
    jsxBody = jsxBody.replace(/<br>/g, '<br />');
    jsxBody = jsxBody.replace(/<hr([^>]*)\b>/g, '<hr$1 />');
    jsxBody = jsxBody.replace(/<input([^>]+)>/g, '<input$1 />');
    // 4. Translate Lucide icon tags:
    // e.g. <i data-lucide="heart" className="w-6 h-6"></i> -> <Heart className="w-6 h-6" />
    const iconRegex = /<i\s+data-lucide="([^"]+)"\s+className="([^"]+)"\s*>\s*<\/i>/g;
    const importedIcons = new Set();
    jsxBody = jsxBody.replace(iconRegex, (match, iconName, className) => {
        const pascalIcon = toPascalCase(iconName);
        importedIcons.add(pascalIcon);
        return `<${pascalIcon} className="${className}" />`;
    });
    // Make sure we have a default icon if imports are empty
    if (importedIcons.size === 0) {
        importedIcons.add('Star');
    }
    const iconsImportList = Array.from(importedIcons).join(', ');
    // 5. Assemble final React component file template
    return `import React from 'react';
import { ${iconsImportList} } from 'lucide-react';

export default function WebsiteComponent() {
  return (
    <div className="min-h-screen bg-[#030712] text-[#f3f4f6] font-sans antialiased selection:bg-primary selection:text-white">
      ${jsxBody}
    </div>
  );
}
`;
}
function exportToNextJS(site, templateId = 'GA004') {
    console.log(`[Publishing Engine] Exporting site "${site.businessName}" to Next.js App Route page...`);
    const reactCode = exportToReact(site, templateId);
    // Modify export default to page template and add Next.js Metadata
    const cleanReactCode = reactCode.replace('export default function WebsiteComponent()', 'function WebsiteComponent()');
    return `import React from 'react';
import { Metadata } from 'next';
${cleanReactCode.substring(reactCode.indexOf('import {') - 0).trim()}

export const metadata: Metadata = {
  title: "${site.businessName} | Official Website",
  description: "${site.aboutText || 'Premium professional services.'}",
  openGraph: {
    title: "${site.businessName}",
    description: "${site.aboutText || 'Premium professional services.'}",
    type: "website"
  }
};

export default function Page() {
  return <WebsiteComponent />;
}
`;
}
