const fs = require('fs');
const path = require('path');

const indexFile = '/Users/kapiketubhagat/development/whatsapp-site-builder/templates/Lumiere/index.html';
const publicDest = '/Users/kapiketubhagat/development/whatsapp-site-builder/public/Lumiere-Preview.html';
const downloadsDest = '/Users/kapiketubhagat/Downloads/Lumiere-Preview.html';

try {
    let html = fs.readFileSync(indexFile, 'utf8');

    // Generate mock services grid matching Lumiere's bento card design
    const servicesGridHtml = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[300px]">
          <!-- Large Tasting Menu -->
          <div class="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-sm bento-card reveal img-container">
              <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop" alt="Tasting Menu" class="absolute inset-0 w-full h-full object-cover img-zoom opacity-60 group-hover:opacity-40 transition-opacity">
              <div class="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-transparent"></div>
              <div class="absolute bottom-0 left-0 p-8">
                  <h3 class="font-serif text-3xl text-white mb-2">Grand Chef's Tasting Menu</h3>
                  <p class="text-zinc-300 font-light max-w-md">An exclusive 12-course sensory journey through contemporary French cuisine, hand-crafted daily by Chef de Cuisine.</p>
                  <span class="inline-block mt-4 text-gold-400 font-bold text-lg">₹8,500 per guest</span>
              </div>
          </div>
          <!-- Sommelier Pairing -->
          <div class="relative group overflow-hidden rounded-sm bento-card reveal img-container bg-zinc-900/60 border border-white/5">
              <div class="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <i data-lucide="wine" class="text-gold-400 mb-4 w-8 h-8"></i>
                  <h3 class="font-serif text-xl text-white mb-2">Elite Sommelier Pairing</h3>
                  <p class="text-zinc-400 text-sm font-light">Rare vintages and legendary Bordeaux pairings curated by our master cellars.</p>
                  <span class="text-gold-400 font-bold text-sm mt-3">₹4,900 pairing</span>
              </div>
          </div>
          <!-- Private Dining -->
          <div class="relative group overflow-hidden rounded-sm bento-card reveal img-container">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop" alt="Private Dining" class="absolute inset-0 w-full h-full object-cover img-zoom opacity-50">
              <div class="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-transparent"></div>
              <div class="absolute bottom-0 left-0 p-8 z-10">
                  <h3 class="font-serif text-xl text-white mb-2">The Orchid Room</h3>
                  <p class="text-zinc-300 text-sm font-light">Bespoke private vaults and customized banquets for your milestone occasions.</p>
              </div>
          </div>
      </div>
    `;

    // Generate mock testimonials slider
    const testimonialsHtml = `
      <div class="grid md:grid-cols-2 gap-8">
          <div class="p-10 bg-[#0F0F11] border border-white/5 reveal rounded-sm relative">
              <i data-lucide="quote" class="absolute top-8 right-8 text-white/5 w-16 h-16"></i>
              <p class="text-zinc-300 font-light italic leading-relaxed mb-6">"An absolute triumph. L'Ambroisie doesn't just serve food; they craft memories. The attention to detail in both the tasting menu and the service is unmatched in the city."</p>
              <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold font-serif">EV</div>
                  <div>
                      <div class="text-white text-sm">Eleanor Vance</div>
                      <div class="text-gold-400 text-xs tracking-wider uppercase">Culinary Critic</div>
                  </div>
              </div>
          </div>
          <div class="p-10 bg-[#0F0F11] border border-white/5 reveal rounded-sm relative" style="transition-delay: 100ms;">
              <i data-lucide="quote" class="absolute top-8 right-8 text-white/5 w-16 h-16"></i>
              <p class="text-zinc-300 font-light italic leading-relaxed mb-6">"From the moment we walked through the doors, we were transported. The wine pairing was exquisite, and the ambience was perfectly curated."</p>
              <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold font-serif">JS</div>
                  <div>
                      <div class="text-white text-sm">James Sterling</div>
                      <div class="text-gold-400 text-xs tracking-wider uppercase">Private Guest</div>
                  </div>
              </div>
          </div>
      </div>
    `;

    // Dynamic substitutions
    const logoHtml = `<div class="w-8 h-8 rounded-full border border-gold-400 flex items-center justify-center text-gold-400 text-sm font-serif">L</div>`;
    const replacements = {
        '{{business_name}}': "L'Ambroisie Fine Dining",
        '{{category}}': "Premium Fine Dining",
        '{{logo}}': logoHtml,
        '{{hero_title}}': "Masterful Gastronomy",
        '{{hero_subtitle}}': "Experience the pinnacle of culinary excellence, where every dish is a meticulously crafted work of art designed to awaken the senses.",
        '{{hero_image}}': "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop",
        '{{about_title}}': "A legacy of taste and tradition.",
        '{{about_content}}': `<p>Founded on the principles of passion and precision, L'Ambroisie brings together local, sustainable ingredients and avant-garde techniques.</p>
                              <p>We believe dining is not just a meal, but a cinematic journey. From the ambient lighting to the bespoke tableware, every detail is orchestrated for perfection.</p>`,
        '{{about_image}}': "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop",
        '{{phone}}': "+91 98765 43210",
        '{{phone_clean}}': "919876543210",
        '{{email}}': "concierge@lambroisie.com",
        '{{address}}': "124 Elite Avenue, Metropolis District, 10001",
        '{{services_grid}}': servicesGridHtml,
        '{{testimonials_slider}}': testimonialsHtml,
        '{{feature_1_title}}': "Sourcing Excellence",
        '{{feature_1_desc}}': "Hand-selecting the finest seasonal organic ingredients at dawn.",
        '{{feature_2_title}}': "Preparation Precision",
        '{{feature_2_desc}}': "Meticulous culinary techniques applied to enhance natural flavor notes.",
        '{{feature_3_title}}': "Plating Artistry",
        '{{feature_3_desc}}': "Designing every dish as an artistic masterpiece on a custom-blown plate."
    };

    for (const [key, value] of Object.entries(replacements)) {
        html = html.split(key).join(value);
    }

    fs.writeFileSync(publicDest, html, 'utf8');
    fs.writeFileSync(downloadsDest, html, 'utf8');

    console.log("Successfully compiled and rendered Lumiere Preview HTML!");
} catch (e) {
    console.error("Error generating preview:", e.message);
}
