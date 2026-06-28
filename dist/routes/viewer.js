"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = viewerRoutes;
const db_1 = require("../services/db");
async function viewerRoutes(fastify) {
    // 1. Render the generated business websites
    // ────────────────────────────────────────────────────────
    // SECRET PREVIEW TEMPLATES
    // ────────────────────────────────────────────────────────
    fastify.get('/preview/dark', async (request, reply) => {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Iron Edge Gym</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #09090b; color: white; }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.06); }
    .text-glow { text-shadow: 0 0 20px rgba(239,68,68,0.5); }
  </style>
</head>
<body>
  <nav class="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl p-4 flex justify-between items-center">
    <div class="font-black text-xl tracking-tighter">IRON<span class="text-red-500">EDGE</span></div>
    <div class="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">Join Now</div>
  </nav>
  <section class="relative min-h-screen flex items-center justify-center pt-20 px-6">
    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-40">
    <div class="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent"></div>
    <div class="relative z-10 text-center max-w-3xl">
      <h1 class="text-6xl md:text-8xl font-black italic tracking-tighter mb-4 uppercase">Forge Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 text-glow">Legacy</span></h1>
      <p class="text-zinc-400 text-lg mb-8">Premium equipment, elite trainers, and a community built on sheer willpower.</p>
      <div class="flex gap-4 justify-center">
        <div class="bg-red-500 text-white font-bold py-4 px-8 rounded-full uppercase tracking-wider">Start Trial</div>
      </div>
    </div>
  </section>
  <section class="py-20 px-6 bg-[#09090b]">
    <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
      <div class="glass rounded-2xl overflow-hidden group">
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&auto=format&fit=crop" class="h-48 w-full object-cover group-hover:scale-110 transition duration-500">
        <div class="p-6">
          <h3 class="font-bold text-xl mb-2">Personal Training</h3>
          <p class="text-zinc-400 text-sm">1-on-1 coaching with elite athletes.</p>
        </div>
      </div>
      <div class="glass rounded-2xl overflow-hidden group">
        <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop" class="h-48 w-full object-cover group-hover:scale-110 transition duration-500">
        <div class="p-6">
          <h3 class="font-bold text-xl mb-2">Pro Equipment</h3>
          <p class="text-zinc-400 text-sm">Top tier rogue fitness racks and weights.</p>
        </div>
      </div>
      <div class="glass rounded-2xl overflow-hidden group">
        <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80&auto=format&fit=crop" class="h-48 w-full object-cover group-hover:scale-110 transition duration-500">
        <div class="p-6">
          <h3 class="font-bold text-xl mb-2">Recovery Zone</h3>
          <p class="text-zinc-400 text-sm">Saunas and ice baths for optimal recovery.</p>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;
        return reply.type('text/html').send(html);
    });
    fastify.get('/preview/elegant', async (request, reply) => {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Aura Beauty Spa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Lato', sans-serif; background-color: #fafaf9; color: #292524; }
    h1, h2, h3, .serif { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body>
  <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 p-5 flex justify-between items-center text-stone-800">
    <div class="serif text-2xl tracking-widest uppercase">Aura</div>
    <div class="border border-stone-800 px-5 py-2 text-sm tracking-widest uppercase hover:bg-stone-800 hover:text-white transition">Book Now</div>
  </nav>
  <section class="min-h-[85vh] flex items-center justify-center pt-20 px-6 relative">
    <div class="absolute inset-0 bg-[#f5ebe6]"></div>
    <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
      <div>
        <div class="text-xs tracking-[0.3em] uppercase text-stone-500 mb-6">Wellness & Beauty</div>
        <h1 class="text-5xl md:text-7xl mb-6 leading-tight text-stone-800">Discover your<br><i class="text-stone-500">inner radiance.</i></h1>
        <p class="text-stone-600 text-lg mb-10 leading-relaxed font-light">Experience luxury treatments designed to rejuvenate your mind, body, and spirit in our tranquil sanctuary.</p>
        <div class="bg-stone-800 text-white px-8 py-4 uppercase tracking-widest text-sm inline-block hover:bg-stone-700 transition">View Treatments</div>
      </div>
      <div class="relative">
        <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80&auto=format&fit=crop" class="w-full rounded-t-full shadow-2xl">
      </div>
    </div>
  </section>
  <section class="py-24 px-6 bg-white">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl text-stone-800 mb-4">Our Signature Services</h2>
      <div class="w-12 h-px bg-stone-300 mx-auto"></div>
    </div>
    <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
      <div class="text-center group">
        <div class="overflow-hidden mb-6"><img src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80&auto=format&fit=crop" class="w-full h-80 object-cover group-hover:scale-105 transition duration-700"></div>
        <h3 class="text-xl mb-2">Deep Tissue Massage</h3>
        <p class="text-stone-500 font-light text-sm">Release tension and restore balance.</p>
      </div>
      <div class="text-center group">
        <div class="overflow-hidden mb-6"><img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&auto=format&fit=crop" class="w-full h-80 object-cover group-hover:scale-105 transition duration-700"></div>
        <h3 class="text-xl mb-2">Rejuvenating Facial</h3>
        <p class="text-stone-500 font-light text-sm">Glow with our organic skincare line.</p>
      </div>
      <div class="text-center group">
        <div class="overflow-hidden mb-6"><img src="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80&auto=format&fit=crop" class="w-full h-80 object-cover group-hover:scale-105 transition duration-700"></div>
        <h3 class="text-xl mb-2">Aromatherapy Spa</h3>
        <p class="text-stone-500 font-light text-sm">Sooth your senses with essential oils.</p>
      </div>
    </div>
  </section>
</body>
</html>`;
        return reply.type('text/html').send(html);
    });
    fastify.get('/preview/corporate', async (request, reply) => {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sterling & Co. Legal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style> body { font-family: 'Roboto', sans-serif; background-color: #f8fafc; color: #0f172a; } </style>
</head>
<body>
  <nav class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-blue-700 text-white font-bold flex items-center justify-center">S</div>
      <div class="font-bold text-xl text-slate-800 tracking-tight">Sterling & Co.</div>
    </div>
    <div class="bg-blue-700 text-white px-5 py-2 text-sm font-medium hover:bg-blue-800 transition">Free Consultation</div>
  </nav>
  <section class="bg-slate-900 text-white py-24 px-8 relative overflow-hidden">
    <div class="absolute right-0 top-0 w-1/2 h-full opacity-20">
      <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1600&q=80&auto=format&fit=crop" class="w-full h-full object-cover">
    </div>
    <div class="max-w-6xl mx-auto relative z-10">
      <div class="w-16 h-1 bg-blue-500 mb-8"></div>
      <h1 class="text-5xl md:text-6xl font-bold mb-6 max-w-2xl leading-tight">Expert Legal Counsel You Can Trust.</h1>
      <p class="text-slate-400 text-lg mb-10 max-w-xl">Over 20 years of experience protecting the rights and assets of businesses and individuals with uncompromising integrity.</p>
      <div class="bg-blue-600 text-white px-6 py-3 font-medium inline-block hover:bg-blue-500 transition shadow-lg">Our Practice Areas</div>
    </div>
  </section>
  <section class="py-20 px-8 max-w-6xl mx-auto">
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white p-8 border border-slate-200 shadow-sm hover:shadow-xl transition border-t-4 border-t-blue-600">
        <h3 class="text-xl font-bold mb-3">Corporate Law</h3>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed">Comprehensive legal strategies for businesses, from incorporation to mergers and acquisitions.</p>
        <div class="text-blue-600 font-bold text-sm uppercase">Learn More →</div>
      </div>
      <div class="bg-white p-8 border border-slate-200 shadow-sm hover:shadow-xl transition border-t-4 border-t-blue-600">
        <h3 class="text-xl font-bold mb-3">Real Estate</h3>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed">Expert guidance on commercial and residential property transactions, zoning, and disputes.</p>
        <div class="text-blue-600 font-bold text-sm uppercase">Learn More →</div>
      </div>
      <div class="bg-white p-8 border border-slate-200 shadow-sm hover:shadow-xl transition border-t-4 border-t-blue-600">
        <h3 class="text-xl font-bold mb-3">Asset Protection</h3>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed">Safeguarding your wealth through strategic estate planning, trusts, and risk mitigation.</p>
        <div class="text-blue-600 font-bold text-sm uppercase">Learn More →</div>
      </div>
    </div>
  </section>
</body>
</html>`;
        return reply.type('text/html').send(html);
    });
    fastify.get('/site/:siteId', async (request, reply) => {
        const { siteId } = request.params;
        const site = await db_1.db.getSite(siteId);
        if (!site) {
            return reply.code(404).type('text/html').send(render404Page());
        }
        const now = new Date();
        const trialExpired = site.billingStatus === 'trial' && now > new Date(site.trialEndsAt);
        const subscriptionInactive = site.billingStatus !== 'trial' && site.billingStatus !== 'active';
        if (trialExpired || subscriptionInactive) {
            return reply.type('text/html').send(renderSubscriptionPendingPage(site));
        }
        return reply.type('text/html').send(renderPremiumWebsite(site));
    });
    // 2. Mock Razorpay Domain Payment Page
    fastify.get('/pay/domain', async (request, reply) => {
        const { siteId, domain, paymentId } = request.query;
        return reply.type('text/html').send(renderPaymentPage('domain', siteId, domain, paymentId));
    });
    // 3. Mock Razorpay Subscription Page
    fastify.get('/pay/subscribe', async (request, reply) => {
        const { siteId, subscriptionId } = request.query;
        return reply.type('text/html').send(renderPaymentPage('subscription', siteId, undefined, subscriptionId));
    });
    // 4. Handle Mock Confirmation
    fastify.post('/pay/confirm', async (request, reply) => {
        const body = request.body;
        if (body.type === 'domain') {
            const site = await db_1.db.getSite(body.siteId);
            if (site) {
                site.customDomain = body.domain;
                site.domainStatus = 'paid';
                await db_1.db.saveSite(site);
            }
        }
        else if (body.type === 'subscription') {
            const site = await db_1.db.getSite(body.siteId);
            if (site) {
                site.billingStatus = 'active';
                await db_1.db.saveSite(site);
            }
        }
        return reply.type('text/html').send(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Payment Successful</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>body{font-family:'Inter',sans-serif}</style></head>
      <body class="bg-zinc-950 flex items-center justify-center min-h-screen">
        <div class="text-center p-10 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md">
          <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mx-auto mb-6 text-4xl">✓</div>
          <h1 class="text-2xl font-bold text-white mb-2">Payment Successful</h1>
          <p class="text-zinc-400 text-sm mb-8">Your website has been activated.</p>
          <a href="/site/${body.siteId}" class="inline-block bg-white text-zinc-900 font-semibold py-3 px-8 rounded-xl hover:bg-zinc-100 transition">View Website →</a>
        </div>
      </body></html>
    `);
    });
}
function getCategoryTheme(category) {
    const cat = category.toLowerCase();
    if (cat.includes('bakery') || cat.includes('cake') || cat.includes('sweet') || cat.includes('pastry') || cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe') || cat.includes('coffee') || cat.includes('kitchen')) {
        return {
            primary: 'amber',
            primaryHex: '#b45309',
            bgGradient: 'from-amber-50/30 via-stone-50 to-stone-100/30',
            accentText: 'text-amber-700',
            accentBg: 'bg-amber-700 hover:bg-amber-800 text-white',
            accentBorder: 'border-amber-200',
            accentGlow: 'shadow-amber-100',
            fontTitle: 'font-serif italic font-bold',
            fontFamilyTitle: "'Lora', serif",
            fontFamilyImport: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;1,600&display=swap'
        };
    }
    if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa') || cat.includes('makeup') || cat.includes('hair')) {
        return {
            primary: 'rose',
            primaryHex: '#e11d48',
            bgGradient: 'from-rose-50/40 via-stone-50 to-stone-100/50',
            accentText: 'text-rose-600',
            accentBg: 'bg-rose-600 hover:bg-rose-700 text-white',
            accentBorder: 'border-rose-200',
            accentGlow: 'shadow-rose-100',
            fontTitle: 'font-serif',
            fontFamilyTitle: "'Playfair Display', serif",
            fontFamilyImport: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap'
        };
    }
    if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('yoga') || cat.includes('training')) {
        return {
            primary: 'orange',
            primaryHex: '#ea580c',
            bgGradient: 'from-zinc-50 via-orange-50/10 to-zinc-100/30',
            accentText: 'text-orange-600',
            accentBg: 'bg-orange-600 hover:bg-orange-700 text-white',
            accentBorder: 'border-orange-200',
            accentGlow: 'shadow-orange-100',
            fontTitle: 'font-sans font-extrabold tracking-tighter uppercase italic',
            fontFamilyTitle: "'Montserrat', sans-serif",
            fontFamilyImport: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;1,800&display=swap'
        };
    }
    if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental') || cat.includes('health') || cat.includes('medical') || cat.includes('lawyer') || cat.includes('legal') || cat.includes('advocate')) {
        return {
            primary: 'blue',
            primaryHex: '#1d4ed8',
            bgGradient: 'from-slate-50 via-blue-50/20 to-slate-100/40',
            accentText: 'text-blue-700',
            accentBg: 'bg-blue-700 hover:bg-blue-800 text-white',
            accentBorder: 'border-blue-200',
            accentGlow: 'shadow-blue-100',
            fontTitle: 'font-sans font-bold tracking-tight',
            fontFamilyTitle: "'Outfit', sans-serif",
            fontFamilyImport: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&display=swap'
        };
    }
    return {
        primary: 'indigo',
        primaryHex: '#4f46e5',
        bgGradient: 'from-indigo-50/20 via-slate-50 to-slate-100/30',
        accentText: 'text-indigo-600',
        accentBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        accentBorder: 'border-indigo-200',
        accentGlow: 'shadow-indigo-100',
        fontTitle: 'font-sans font-bold tracking-tight',
        fontFamilyTitle: "'Inter', sans-serif",
        fontFamilyImport: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap'
    };
}
function renderPremiumWebsite(site) {
    const images = getCategoryImages(site.category);
    const theme = getCategoryTheme(site.category);
    const formatPrice = (price) => {
        if (price.toLowerCase().includes('contact'))
            return 'Contact Us';
        return price;
    };
    // On-the-fly copy text expansion to fix short content on existing registered sites
    let subtitle = site.heroSubtitle || '';
    if (subtitle.length < 120) {
        subtitle = `${subtitle} Discover unparalleled excellence and client-focused solutions tailored to meet your unique needs. We combine years of specialized experience with a passion for quality to deliver results you can depend on, every single time.`;
    }
    let story = site.storyContent || site.aboutText || '';
    if (story.length < 150) {
        story = `${story} Our journey began with a simple yet powerful mission: to serve our community with honest, high-quality, and reliable solutions. Over the years, we have grown into a trusted industry leader by never compromising on our core values. We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Whether you are seeking a consultation, a premium product, or a custom service solution, our experienced specialists work tirelessly to ensure your expectations are not just met, but exceeded.`;
    }
    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.businessName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="${theme.fontFamilyImport}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3, .theme-font-title { font-family: ${theme.fontFamilyTitle}; }
  </style>
</head>
<body class="bg-gradient-to-br ${theme.bgGradient} min-h-screen text-slate-800 antialiased selection:bg-${theme.primary}-100 selection:text-${theme.primary}-900">

  <!-- Navigation -->
  <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <a href="#" class="text-2xl font-bold tracking-tight text-slate-900 theme-font-title">${site.businessName}</a>
      
      <!-- Desktop Navigation Menu -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#about" class="text-sm font-medium text-slate-600 hover:text-${theme.primary}-600 transition-colors">About</a>
        <a href="#features" class="text-sm font-medium text-slate-600 hover:text-${theme.primary}-600 transition-colors">Why Choose Us</a>
        <a href="#services" class="text-sm font-medium text-slate-600 hover:text-${theme.primary}-600 transition-colors">Services</a>
        <a href="#testimonials" class="text-sm font-medium text-slate-600 hover:text-${theme.primary}-600 transition-colors">Reviews</a>
        <a href="#faq" class="text-sm font-medium text-slate-600 hover:text-${theme.primary}-600 transition-colors">FAQ</a>
        <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm ${theme.accentBg} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Chat Now</a>
      </div>

      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none" aria-label="Toggle Menu">
        <i class="fas fa-bars text-xl" id="menu-icon"></i>
      </button>
    </div>

    <!-- Mobile Navigation Dropdown Menu (Positioned absolutely to overlay content instead of pushing it down) -->
    <div id="mobile-menu" class="hidden md:hidden absolute top-full left-0 right-0 border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300">
      <div class="px-6 py-4 flex flex-col space-y-4">
        <a href="#about" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">About</a>
        <a href="#features" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Why Choose Us</a>
        <a href="#services" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Services</a>
        <a href="#testimonials" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Reviews</a>
        <a href="#faq" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">FAQ</a>
        <a href="https://wa.me/${site.phoneNumber}" class="mobile-nav-link inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold rounded-xl shadow-sm ${theme.accentBg} transition-all duration-200">Chat Now</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-12 gap-12 items-center">
    <div class="md:col-span-7 flex flex-col justify-center text-left">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-${theme.primary}-50 text-${theme.primary}-700 border border-${theme.primary}-100 mb-6 w-fit">
        <span class="w-1.5 h-1.5 rounded-full bg-${theme.primary}-500 animate-pulse"></span>
        Welcome to ${site.businessName}
      </span>
      <h1 class="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 ${theme.fontTitle}">
        ${site.heroTitle || site.businessName}
      </h1>
      <p class="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
        ${subtitle}
      </p>
      <div class="flex flex-col sm:flex-row gap-4">
        <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full shadow-md ${theme.accentBg} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          Contact on WhatsApp
        </a>
        <a href="#services" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          View Our Offers
        </a>
      </div>
    </div>
    <div class="md:col-span-5 relative">
      <div class="absolute inset-0 bg-gradient-to-tr from-${theme.primary}-500 to-indigo-500 rounded-3xl rotate-3 scale-95 blur-2xl opacity-20 animate-pulse"></div>
      <div class="relative bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
        <img src="${images.hero}" alt="${site.businessName} Hero Image" class="w-full aspect-[4/5] object-cover rounded-2xl shadow-inner">
      </div>
    </div>
  </header>

  <!-- About Section -->
  <section id="about" class="py-24 bg-white border-y border-slate-100">
    <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
      <div class="md:col-span-5">
        <div class="relative bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <img src="${images.about}" alt="About ${site.businessName}" class="w-full aspect-square object-cover rounded-2xl shadow-md">
        </div>
      </div>
      <div class="md:col-span-7 text-left">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6 theme-font-title">
          ${site.storyTitle || "Our Story"}
        </h2>
        <div class="w-16 h-1 bg-${theme.primary}-500 mb-8 rounded-full"></div>
        <p class="text-lg text-slate-600 leading-relaxed mb-8">
          ${story}
        </p>
        <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
          Learn More About Us
        </a>
      </div>
    </div>
  </section>

  <!-- Why Choose Us / Features Section -->
  <section id="features" class="py-24 max-w-6xl mx-auto px-6 border-b border-slate-100">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 theme-font-title">Why Choose Us</h2>
      <p class="text-slate-600">We are committed to delivering excellence and building long-term relationships based on outstanding results.</p>
      <div class="w-16 h-1 bg-${theme.primary}-500 mx-auto mt-6 rounded-full"></div>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      ${(site.features || [
        { title: 'Premium Quality Assurance', description: 'We source only the finest materials, leverage advanced techniques, and enforce rigorous quality checks to ensure that every single deliverable meets the absolute highest industry standards of excellence, durability, and safety.' },
        { title: 'Experienced Specialists', description: 'Our professionals bring years of expertise and dedication to every client request. Our crew consists of highly trained, certified, and passionate professionals who bring decades of combined experience and problem-solving focus to all we do.' },
        { title: 'Client Centric Partnership', description: 'Your satisfaction is our primary goal. We tailor our services to match your vision. We take the time to understand your exact requirements, provide transparent updates, and offer flexible solutions to guarantee satisfaction.' }
    ]).map((feat) => `
        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left">
          <div class="w-12 h-12 rounded-2xl bg-${theme.primary}-50 text-${theme.primary}-600 flex items-center justify-center font-bold text-xl mb-6">✓</div>
          <h3 class="font-bold text-xl text-slate-900 mb-3">${feat.title}</h3>
          <p class="text-sm text-slate-600 leading-relaxed">${feat.description}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- Services / Products Section -->
  <section id="services" class="py-24 max-w-6xl mx-auto px-6">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 theme-font-title">What We Offer</h2>
      <p class="text-slate-600">Select any of our services below to connect directly with us and order via WhatsApp.</p>
      <div class="w-16 h-1 bg-${theme.primary}-500 mx-auto mt-6 rounded-full"></div>
    </div>
    
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      ${site.services.map((item, i) => {
        let desc = item.description || '';
        if (desc.length < 80) {
            desc = `${desc} We take pride in providing this professional service built on years of expertise. We focus on delivering top-tier details, client consultation, and custom adjustments to fit your exact goals.`;
        }
        return `<div class="group flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
          <div class="overflow-hidden aspect-video bg-slate-50 relative">
            <img src="${images.products[i % images.products.length]}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          </div>
          <div class="p-6 flex flex-col flex-grow text-left">
            <div class="flex justify-between items-start mb-3 gap-2">
              <h3 class="font-bold text-lg text-slate-900 group-hover:${theme.accentText} transition-colors">${item.name}</h3>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-${theme.primary}-50 text-${theme.primary}-700 shrink-0">
                ${formatPrice(item.price)}
              </span>
            </div>
            <p class="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">${desc}</p>
            <a href="https://wa.me/${site.phoneNumber}?text=${encodeURIComponent('Hi! I am interested in ' + item.name)}" class="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold rounded-2xl shadow-sm ${theme.accentBg} transition-all duration-200">
              Order via WhatsApp
            </a>
          </div>
        </div>`;
    }).join('')}
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonials" class="py-24 bg-white border-y border-slate-100">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 theme-font-title">Client Stories</h2>
        <p class="text-slate-600">Hear directly from some of our valued clients about their experiences working with us.</p>
        <div class="w-16 h-1 bg-${theme.primary}-500 mx-auto mt-6 rounded-full"></div>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${(site.testimonials || [
        { name: 'Aarav Mehta', role: 'Regular Client', content: 'The level of professionalism and care they brought to the table was simply outstanding. They understood my requirements perfectly, kept me informed at every step, and delivered a result that was far better than I could have imagined. I highly recommend them to anyone seeking top-tier service!' },
        { name: 'Priya Sharma', role: 'Local Customer', content: 'I have been a customer for over a year now, and I can confidently say their consistency is unmatched. From their helpful support to the superb final delivery, every interaction is a pleasant experience. It is rare to find a business that cares this much about its clients.' },
        { name: 'Rohan Gupta', role: 'Business Owner', content: 'They exceeded my expectations in every possible way. The project was completed on time, within budget, and the attention to details was absolutely spectacular. Their team is knowledgeable, responsive, and incredibly dedicated to customer success. Five stars!' }
    ]).map((t) => `
          <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
            <p class="text-sm text-slate-600 italic leading-relaxed mb-6">"${t.content}"</p>
            <div>
              <h4 class="font-bold text-slate-950 text-base">${t.name}</h4>
              <p class="text-xs text-slate-500">${t.role}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="py-24 max-w-4xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 theme-font-title">Frequently Asked Questions</h2>
      <p class="text-slate-600">Got questions? We have got answers. If you do not see your question here, feel free to WhatsApp us.</p>
      <div class="w-16 h-1 bg-${theme.primary}-500 mx-auto mt-6 rounded-full"></div>
    </div>
    <div class="space-y-6">
      ${(site.faqs || [
        { question: 'What are your operating hours?', answer: 'We are fully operational Monday through Saturday from 10:00 AM to 8:00 PM. Our team is available to assist you during these hours, and you can always send us a message via WhatsApp to schedule an appointment outside these times if needed.' },
        { question: 'How do I book a service or order?', answer: 'Booking is incredibly easy and direct. Simply scroll to our services section, select the offering you are interested in, and click the "Order via WhatsApp" button. This will open a chat with us containing the service details so we can finalize your booking instantly.' },
        { question: 'Where are you located and do you offer delivery?', answer: 'We are based in local area, India, serving clients across the region. If you need precise directions, maps, or want to check if we service your specific area, feel free to send us a message on WhatsApp and we will share our location details.' }
    ]).map((faq) => `
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
          <h3 class="font-bold text-lg text-slate-950 mb-2 flex items-start gap-3">
            <span class="text-${theme.primary}-500 shrink-0">Q.</span>
            <span>${faq.question}</span>
          </h3>
          <p class="text-sm text-slate-600 pl-6 leading-relaxed">${faq.answer}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-900 text-white py-16 border-t border-slate-800">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-4 theme-font-title">${site.businessName}</h2>
      <p class="text-slate-400 max-w-md mx-auto mb-8">Ready to get started? Send us a message on WhatsApp right now and let us know what you need.</p>
      <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full shadow-lg ${theme.accentBg} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-12">
        Chat With Us Now
      </a>
      <div class="w-full h-px bg-slate-800 mb-8"></div>
      <p class="text-xs text-slate-600">© 2026 ${site.businessName}. Powered by The Gray Arc.</p>
    </div>
  </footer>

  <!-- Floating Sticky Contact Buttons -->
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <!-- WhatsApp Sticky Button -->
    <a href="https://wa.me/${site.phoneNumber}" target="_blank" rel="noopener noreferrer" 
       class="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group relative">
      <i class="fab fa-whatsapp text-xl"></i>
      <span class="absolute right-12 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">Chat on WhatsApp</span>
    </a>
    <!-- Call Sticky Button -->
    <a href="tel:${site.phoneNumber}" 
       class="w-10 h-10 bg-[#00E676] hover:bg-[#00c853] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group relative">
      <i class="fas fa-phone text-base"></i>
      <span class="absolute right-12 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">Call Us Now</span>
    </a>
  </div>

  <!-- Mobile Menu Toggle JavaScript -->
  <script>
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (menuBtn && mobileMenu && menuIcon) {
      menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
          mobileMenu.classList.remove('hidden');
          menuIcon.classList.remove('fa-bars');
          menuIcon.classList.add('fa-xmark');
        } else {
          mobileMenu.classList.add('hidden');
          menuIcon.classList.remove('fa-xmark');
          menuIcon.classList.add('fa-bars');
        }
      });
      
      // Close menu when clicking links
      const links = mobileMenu.querySelectorAll('.mobile-nav-link');
      links.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          menuIcon.classList.remove('fa-xmark');
          menuIcon.classList.add('fa-bars');
        });
      });
    }
  </script>

