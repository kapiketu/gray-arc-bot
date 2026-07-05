const fs = require('fs');
const path = require('path');

const templateDir = '/Users/kapiketubhagat/Downloads/ServicePro_Template 2';
const publicDest = '/Users/kapiketubhagat/development/whatsapp-site-builder/public/GA001-Service-Pro-Preview2.html';
const downloadsDest = '/Users/kapiketubhagat/Downloads/GA001-Service-Pro-Preview2.html';

try {
    let html = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(templateDir, 'style.css'), 'utf8');
    const js = fs.readFileSync(path.join(templateDir, 'script.js'), 'utf8');

    // Inline CSS
    html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);

    // Inline JS
    html = html.replace('<script src="script.js"></script>', `<script>\n${js}\n</script>`);

    // Write to both destinations
    fs.writeFileSync(publicDest, html, 'utf8');
    fs.writeFileSync(downloadsDest, html, 'utf8');

    console.log("Successfully compiled and inlined template preview!");
} catch (e) {
    console.error("Error generating preview:", e.message);
}
