const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Load HTML
const htmlRaw = fs.readFileSync(path.join(process.cwd(), 'scratch/namari.html'), 'utf8');
const $ = cheerio.load(htmlRaw);

// 1. Convert all relative assets to absolute URLs pointing to shapingrain
$('[href], [src]').each((i, el) => {
    let href = $(el).attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
        $(el).attr('href', 'http://www.shapingrain.com/downloads/demos/namari/' + href);
    }
    
    let src = $(el).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('#')) {
        $(el).attr('src', 'http://www.shapingrain.com/downloads/demos/namari/' + src);
    }
});

// 2. Remove unused sections
$('#clients').remove(); // Not needed
$('#pricing').remove(); // Too complex to map dynamically without data
$('#testimonials').remove(); // Not in our DB
$('aside .social-icons').remove(); // We only have WhatsApp right now
$('#gallery').remove(); // Not needed

// 3. Inject variables

// Header/Title
$('title').text('${site.businessName} - Premium Website');
$('#banner-logo').replaceWith(`<h1 style="color:white; font-size: 24px; font-weight: bold; margin: 0;">\${site.businessName}</h1>`);
$('#navigation-logo').replaceWith(`<h1 style="color:#333; font-size: 24px; font-weight: bold; margin: 0;">\${site.businessName}</h1>`);

// Hero Section
$('#banner .section-heading').text('${site.heroTitle || site.businessName}');
$('#banner .section-heading').next('p').text('${site.heroSubtitle || "Welcome to our premium service."}');
$('#banner .button').attr('href', 'https://wa.me/${site.phoneNumber}').text('Contact Us on WhatsApp');

// About Section
$('#about .section-heading').text('${site.storyTitle || "Our Story"}');
$('#about p').first().text('${site.storyContent || site.aboutText}');
// Remove the extra paragraphs/lists in About to keep it clean
$('#about .col-2-3').html(`
    <h2 class="section-heading" data-wow-delay="0.1s">\${site.storyTitle || "Our Story"}</h2>
    <p>\${site.storyContent || site.aboutText}</p>
    <a href="https://wa.me/\${site.phoneNumber}" class="button" data-wow-delay="0.2s">Get in touch</a>
`);
$('#about .col-1-3').html(`
    <img src="\${images.about}" alt="About Image" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%;">
`);


// Create a "Products/Services" section from the Services block
// Namari has an "Introduction" block with icon boxes (col-3). Let's hijack it for Services.
// Wait, Namari doesn't have a dedicated services section id? Let's check.
// Let's create a new section for products!
const servicesSection = `
<section id="services" class="scrollto clearfix">
    <div class="row clearfix">
        <div class="col-3">
            <div class="section-heading">
                <h3>SERVICES</h3>
                <h2 class="section-title">What We Offer</h2>
            </div>
        </div>
        <div class="col-2-3">
            \${site.services.map((item, i) => \`
            <div class="col-2 icon-block icon-top wow fadeInUp" data-wow-delay="\${0.1 * i}s">
                <div class="icon-block-description">
                    <img src="\${images.products[i % images.products.length]}" style="width: 100%; border-radius: 4px; margin-bottom: 15px;">
                    <h4>\${item.name}</h4>
                    <p style="color: #3b82f6; font-weight: bold; margin-top: 5px;">\${item.price}</p>
                    <p>\${item.description}</p>
                    <a href="https://wa.me/\${site.phoneNumber}?text=\${encodeURIComponent('Hi! I am interested in ' + item.name)}" class="button" style="margin-top: 15px; padding: 8px 15px;">Order Now</a>
                </div>
            </div>
            \`).join('')}
        </div>
    </div>
</section>
`;

// Insert the services section after the About section
$('#about').after(servicesSection);

// Wait, the About section in Namari also had the "col-2-3" with icon blocks! Let's clear the old ones.
// I already replaced the HTML of `#about .col-2-3` and `#about .col-1-3`.

// Contact footer
$('footer#landing-footer').html(`
    <div class="row clearfix text-center">
        <h2 style="color: white; margin-bottom: 20px;">Get In Touch</h2>
        <p style="color: #ccc; margin-bottom: 30px;">Ready to start? Send us a message directly on WhatsApp.</p>
        <a href="https://wa.me/\${site.phoneNumber}" class="button">Chat with us</a>
        <p style="margin-top: 50px; font-size: 12px; color: #666;">Powered by The Gray Arc</p>
    </div>
`);


// Output the template
const processedHtml = $.html();

const templateString = `
export function renderPremiumWebsite(site: SiteConfig): string {
    const images = getCategoryImages(site.category);
    return \`
${processedHtml.replace(/`/g, '\\`')}
    \`;
}
`;

fs.writeFileSync(path.join(process.cwd(), 'scratch/namari-template.ts'), templateString, 'utf8');
console.log("Successfully processed Namari template!");
