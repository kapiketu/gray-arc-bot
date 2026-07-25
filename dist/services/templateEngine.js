"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOptimalVariants = selectOptimalVariants;
exports.compileDynamicLayout = compileDynamicLayout;
const viewer_1 = require("../routes/viewer");
// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const Hero_01 = `
<section id="hero" class="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-6 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <!-- Glow Effects -->
    <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-secondary/10 blur-[120px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        <!-- Text Column -->
        <div class="lg:col-span-7 text-left space-y-8" data-aos="fade-right">
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-xs font-semibold uppercase tracking-wider text-primary">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {{category}}
            </span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1] tracking-tight text-white">
                {{hero_title}}
            </h1>
            <p class="text-gray-400 text-lg leading-relaxed max-w-xl">
                {{hero_subtitle}}
            </p>
            <div class="flex flex-wrap gap-4">
                <a href="https://wa.me/{{phone_clean}}?text=Hi! I am interested in your services." target="_blank" class="px-8 py-4 rounded-full bg-primary text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-3">
                    <i data-lucide="message-circle" class="w-5 h-5"></i>
                    <span>Connect on WhatsApp</span>
                </a>
                <a href="#services" class="px-8 py-4 rounded-full glass text-white font-bold hover:bg-white/5 transition-all border-white/10">
                    Explore Services
                </a>
            </div>
        </div>

        <!-- Image Column -->
        <div class="lg:col-span-5 relative" data-aos="fade-left">
            <div class="relative rounded-3xl overflow-hidden glass p-2 border-white/5">
                <div class="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden">
                    <img src="{{hero_image}}" alt="{{business_name}} Hero" class="w-full h-full object-cover transform hover:scale-105 transition-all duration-700" onerror="this.onerror=null;this.src='{{hero_fallback}}';">
                </div>
            </div>
        </div>
    </div>
</section>
`;
const Hero_02 = `
<section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
    <!-- Visual Image Background -->
    <div class="absolute inset-0 z-0">
        <img src="{{hero_image}}" alt="{{business_name}} Background" class="w-full h-full object-cover opacity-30 scale-105 filter blur-[2px]" onerror="this.onerror=null;this.src='{{hero_fallback}}';">
        <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-900/50"></div>
    </div>

    <!-- Centered Glass Card -->
    <div class="max-w-4xl mx-auto text-center relative z-10 space-y-8 glass p-8 sm:p-12 rounded-[2.5rem] border-white/10 shadow-2xl backdrop-blur-2xl" data-aos="zoom-in">
        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {{category}}
        </span>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1] tracking-tight text-white">
            {{hero_title}}
        </h1>
        <p class="text-gray-300 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            {{hero_subtitle}}
        </p>
        <div class="flex flex-wrap justify-center gap-4 pt-4">
            <a href="https://wa.me/{{phone_clean}}?text=Hi! I am interested in your offerings." target="_blank" class="px-8 py-4 rounded-full bg-primary text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/25 flex items-center gap-3">
                <i data-lucide="message-circle" class="w-5 h-5"></i>
                <span>Order via WhatsApp</span>
            </a>
            <a href="#services" class="px-8 py-4 rounded-full glass text-white font-bold hover:bg-white/10 transition-all border-white/10">
                View Offerings
            </a>
        </div>
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// ABOUT SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const About_01 = `
<section id="about" class="py-24 px-6 relative bg-dark-900/40">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <!-- Photo Grid -->
        <div class="lg:col-span-5 relative" data-aos="fade-right">
            <div class="relative rounded-3xl overflow-hidden glass p-2 border-white/5">
                <div class="relative aspect-square rounded-[1.5rem] overflow-hidden">
                    <img src="{{about_image}}" alt="Our Space" class="w-full h-full object-cover hover:scale-105 transition-all duration-700" onerror="this.onerror=null;this.src='{{about_fallback}}';">
                </div>
            </div>
        </div>

        <!-- Copy Column -->
        <div class="lg:col-span-7 space-y-6" data-aos="fade-left">
            <span class="text-sm font-semibold uppercase tracking-wider text-primary">{{about_title}}</span>
            <h2 class="text-3xl sm:text-4xl font-bold font-display text-white">Our Commitment & Narrative</h2>
            <div class="text-gray-400 leading-relaxed text-lg space-y-4">
                {{about_content}}
            </div>
            <div class="pt-6 grid grid-cols-2 gap-6 border-t border-white/5">
                <div>
                    <h4 class="text-2xl font-bold text-white font-display">{{stat_1_value}}</h4>
                    <p class="text-sm text-gray-400 mt-1">{{stat_1_label}}</p>
                </div>
                <div>
                    <h4 class="text-2xl font-bold text-white font-display">{{stat_2_value}}</h4>
                    <p class="text-sm text-gray-400 mt-1">{{stat_2_label}}</p>
                </div>
            </div>
        </div>
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// SERVICES SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const Services_Grid = `
<section id="services" class="py-24 px-6 relative">
    <div class="max-w-7xl mx-auto text-center space-y-4 mb-16">
        <span class="text-sm font-semibold uppercase tracking-wider text-primary">Core Services</span>
        <h2 class="text-3xl sm:text-5xl font-bold font-display text-white">Explore What We Offer</h2>
        <p class="text-gray-400 max-w-xl mx-auto">Explore premium plans and professional services custom tailored for your precise requirements.</p>
    </div>

    {{services_grid_wrapper}}
