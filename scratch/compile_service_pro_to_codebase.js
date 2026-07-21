const fs = require('fs');
const path = require('path');

const srcDir = '/Users/kapiketubhagat/Downloads/ServicePro_Template 5';
const destDir = '/Users/kapiketubhagat/development/whatsapp-site-builder/templates/GA001';

try {
    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

    // 1. Title and Description
    html = html.replace('<title>Service Pro | Premium Services</title>', '<title>{{business_name}} | {{category}}</title>');
    html = html.replace('<meta name="description" content="Premium local service experts. Reliable, professional, and guaranteed quality.">', '<meta name="description" content="{{hero_subtitle}}">');

    // 2. Navigation Logo
    html = html.replace(/<a href="#" class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">\s*<i data-lucide="shield-check" class="text-gold-500 w-8 h-8"><\/i>\s*Service<span class="text-gold-500">Pro<\/span>\s*<\/a>/,
`<a href="#" class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
    {{logo}}
    <span>{{business_name}}</span>
</a>`);

    // 3. Hero Image
    html = html.replace('https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80', '{{hero_image}}');

    // 4. Hero Title, Subtitle, and Call CTA
    html = html.replace(/<h1 class="text-5xl lg:text-7xl font-extrabold text-white leading-\[1\.1\] mb-6 tracking-tight">[\s\S]*?<\/h1>/,
`<h1 class="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">{{hero_title}}</h1>`);

    html = html.replace(/<p class="text-lg lg:text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">[\s\S]*?<\/p>/,
`<p class="text-lg lg:text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">{{hero_subtitle}}</p>`);

    html = html.replace(/href="tel:\+1234567890"([\s\S]*?)>\s*<i data-lucide="phone" class="w-5 h-5 text-gold-500"><\/i> \+1 \(234\) 567-890/,
`href="tel:{{phone}}"$1>
    <i data-lucide="phone" class="w-5 h-5 text-gold-500"></i> {{phone}}`);

    // 5. About Image and Details
    html = html.replace('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80', '{{about_image}}');
    html = html.replace('<h3 class="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">Elevating Standards in Local Services.</h3>',
`<h3 class="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{{about_title}}</h3>`);
    
    html = html.replace(/<p class="text-gray-400 text-lg mb-6 leading-relaxed">[\s\S]*?<\/p>\s*<p class="text-gray-400 text-lg mb-8 leading-relaxed">[\s\S]*?<\/p>/,
`<div class="text-gray-400 text-lg mb-8 leading-relaxed space-y-4">
    {{about_content}}
</div>`);

    // 6. Services Grid
    html = html.replace(/<!-- Bento Grid -->\s*<div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-\[250px\]">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
`<!-- Bento Grid -->
            {{services_grid}}
        </div>
    </section>`);

    // 7. Process Steps
    html = html.replace('<h4 class="text-2xl font-bold text-white mb-3">1. Consultation & Quote</h4>\n                    <p class="text-gray-400 leading-relaxed">We assess your needs, inspect the site, and provide a detailed, transparent estimate without hidden fees.</p>',
'<h4 class="text-2xl font-bold text-white mb-3">1. {{feature_1_title}}</h4>\n                    <p class="text-gray-400 leading-relaxed">{{feature_1_desc}}</p>');
    html = html.replace('<h4 class="text-2xl font-bold text-white mb-3">2. Execution</h4>\n                    <p class="text-gray-400 leading-relaxed">Our certified experts arrive on time and execute the job utilizing premium materials and cutting-edge tools.</p>',
'<h4 class="text-2xl font-bold text-white mb-3">2. {{feature_2_title}}</h4>\n                    <p class="text-gray-400 leading-relaxed">{{feature_2_desc}}</p>');
    html = html.replace('<h4 class="text-2xl font-bold text-white mb-3">3. Final Walkthrough</h4>\n                    <p class="text-gray-400 leading-relaxed">We don\'t leave until you are fully satisfied. The site is cleaned, and all work is rigorously tested.</p>',
'<h4 class="text-2xl font-bold text-white mb-3">3. {{feature_3_title}}</h4>\n                    <p class="text-gray-400 leading-relaxed">{{feature_3_desc}}</p>');

    // 8. Testimonials
    html = html.replace(/<!-- Slider Container -->\s*<div class="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-8" id="testimonial-slider">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
`<!-- Slider Container -->
            {{testimonials_slider}}
        </div>
    </section>`);

    // 9. Footer Brand Logo
    html = html.replace(/<a href="#" class="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-6">\s*<i data-lucide="shield-check" class="text-gold-500 w-6 h-6"><\/i>\s*Service<span class="text-gold-500">Pro<\/span>\s*<\/a>/,
`<a href="#" class="text-2xl font-bold text-white tracking-tight flex items-center gap-3 mb-6">
    {{logo}}
    <span>{{business_name}}</span>
</a>`);
    html = html.replace('<p class="text-gray-500 max-w-sm mb-6">The premier choice for residential and commercial maintenance, setting the standard for quality and reliability.</p>',
'<p class="text-gray-500 max-w-sm mb-6">The premier choice for {{category}} maintenance, setting the standard for quality and reliability.</p>');

    // 10. Footer Contact Info
    html = html.replace(/<i data-lucide="map-pin" class="w-5 h-5 text-gold-500 shrink-0 mt-0.5"><\/i>\s*<span>123 Luxury Ave, Suite 400<br>New York, NY 10001<\/span>/,
`<i data-lucide="map-pin" class="w-5 h-5 text-gold-500 shrink-0 mt-0.5"></i>
                        <span>{{address}}</span>`);
    
    html = html.replace(/<i data-lucide="phone" class="w-5 h-5 text-gold-500 shrink-0"><\/i>\s*<span>\+1 \(234\) 567-890<\/span>/,
`<i data-lucide="phone" class="w-5 h-5 text-gold-500 shrink-0"></i>
                        <span>{{phone}}</span>`);

    html = html.replace(/<i data-lucide="mail" class="w-5 h-5 text-gold-500 shrink-0"><\/i>\s*<span>hello@servicepro\.com<\/span>/,
`<i data-lucide="mail" class="w-5 h-5 text-gold-500 shrink-0"></i>
                        <span>{{email}}</span>`);

    // 11. Copyright & Floating Buttons
    html = html.replace('© 2026 Service Pro. All rights reserved.', '© 2026 {{business_name}}. All rights reserved.');
    html = html.replace('href="https://wa.me/1234567890"', 'href="https://wa.me/{{phone_clean}}"');
    html = html.replace('href="tel:+1234567890"', 'href="tel:{{phone}}"');

    // Save index.html
    fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');

    // Copy style.css, script.js, and metadata.json
    fs.copyFileSync(path.join(srcDir, 'style.css'), path.join(destDir, 'style.css'));
    fs.copyFileSync(path.join(srcDir, 'script.js'), path.join(destDir, 'script.js'));
    fs.copyFileSync(path.join(srcDir, 'metadata.json'), path.join(destDir, 'metadata.json'));

    console.log("Successfully compiled ServicePro_Template 5 files into templates/GA001 codebase!");
} catch (e) {
    console.error("Compilation error:", e.message);
}
