"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleBlocks = assembleBlocks;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Replaces standard variables like {{headline}} with their values from the context.
 */
function replaceVariables(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        if (context[trimmedKey] !== undefined) {
            return String(context[trimmedKey]);
        }
        return match; // Return placeholder if not found
    });
}
/**
 * Processes list items within a block, looking for <!-- item:items --> ... <!-- enditem -->.
 */
function processLoops(template, content) {
    // Regex to match <!-- item:arrayName --> ... <!-- enditem -->
    const loopRegex = /<!--\s*item:([a-zA-Z0-9_]+)\s*-->([\s\S]*?)<!--\s*enditem\s*-->/g;
    return template.replace(loopRegex, (match, arrayName, innerTemplate) => {
        const listData = content[arrayName];
        if (Array.isArray(listData)) {
            return listData.map((itemContext) => replaceVariables(innerTemplate, itemContext)).join('\n');
        }
        return ''; // If data is missing or not an array, remove the block
    });
}
async function assembleBlocks(schema, theme) {
    let finalBody = '';
    const blocksDir = path_1.default.join(__dirname, '../blocks');
    for (const blockId of schema.layout) {
        try {
            const blockPath = path_1.default.join(blocksDir, `${blockId}.html`);
            if (fs_1.default.existsSync(blockPath)) {
                let blockHtml = fs_1.default.readFileSync(blockPath, 'utf8');
                const blockContent = schema.content[blockId] || {};
                // 1. Process loops (e.g. items in services_v2)
                blockHtml = processLoops(blockHtml, blockContent);
                // 2. Replace static block variables
                blockHtml = replaceVariables(blockHtml, blockContent);
                finalBody += blockHtml + '\n';
            }
            else {
                console.warn(`[ComponentAssembler] Block template not found: ${blockId}`);
            }
        }
        catch (err) {
            console.error(`[ComponentAssembler] Failed to process block: ${blockId}`, err);
        }
    }
    // Wrap in global layout template
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600&family=Space+Grotesk:wght@400;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --hue-primary: ${theme.hue_primary};
      --hue-secondary: ${theme.hue_secondary};
      --font-heading: ${theme.font_heading};
      --font-body: ${theme.font_body};
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); color: hsl(var(--hue-primary), 20%, 30%); background: white; }
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: 700; margin-bottom: 0.5em; }
    .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Smooth scroll for anchor tags */
    html { scroll-behavior: smooth; }
  </style>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  ${finalBody}
  <script>
    lucide.createIcons();
  </script>
</body>
</html>`;
    return fullHtml;
}