</section>
`;
const Services_Accordion = `
<section id="services" class="py-24 px-6 relative bg-dark-900/20">
    <div class="max-w-4xl mx-auto text-center space-y-4 mb-16">
        <span class="text-sm font-semibold uppercase tracking-wider text-primary">Our Services</span>
        <h2 class="text-3xl sm:text-4xl font-bold font-display text-white">Detailed Offerings & pricing</h2>
        <p class="text-gray-400 max-w-xl mx-auto">Click on any service to explore detailed pricing, specific steps, and make inquiries instantly.</p>
    </div>

    <div class="max-w-3xl mx-auto space-y-4">
        {{services_items}}
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// FEATURES SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const Features_Bento = `
<section id="features" class="py-24 px-6 relative">
    <div class="max-w-7xl mx-auto text-center space-y-4 mb-16">
        <span class="text-sm font-semibold uppercase tracking-wider text-primary">Why Choose Us</span>
        <h2 class="text-3xl sm:text-5xl font-bold font-display text-white">Engineered For trust</h2>
    </div>

    <!-- Bento Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Tall/Wide Feature 1 -->
        <div class="lg:col-span-2 glass p-8 rounded-[2rem] border-white/5 space-y-6 flex flex-col justify-between" data-aos="zoom-in">
            <div class="space-y-4">
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <i data-lucide="shield-check" class="w-6 h-6 text-primary"></i>
                </div>
                <h3 class="text-2xl font-bold text-white font-display">{{feature_1_title}}</h3>
                <p class="text-gray-400 leading-relaxed max-w-xl text-sm">{{feature_1_desc}}</p>
            </div>
            <div class="pt-6 border-t border-white/5 flex items-center gap-4 text-xs text-gray-500">
                <span>Certified Standard</span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span>Premium Quality Assurance</span>
            </div>
        </div>

        <!-- Square Feature 2 -->
        <div class="glass p-8 rounded-[2rem] border-white/5 space-y-6 flex flex-col justify-between" data-aos="zoom-in" data-aos-delay="100">
            <div class="space-y-4">
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <i data-lucide="users" class="w-6 h-6 text-primary"></i>
                </div>
                <h3 class="text-xl font-bold text-white font-display">{{feature_2_title}}</h3>
                <p class="text-gray-400 text-sm leading-relaxed">{{feature_2_desc}}</p>
            </div>
        </div>

        <!-- Square Feature 3 -->
        <div class="glass p-8 rounded-[2rem] border-white/5 space-y-6 flex flex-col justify-between" data-aos="zoom-in" data-aos-delay="200">
            <div class="space-y-4">
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <i data-lucide="award" class="w-6 h-6 text-primary"></i>
                </div>
                <h3 class="text-xl font-bold text-white font-display">{{feature_3_title}}</h3>
                <p class="text-gray-400 text-sm leading-relaxed">{{feature_3_desc}}</p>
            </div>
        </div>
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIAL SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const Testimonials_List = `
<section id="testimonials" class="py-24 px-6 relative bg-dark-900/40">
    <div class="max-w-7xl mx-auto text-center space-y-4 mb-16">
        <span class="text-sm font-semibold uppercase tracking-wider text-primary">Reviews</span>
        <h2 class="text-3xl sm:text-4xl font-bold font-display text-white">Diner & Customer Feedback</h2>
    </div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {{testimonials_items}}
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// FAQ SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const FAQ_List = `
<section id="faq" class="py-24 px-6 relative">
    <div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5 space-y-4" data-aos="fade-right">
            <span class="text-sm font-semibold uppercase tracking-wider text-primary">Support</span>
            <h2 class="text-3xl font-bold font-display text-white">Frequently Asked Questions</h2>
            <p class="text-gray-400 text-sm leading-relaxed">Have questions about booking, payments, location, or scheduling? Find instant replies here.</p>
        </div>
        <div class="lg:col-span-7 space-y-6" data-aos="fade-left">
            {{faq_items}}
        </div>
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// FOOTER SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const Footer_Standard = `
<footer class="glass border-t border-white/5 py-12 px-6 relative z-10">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="space-y-4">
            <h3 class="text-lg font-bold text-white font-display">{{business_name}}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">{{about}}</p>
        </div>
        <div class="space-y-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-white">Hours & Schedule</h4>
            <p class="text-sm text-gray-400">{{hours}}</p>
        </div>
        <div class="space-y-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-white">Contact & Address</h4>
            <p class="text-sm text-gray-400">{{address}}</p>
            <p class="text-sm text-gray-400">Email: {{email}}</p>
        </div>
    </div>
    <div class="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; 2026 {{business_name}}. All rights reserved.</p>
        <div class="flex gap-6">
            <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
        </div>
    </div>
