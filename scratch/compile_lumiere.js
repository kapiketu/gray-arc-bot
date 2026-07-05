const fs = require('fs');
const path = require('path');

const indexFile = '/Users/kapiketubhagat/development/whatsapp-site-builder/templates/Lumiere/index.html';
let html = fs.readFileSync(indexFile, 'utf8');

// Replace Title & Description
html = html.replace('<title>Lumière | Premium Fine Dining Experience</title>', '<title>{{business_name}} | {{category}}</title>');
html = html.replace('<meta name="description" content="Experience the pinnacle of culinary excellence at Lumière. Award-winning fine dining, immersive ambiance, and masterful gastronomy.">', '<meta name="description" content="{{hero_subtitle}}">');

// Replace Logo
html = html.replace('<div class="font-serif text-2xl tracking-widest text-white">LUMIÈRE<span class="text-gold-400">.</span></div>', 
`<div class="flex items-center gap-3 font-serif text-2xl tracking-widest text-white">
    {{logo}}
    <span>{{business_name}}</span>
</div>`);

// Replace Hero Background
html = html.replace('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop', '{{hero_image}}');

// Replace Hero Titles
html = html.replace('<h4 class="text-gold-400 tracking-[0.3em] uppercase text-sm mb-6">A Symphony of Flavors</h4>', '<h4 class="text-gold-400 tracking-[0.3em] uppercase text-sm mb-6">{{category}}</h4>');
html = html.replace('<h1 class="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">Masterful <br><span class="italic text-zinc-300">Gastronomy</span></h1>', '<h1 class="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">{{hero_title}}</h1>');
html = html.replace('<p class="text-zinc-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">Experience the pinnacle of culinary excellence, where every dish is a meticulously crafted work of art designed to awaken the senses.</p>', '<p class="text-zinc-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">{{hero_subtitle}}</p>');

// Replace About Image
html = html.replace('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop', '{{about_image}}');

// Replace About Content & Title
html = html.replace('<h2 class="font-serif text-4xl md:text-5xl text-white mb-6">A legacy of taste and tradition.</h2>', '<h2 class="font-serif text-4xl md:text-5xl text-white mb-6">{{about_title}}</h2>');
html = html.replace(/<p class="text-zinc-400 font-light leading-relaxed mb-6">[\s\S]*?<\/p>\s*<p class="text-zinc-400 font-light leading-relaxed mb-8">[\s\S]*?<\/p>/,
`<div class="text-zinc-400 font-light leading-relaxed mb-8 space-y-4">
    {{about_content}}
</div>`);

// Replace Services Grid
html = html.replace(/<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-\[300px\]">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
`{{services_grid}}
        </div>
    </section>`);

// Replace Journey Timeline
html = html.replace('<h3 class="font-serif text-xl text-white mb-2">Sourcing</h3>\n                        <p class="text-zinc-400 text-sm font-light">Hand-selecting the finest seasonal ingredients at dawn.</p>',
'<h3 class="font-serif text-xl text-white mb-2">{{feature_1_title}}</h3>\n                        <p class="text-zinc-400 text-sm font-light">{{feature_1_desc}}</p>');
html = html.replace('<h3 class="font-serif text-xl text-white mb-2">Preparation</h3>\n                        <p class="text-zinc-400 text-sm font-light">Meticulous culinary techniques applied to enhance natural flavors.</p>',
'<h3 class="font-serif text-xl text-white mb-2">{{feature_2_title}}</h3>\n                        <p class="text-zinc-400 text-sm font-light">{{feature_2_desc}}</p>');
html = html.replace('<h3 class="font-serif text-xl text-white mb-2">Plating</h3>\n                        <p class="text-zinc-400 text-sm font-light">Designing every dish as an artistic masterpiece on a plate.</p>',
'<h3 class="font-serif text-xl text-white mb-2">{{feature_3_title}}</h3>\n                        <p class="text-zinc-400 text-sm font-light">{{feature_3_desc}}</p>');

// Replace Testimonials
html = html.replace(/<div class="grid md:grid-cols-2 gap-8">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
`{{testimonials_slider}}
        </div>
    </section>`);

// Replace Reservation Form Email Action
html = html.replace('action="mailto:reservations@business.com"', 'action="mailto:{{email}}"');
html = html.replace('action="mailto:reservations@business.com"', 'action="mailto:{{email}}"');

// Replace Footer Brand Logo
html = html.replace('<div class="font-serif text-2xl tracking-widest text-white mb-6">LUMIÈRE<span class="text-gold-400">.</span></div>',
`<div class="flex items-center gap-3 font-serif text-2xl tracking-widest text-white mb-6">
    {{logo}}
    <span>{{business_name}}</span>
</div>`);
html = html.replace('<p class="text-zinc-500 font-light text-sm max-w-xs mx-auto md:mx-0">Redefining modern gastronomy through elegance, innovation, and uncompromising quality.</p>',
'<p class="text-zinc-500 font-light text-sm max-w-xs mx-auto md:mx-0">Redefining premium {{category}} services through elegance, innovation, and uncompromising quality.</p>');

// Replace Footer Location & Contact details
html = html.replace('<p class="text-zinc-500 font-light text-sm">124 Elite Avenue, <br>Metropolis District, 10001</p>',
'<p class="text-zinc-500 font-light text-sm">{{address}}</p>');
html = html.replace('<p class="text-zinc-500 font-light text-sm">concierge@lumiere.com<br>+1 (555) 019-8273</p>',
'<p class="text-zinc-500 font-light text-sm">{{email}}<br>{{phone}}</p>');

// Replace Copyright
html = html.replace('<p>&copy; 2026 Lumière Dining. All Rights Reserved.</p>',
'<p>&copy; 2026 {{business_name}}. All Rights Reserved.</p>');

// Add class phone replacement targets in footer form
html = html.replace('id="phone"', 'id="phone"');

fs.writeFileSync(indexFile, html, 'utf8');
console.log("Successfully prepared Lumiere template index.html!");