</body>
</html>`;
}
function getCategoryImages(category) {
    const cat = category.toLowerCase();
    if (cat.includes('bakery') || cat.includes('cake') || cat.includes('sweet') || cat.includes('pastry')) {
        return {
            hero: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1600&q=80&auto=format&fit=crop',
            about: 'https://images.unsplash.com/photo-1556217477-d325251ece38?w=800&q=80&auto=format&fit=crop',
            products: [
                'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1486427944544-d2c246c4df14?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80&auto=format&fit=crop',
            ],
        };
    }
    if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('coffee') || cat.includes('kitchen')) {
        return {
            hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop',
            about: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop',
            products: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80&auto=format&fit=crop',
            ],
        };
    }
    if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa') || cat.includes('makeup') || cat.includes('hair')) {
        return {
            hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80&auto=format&fit=crop',
            about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop',
            products: [
                'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80&auto=format&fit=crop',
            ],
        };
    }
    if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('yoga') || cat.includes('training')) {
        return {
            hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop',
            about: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80&auto=format&fit=crop',
            products: [
                'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80&auto=format&fit=crop',
            ],
        };
    }
    if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental') || cat.includes('health') || cat.includes('medical')) {
        return {
            hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=80&auto=format&fit=crop',
            about: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80&auto=format&fit=crop',
            products: [
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&auto=format&fit=crop',
            ],
        };
    }
    if (cat.includes('tech') || cat.includes('software') || cat.includes('it') || cat.includes('digital') || cat.includes('web')) {
        return {
            hero: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80&auto=format&fit=crop',
            about: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80&auto=format&fit=crop',
            products: [
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&auto=format&fit=crop',
            ],
        };
    }
    // Default: Professional business imagery
    return {
        hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop',
        about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop',
        products: [
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80&auto=format&fit=crop',
        ],
    };
}
// ────────────────────────────────────────────────────────
// HELPER PAGES
// ────────────────────────────────────────────────────────
function render404Page() {
    return `<!DOCTYPE html><html><head><title>Not Found</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif}</style></head>
    <body class="bg-zinc-950 flex items-center justify-center h-screen">
      <div class="text-center p-10">
        <div class="text-8xl font-black text-zinc-800 mb-4">404</div>
        <h1 class="text-xl font-bold text-white mb-2">Website Not Found</h1>
        <p class="text-zinc-500 mb-8 text-sm">This website doesn't exist or has been removed.</p>
        <a href="https://thegrayarc.com" class="bg-white text-zinc-900 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition">Create Your Website</a>
      </div>
    </body></html>`;
}
function renderSubscriptionPendingPage(site) {
    return `<!DOCTYPE html><html><head><title>Subscription Required — ${site.businessName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif}</style></head>
    <body class="bg-zinc-950 flex items-center justify-center min-h-screen px-4">
      <div class="text-center p-10 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg">
        <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-full mx-auto mb-6 text-2xl">⚠</div>
        <h1 class="text-2xl font-bold text-white mb-3">Trial Expired</h1>
        <p class="text-zinc-400 text-sm mb-8">The 30-day free trial for <strong class="text-white">${site.businessName}</strong> has ended. Reactivate your website for just ₹399/month.</p>
        <a href="/pay/subscribe?siteId=${site.id}" class="inline-block bg-white text-zinc-900 font-bold py-4 px-8 rounded-xl hover:bg-zinc-100 transition">
          Reactivate (₹399/mo)
        </a>
      </div>
    </body></html>`;
}
function renderPaymentPage(type, siteId, domain, paymentId) {
    const isDomain = type === 'domain';
    return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>${isDomain ? 'Domain Payment' : 'Subscription'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif}</style></head>
    <body class="bg-zinc-950 flex items-center justify-center min-h-screen">
      <div class="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md">
        <div class="flex justify-between items-center mb-8">
          <span class="text-blue-400 font-bold text-lg">Razorpay</span>
          <span class="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full font-semibold border border-blue-500/20">Test Mode</span>
        </div>
        <div class="mb-8">
          <div class="text-zinc-500 text-sm">${isDomain ? 'Domain Registration' : 'Monthly Subscription'}</div>
          <div class="text-4xl font-black text-white mt-1">${isDomain ? '₹500' : '₹399'}<span class="text-sm font-normal text-zinc-500">${isDomain ? '' : ' /month'}</span></div>
          ${isDomain ? `<p class="text-zinc-500 text-sm mt-3">Domain: <strong class="text-white">${domain}</strong></p>` : '<p class="text-zinc-500 text-xs mt-2">Recurring UPI AutoPay mandate</p>'}
        </div>
        <form action="/pay/confirm" method="POST">
          <input type="hidden" name="type" value="${type}">
          <input type="hidden" name="siteId" value="${siteId}">
          ${isDomain ? `<input type="hidden" name="domain" value="${domain}">` : `<input type="hidden" name="subscriptionId" value="${paymentId}">`}
          <button type="submit" class="w-full ${isDomain ? 'bg-blue-500 hover:bg-blue-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-white font-bold py-4 rounded-xl transition shadow-lg">
            ${isDomain ? 'Pay via UPI' : 'Authorize UPI AutoPay'}
          </button>
        </form>
        <p class="text-center text-xs text-zinc-600 mt-6">🔒 Secured by Razorpay</p>
      </div>
    </body></html>`;
}