</footer>
`;
const Hero_03 = `
<section id="hero" class="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-32 px-6 bg-dark-950">
    <!-- Glowing Background Radial Blobs -->
    <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[140px] pointer-events-none animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[160px] pointer-events-none"></div>

    <div class="max-w-5xl mx-auto text-center relative z-10 space-y-8" data-aos="zoom-in">
        <span class="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-white/10 text-xs font-semibold uppercase tracking-widest text-primary shadow-inner">
            <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            {{category}}
        </span>
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-display leading-[1.08] tracking-tight text-white bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            {{hero_title}}
        </h1>
        <p class="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-sans">
            {{hero_subtitle}}
        </p>
        <div class="flex flex-wrap justify-center gap-5 pt-6">
            <a href="https://wa.me/{{phone_clean}}?text=Hi! I am interested in your services." target="_blank" class="px-9 py-4 rounded-full bg-primary text-white font-bold text-base hover:scale-105 transition-all shadow-xl shadow-primary/30 flex items-center gap-3">
                <i data-lucide="message-circle" class="w-5 h-5"></i>
                <span>Get Started on WhatsApp</span>
            </a>
            <a href="#services" class="px-9 py-4 rounded-full glass text-white font-bold text-base hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl">
                Explore Services
            </a>
        </div>
        <!-- Hero Featured Media Card -->
        <div class="pt-12 max-w-4xl mx-auto">
            <div class="relative rounded-3xl overflow-hidden glass p-3 border border-white/10 shadow-2xl">
                <div class="relative aspect-[16/9] rounded-2xl overflow-hidden">
                    <img src="{{hero_image}}" alt="{{business_name}} Hero" class="w-full h-full object-cover transform hover:scale-105 transition-all duration-700" onerror="this.onerror=null;this.src='{{hero_fallback}}';">
                </div>
            </div>
        </div>
    </div>
