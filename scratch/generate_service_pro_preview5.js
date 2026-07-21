const fs = require('fs');
const path = require('path');

const srcDir = '/Users/kapiketubhagat/Downloads/ServicePro_Template 5';
const destFile = '/Users/kapiketubhagat/Downloads/GA001-Service-Pro-Preview5.html';

try {
    let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
    const js = fs.readFileSync(path.join(srcDir, 'script.js'), 'utf8');

    // Inline CSS
    html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);

    // Inline JS
    html = html.replace('<script src="script.js"></script>', `<script>\n${js}\n</script>`);

    fs.writeFileSync(destFile, html, 'utf8');
    console.log("Successfully compiled ServicePro_Template 5 to a self-contained preview file!");
} catch (e) {
    console.error("Error generating preview:", e.message);
}