</section>
`;
// ─────────────────────────────────────────────────────────────────────────────
// ADAPTIVE SELECTOR & COMPILING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function selectOptimalVariants(site) {
    const category = (site.category || '').toLowerCase();
    const servicesCount = site.services?.length || 0;
    // 1. Hero Variant Selection
    let heroVariant = Hero_01;
    if (category.includes('gym') ||
        category.includes('fitness') ||
        category.includes('tech') ||
        category.includes('software') ||
        category.includes('startup') ||
        category.includes('digital') ||
        category.includes('app') ||
        category.includes('lounge') ||
        category.includes('creative')) {
        heroVariant = Hero_03;
    }
    else if (category.includes('restaurant') ||
        category.includes('food') ||
        category.includes('cafe') ||
        category.includes('bar') ||
        category.includes('salon') ||
        category.includes('spa') ||
        category.includes('bakery')) {
        heroVariant = Hero_02;
    }
    // 2. Services Variant Selection
    // If user has many services, grid looks cluttered. Automatically switch to list accordions.
    const servicesVariant = servicesCount > 4 ? Services_Accordion : Services_Grid;
    return {
        heroVariant,
        servicesVariant,
        aboutVariant: About_01,
        featuresVariant: Features_Bento,
        testimonialsVariant: Testimonials_List,
        faqVariant: FAQ_List,
        footerVariant: Footer_Standard
    };
}
function compileDynamicLayout(site) {
    const layouts = selectOptimalVariants(site);
    // 1. Compile Hero
    let compiledHero = layouts.heroVariant;
    // 2. Compile About
    let compiledAbout = layouts.aboutVariant;
    // 3. Compile Services
    let servicesItemsHtml = '';
    const services = site.services || [];
    if (layouts.servicesVariant === Services_Accordion) {
        // Compile Accordion items
        services.forEach((s, idx) => {
            const icon = (0, viewer_1.validateLucideIcon)(s.icon || '', 'star');
            servicesItemsHtml += `
        <details class="group glass p-6 rounded-2xl border-white/5 [&_summary::-webkit-details-marker]:hidden cursor-pointer" data-aos="fade-up" data-aos-delay="${idx * 100}">
          <summary class="flex items-center justify-between gap-4 font-semibold text-white">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <i data-lucide="${icon}" class="w-5 h-5"></i>
              </div>
              <span class="font-display text-lg">${s.name}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-bold text-primary">${s.price || 'Contact Us'}</span>
              <span class="transition group-open:-rotate-180">
                <i data-lucide="chevron-down" class="w-5 h-5 text-gray-400"></i>
              </span>
            </div>
          </summary>
          <div class="mt-4 pl-14 text-sm text-gray-400 leading-relaxed space-y-4">
            <p>${s.description}</p>
            <div class="flex gap-4">
              <a href="https://wa.me/${(site.phoneNumber || '').replace(/\D/g, '')}?text=Hi! I am interested in booking: ${encodeURIComponent(s.name)}" target="_blank" class="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:scale-105 transition-all">Book Service</a>
            </div>
          </div>
        </details>
      `;
        });
    }
    else {
        // Compile Grid cards
        const count = services.length;
        services.forEach((s, idx) => {
            const icon = (0, viewer_1.validateLucideIcon)(s.icon || '', 'star');
            let colSpan = '';
            if (count === 5) {
                colSpan = idx < 3 ? 'lg:col-span-2' : 'lg:col-span-3';
            }
            servicesItemsHtml += `
        <div class="glass p-8 rounded-3xl border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden ${colSpan}" data-aos="fade-up" data-aos-delay="${idx * 100}">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <i data-lucide="${icon}" class="w-6 h-6"></i>
            </div>
            <h3 class="text-xl font-bold text-white font-display">${s.name}</h3>
            <p class="text-gray-400 text-sm leading-relaxed line-clamp-3">${s.description}</p>
          </div>
          <div class="pt-6 mt-6 border-t border-white/5 flex justify-between items-center">
            <span class="text-primary font-bold text-sm">${s.price || 'Contact Us'}</span>
            <a href="https://wa.me/${(site.phoneNumber || '').replace(/\D/g, '')}?text=Hi! I am interested in: ${encodeURIComponent(s.name)}" target="_blank" class="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:scale-105 transition-all">Enquire</a>
          </div>
        </div>
      `;
        });
    }
    let compiledServices = layouts.servicesVariant;
    if (layouts.servicesVariant === Services_Grid) {
        const count = services.length;
        let servicesGridWrapper = '';
        if (count === 1) {
            servicesGridWrapper = `<div class="max-w-md mx-auto flex justify-center">{{services_items}}</div>`;
        }
        else if (count === 2) {
            servicesGridWrapper = `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">{{services_items}}</div>`;
        }
        else if (count === 3) {
            servicesGridWrapper = `<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{{services_items}}</div>`;
        }
        else if (count === 4) {
            servicesGridWrapper = `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">{{services_items}}</div>`;
        }
        else if (count === 5) {
            servicesGridWrapper = `<div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-8">{{services_items}}</div>`;
        }
        else {
            servicesGridWrapper = `<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{{services_items}}</div>`;
        }
        const wrapperWithItems = servicesGridWrapper.replace('{{services_items}}', servicesItemsHtml);
        compiledServices = compiledServices.replace('{{services_grid_wrapper}}', wrapperWithItems);
    }
    else {
        compiledServices = compiledServices.replace('{{services_items}}', servicesItemsHtml);
    }
    // 4. Compile Features
    let compiledFeatures = layouts.featuresVariant;
    // 5. Compile Testimonials
    let testimonialsItemsHtml = '';
    const testimonials = site.testimonials || [];
    testimonials.forEach((t, idx) => {
        testimonialsItemsHtml += `
      <div class="glass p-8 rounded-[2rem] border-white/5 space-y-6 flex flex-col justify-between" data-aos="fade-up" data-aos-delay="${idx * 100}">
        <p class="text-gray-300 text-sm leading-relaxed italic">"${t.content}"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            ${(t.name || 'U').charAt(0)}
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">${t.name}</h4>
            <p class="text-xs text-gray-500">${t.role || 'Verified Customer'}</p>
          </div>
        </div>
      </div>
    `;
    });
    let compiledTestimonials = layouts.testimonialsVariant.replace('{{testimonials_items}}', testimonialsItemsHtml);
    // 6. Compile FAQ
    let faqItemsHtml = '';
    const faqs = site.faqs || [];
    faqs.forEach((f, idx) => {
        faqItemsHtml += `
      <div class="space-y-2" data-aos="fade-up" data-aos-delay="${idx * 100}">
        <h4 class="font-bold text-white font-display text-md">${f.question}</h4>
        <p class="text-gray-400 text-sm leading-relaxed">${f.answer}</p>
      </div>
    `;
    });
    let compiledFAQ = layouts.faqVariant.replace('{{faq_items}}', faqItemsHtml);
    // 7. Compile Footer
    let compiledFooter = layouts.footerVariant;
    // 8. Dynamic Pricing plans Template
    const compiledPricing = `
  <section id="pricing" class="py-24 px-6 relative bg-dark-900/40 border-t border-white/5">
      <div class="max-w-7xl mx-auto text-center space-y-4 mb-16">
          <span class="text-sm font-semibold uppercase tracking-wider text-primary">Pricing Plans</span>
          <h2 class="text-3xl sm:text-5xl font-bold font-display text-white">Simple, Transparent Plans</h2>
          <p class="text-gray-400 max-w-xl mx-auto">Choose the perfect plan tailored for your requirements and start immediately.</p>
      </div>

      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Plan 1 -->
          <div class="glass p-8 rounded-3xl border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="100">
              <div class="space-y-6">
                  <div>
                      <h3 class="text-lg font-bold text-gray-400 font-display uppercase tracking-widest">Starter</h3>
                      <div class="flex items-baseline gap-1 mt-4">
                          <span class="text-4xl font-extrabold text-white">{{plan_basic_price}}</span>
                          <span class="text-xs text-gray-500">/ One-time</span>
                      </div>
                      <p class="text-gray-400 text-xs mt-2">Essential services package to get you started quickly.</p>
                  </div>
                  <ul class="space-y-3 text-sm text-gray-300 border-t border-white/5 pt-6">
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> {{plan_service_1}}</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> Custom Consultation</li>
                      <li class="flex items-center gap-3 text-gray-500"><i data-lucide="check" class="w-4 h-4 text-gray-700"></i> Full Premium Support</li>
                  </ul>
              </div>
              <a href="https://wa.me/{{phone_clean}}?text=Hi! I am interested in the Starter Plan." target="_blank" class="w-full py-3 mt-8 rounded-full border border-white/10 hover:bg-white/5 text-white font-bold text-center text-sm transition-all">Choose Plan</a>
          </div>

          <!-- Plan 2 (Highlighted) -->
          <div class="glass p-8 rounded-3xl border-primary/20 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden ring-2 ring-primary/20 bg-dark-900/60" data-aos="fade-up" data-aos-delay="200">
              <div class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">Most Popular</div>
              <div class="space-y-6">
                  <div>
                      <h3 class="text-lg font-bold text-primary font-display uppercase tracking-widest">Premium / Pro</h3>
                      <div class="flex items-baseline gap-1 mt-4">
                          <span class="text-4xl font-extrabold text-white">{{plan_pro_price}}</span>
                          <span class="text-xs text-gray-400">/ Recommended</span>
                      </div>
                      <p class="text-gray-400 text-xs mt-2">Our flagship full-service standard package.</p>
                  </div>
                  <ul class="space-y-3 text-sm text-gray-300 border-t border-white/5 pt-6">
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> {{plan_service_1}}</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> {{plan_service_2}}</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> Custom Consultation</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> Standard Support</li>
                  </ul>
              </div>
              <a href="https://wa.me/{{phone_clean}}?text=Hi! I am interested in the Pro Plan." target="_blank" class="w-full py-3 mt-8 rounded-full bg-primary hover:opacity-90 text-white font-bold text-center text-sm transition-all shadow-lg shadow-primary/20">Choose Plan</a>
          </div>

          <!-- Plan 3 -->
          <div class="glass p-8 rounded-3xl border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="300">
              <div class="space-y-6">
                  <div>
                      <h3 class="text-lg font-bold text-gray-400 font-display uppercase tracking-widest">Elite / VIP</h3>
                      <div class="flex items-baseline gap-1 mt-4">
                          <span class="text-4xl font-extrabold text-white">{{plan_elite_price}}</span>
                          <span class="text-xs text-gray-500">/ One-time</span>
                      </div>
                      <p class="text-gray-400 text-xs mt-2">Complete all-inclusive custom tailored premium tier.</p>
                  </div>
                  <ul class="space-y-3 text-sm text-gray-300 border-t border-white/5 pt-6">
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> {{plan_service_1}}</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> {{plan_service_2}}</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> {{plan_service_3}}</li>
                      <li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-primary"></i> Priority 24/7 Support</li>
                  </ul>
              </div>
              <a href="https://wa.me/{{phone_clean}}?text=Hi! I am interested in the VIP Plan." target="_blank" class="w-full py-3 mt-8 rounded-full border border-white/10 hover:bg-white/5 text-white font-bold text-center text-sm transition-all">Choose Plan</a>
          </div>
      </div>
  </section>
  `;
    // 9. Dynamic Gallery Showcase Template
    const compiledGallery = `
  <section id="gallery" class="py-24 px-6 relative border-t border-white/5">
      <div class="max-w-7xl mx-auto text-center space-y-4 mb-16">
          <span class="text-sm font-semibold uppercase tracking-wider text-primary">Gallery & Showcase</span>
          <h2 class="text-3xl sm:text-5xl font-bold font-display text-white">Visual Experience</h2>
          <p class="text-gray-400 max-w-xl mx-auto">Browse through our storefront, work portfolio, and luxury facilities.</p>
      </div>

      <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Image 1 -->
          <div class="relative rounded-3xl overflow-hidden glass p-2 border-white/5 group hover:border-white/15 transition-all duration-300" data-aos="zoom-in" data-aos-delay="100">
              <div class="relative aspect-square rounded-[1.5rem] overflow-hidden">
                  <img src="{{gallery_img_1}}" alt="Gallery 1" class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700">
                  <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-300 flex items-end p-6">
                      <span class="text-white font-semibold text-sm font-display">{{gallery_label_1}}</span>
                  </div>
              </div>
          </div>
          <!-- Image 2 -->
          <div class="relative rounded-3xl overflow-hidden glass p-2 border-white/5 group hover:border-white/15 transition-all duration-300" data-aos="zoom-in" data-aos-delay="200">
              <div class="relative aspect-square rounded-[1.5rem] overflow-hidden">
                  <img src="{{gallery_img_2}}" alt="Gallery 2" class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700">
                  <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-300 flex items-end p-6">
                      <span class="text-white font-semibold text-sm font-display">{{gallery_label_2}}</span>
                  </div>
              </div>
          </div>
          <!-- Image 3 -->
          <div class="relative rounded-3xl overflow-hidden glass p-2 border-white/5 group hover:border-white/15 transition-all duration-300" data-aos="zoom-in" data-aos-delay="300">
              <div class="relative aspect-square rounded-[1.5rem] overflow-hidden">
                  <img src="{{gallery_img_3}}" alt="Gallery 3" class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700">
                  <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-300 flex items-end p-6">
                      <span class="text-white font-semibold text-sm font-display">{{gallery_label_3}}</span>
                  </div>
              </div>
          </div>
          <!-- Image 4 -->
          <div class="relative rounded-3xl overflow-hidden glass p-2 border-white/5 group hover:border-white/15 transition-all duration-300" data-aos="zoom-in" data-aos-delay="400">
              <div class="relative aspect-square rounded-[1.5rem] overflow-hidden">
                  <img src="{{gallery_img_4}}" alt="Gallery 4" class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700">
                  <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-300 flex items-end p-6">
                      <span class="text-white font-semibold text-sm font-display">{{gallery_label_4}}</span>
                  </div>
              </div>
          </div>
      </div>
  </section>
  `;
    return {
        hero: compiledHero,
        about: compiledAbout,
        services: compiledServices,
        features: compiledFeatures,
        testimonials: compiledTestimonials,
        faq: compiledFAQ,
        footer: compiledFooter,
        pricing: compiledPricing,
        gallery: compiledGallery
    };
}
