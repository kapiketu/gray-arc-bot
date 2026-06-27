"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = viewerRoutes;
const db_1 = require("../services/db");
async function viewerRoutes(fastify) {
    // 1. Render the generated business websites
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
// ────────────────────────────────────────────────────────
// PREMIUM WEBSITE TEMPLATE
// ────────────────────────────────────────────────────────
function renderPremiumWebsite(site) {
    // Clean up category - extract only first meaningful word/phrase
    const cleanCategory = site.category.split('\n')[0].replace(/^category:\s*/i, '').trim().split(' ').slice(0, 3).join(' ');
    // Determine color palette based on category
    const palette = getSmartPalette(cleanCategory, site.theme);
    // Get category-specific stock images
    const images = getCategoryImages(cleanCategory);
    // Generate product cards with images
    const productsHtml = site.services.map((item, i) => `
    <div class="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1" style="animation: fadeUp 0.6s ease-out ${0.1 * i}s both">
      <div class="h-48 overflow-hidden">
        <img src="${images.products[i % images.products.length]}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy">
      </div>
      <div class="p-7">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-white">${item.name}</h3>
          <span class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${palette.textGradientClass} shrink-0 ml-3">${item.price}</span>
        </div>
        <p class="text-zinc-400 text-sm leading-relaxed mb-5">${item.description}</p>
        <a href="https://wa.me/${site.phoneNumber}?text=${encodeURIComponent('Hi! I am interested in ' + item.name)}" 
           class="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition group-hover:gap-3">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.648-1.373A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.42-.302-2.755.813.858-2.686-.332-.472A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          Order on WhatsApp
        </a>
      </div>
    </div>
  `).join('');
    // Build stats section
    const yearsInBusiness = Math.floor(Math.random() * 8) + 3;
    const happyCustomers = (Math.floor(Math.random() * 50) + 10) * 100;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.businessName} — ${cleanCategory}</title>
  <meta name="description" content="${site.heroSubtitle}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Inter', system-ui, sans-serif; }
    
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px ${palette.glowColor}33; }
      50% { box-shadow: 0 0 40px ${palette.glowColor}55; }
    }
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .animate-fade-up { animation: fadeUp 0.8s ease-out both; }
    .animate-fade-in { animation: fadeIn 1s ease-out both; }
    .animate-slide-in { animation: slideIn 0.6s ease-out both; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    .hero-gradient {
      background: radial-gradient(ellipse 80% 50% at 50% -20%, ${palette.glowColor}22 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 80% 50%, ${palette.accentGlow}15 0%, transparent 50%);
    }
    
    .mesh-gradient {
      background: 
        radial-gradient(at 40% 20%, ${palette.glowColor}18 0px, transparent 50%),
        radial-gradient(at 80% 0%, ${palette.accentGlow}12 0px, transparent 50%),
        radial-gradient(at 0% 50%, ${palette.glowColor}08 0px, transparent 50%);
    }
    
    .text-gradient {
      background: linear-gradient(135deg, ${palette.gradientFrom}, ${palette.gradientTo});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .card-shine:hover::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .stat-number {
      background: linear-gradient(180deg, #fff 0%, #999 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    html { scroll-behavior: smooth; }
    
    .scroll-reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 antialiased">

  <!-- ══════════ NAVBAR ══════════ -->
  <nav class="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${palette.iconGradient} flex items-center justify-center text-white font-bold text-sm">${site.businessName.charAt(0)}</div>
        <span class="font-bold text-white text-lg tracking-tight">${site.businessName}</span>
      </a>
      <div class="hidden md:flex items-center gap-8 text-sm text-zinc-400">
        <a href="#about" class="hover:text-white transition-colors duration-300">About</a>
        <a href="#services" class="hover:text-white transition-colors duration-300">Services</a>
        <a href="#contact" class="hover:text-white transition-colors duration-300">Contact</a>
        <a href="https://wa.me/${site.phoneNumber}" class="bg-white text-zinc-900 font-semibold px-5 py-2 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
          Get in Touch
        </a>
      </div>
      <button onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden text-white p-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl">
      <div class="px-6 py-4 space-y-3">
        <a href="#about" class="block text-zinc-300 hover:text-white py-2">About</a>
        <a href="#services" class="block text-zinc-300 hover:text-white py-2">Services</a>
        <a href="#contact" class="block text-zinc-300 hover:text-white py-2">Contact</a>
        <a href="https://wa.me/${site.phoneNumber}" class="block bg-white text-zinc-900 font-semibold px-5 py-3 rounded-xl text-center mt-2">Get in Touch</a>
      </div>
    </div>
  </nav>

  <!-- ══════════ HERO ══════════ -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
    <!-- Hero background image -->
    <div class="absolute inset-0">
      <img src="${images.hero}" alt="${site.businessName}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-zinc-950/70"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/30"></div>
    </div>
    
    <!-- Decorative orbs -->
    <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br ${palette.iconGradient} rounded-full opacity-[0.12] blur-3xl animate-float"></div>

    <div class="relative max-w-4xl mx-auto px-6 text-center pt-20">
      <div class="animate-fade-up" style="animation-delay: 0.1s">
        <span class="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ${cleanCategory}
        </span>
      </div>
      
      <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] animate-fade-up" style="animation-delay: 0.2s">
        <span class="text-white">${site.heroTitle.split(' ').slice(0, -1).join(' ')} </span>
        <span class="text-gradient">${site.heroTitle.split(' ').slice(-1)[0]}</span>
      </h1>
      
      <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mt-8 leading-relaxed animate-fade-up" style="animation-delay: 0.4s">
        ${site.heroSubtitle.length > 20 ? site.heroSubtitle : site.storyContent.substring(0, 150) + '...'}
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-up" style="animation-delay: 0.6s">
        <a href="#services" class="group bg-white text-zinc-900 font-semibold py-4 px-8 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:shadow-xl hover:shadow-white/10 flex items-center justify-center gap-2">
          Explore Our Work
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
        <a href="https://wa.me/${site.phoneNumber}" class="group border border-white/[0.12] bg-white/[0.03] backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-full hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex items-center justify-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          Chat with Us
        </a>
      </div>
    </div>
    
    <!-- Bottom fade -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent"></div>
  </section>

  <!-- ══════════ STATS BAR ══════════ -->
  <section class="border-y border-white/[0.06] bg-zinc-950">
    <div class="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 scroll-reveal">
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-black stat-number">${yearsInBusiness}+</div>
        <div class="text-zinc-500 text-sm mt-1">Years of Excellence</div>
      </div>
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-black stat-number">${happyCustomers.toLocaleString()}+</div>
        <div class="text-zinc-500 text-sm mt-1">Happy Customers</div>
      </div>
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-black stat-number">${site.services.length}</div>
        <div class="text-zinc-500 text-sm mt-1">Premium Offerings</div>
      </div>
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-black stat-number">4.9</div>
        <div class="text-zinc-500 text-sm mt-1 flex items-center justify-center gap-1">
          <span class="text-amber-400">★★★★★</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ ABOUT ══════════ -->
  <section id="about" class="relative py-24 md:py-32 mesh-gradient">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="scroll-reveal">
          <span class="inline-block text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r ${palette.textGradientClass} mb-4">Our Story</span>
          <h2 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">${site.storyTitle}</h2>
          <p class="text-zinc-400 text-base md:text-lg leading-relaxed mt-6">${site.storyContent}</p>
          <div class="flex gap-4 mt-8">
            <a href="https://wa.me/${site.phoneNumber}" class="bg-white/[0.06] border border-white/[0.1] text-white font-medium py-3 px-6 rounded-xl hover:bg-white/[0.1] transition-all duration-300">
              Learn More →
            </a>
          </div>
        </div>
        <div class="scroll-reveal relative">
          <div class="aspect-[4/3] rounded-3xl overflow-hidden relative">
            <img src="${images.about}" alt="About ${site.businessName}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent"></div>
          </div>
          <div class="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border border-white/[0.06] -z-10"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ SERVICES ══════════ -->
  <section id="services" class="py-24 md:py-32 relative">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-16 scroll-reveal">
        <span class="inline-block text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r ${palette.textGradientClass} mb-4">What We Offer</span>
        <h2 class="text-3xl md:text-5xl font-black text-white tracking-tight">Our Services & Products</h2>
        <p class="text-zinc-500 text-base mt-4 max-w-lg mx-auto">Handcrafted with passion, delivered with excellence.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${productsHtml}
      </div>
    </div>
  </section>

  <!-- ══════════ CONTACT ══════════ -->
  <section id="contact" class="py-24 md:py-32 border-t border-white/[0.06] relative mesh-gradient">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-16">
        <div class="scroll-reveal">
          <span class="inline-block text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r ${palette.textGradientClass} mb-4">Contact</span>
          <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">Let's Connect</h2>
          <p class="text-zinc-400 mt-4 leading-relaxed">We'd love to hear from you. Reach out via WhatsApp for the fastest response.</p>
          
          <div class="mt-10 space-y-6">
            <div class="flex items-start gap-4 group">
              <div class="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg shrink-0 group-hover:bg-white/[0.08] transition">📍</div>
              <div>
                <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Address</div>
                <div class="text-zinc-300 text-sm">${site.contactDetails.address.replace(/\n/g, ', ')}</div>
              </div>
            </div>
            <div class="flex items-start gap-4 group">
              <div class="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg shrink-0 group-hover:bg-white/[0.08] transition">📞</div>
              <div>
                <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Phone</div>
                <div class="text-zinc-300 text-sm">${site.contactDetails.phone}</div>
              </div>
            </div>
            <div class="flex items-start gap-4 group">
              <div class="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg shrink-0 group-hover:bg-white/[0.08] transition">✉️</div>
              <div>
                <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email</div>
                <div class="text-zinc-300 text-sm">${site.contactDetails.email}</div>
              </div>
            </div>
            <div class="flex items-start gap-4 group">
              <div class="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg shrink-0 group-hover:bg-white/[0.08] transition">⏰</div>
              <div>
                <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Business Hours</div>
                <div class="text-zinc-300 text-sm">${site.contactDetails.hours}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="scroll-reveal">
          <div class="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8">
            <h3 class="font-bold text-lg text-white mb-6">Send us a Message</h3>
            <form onsubmit="event.preventDefault(); window.open('https://wa.me/${site.phoneNumber}?text=' + encodeURIComponent(this.message.value), '_blank');" class="space-y-4">
              <input name="name" type="text" placeholder="Your Name" class="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] outline-none transition text-sm">
              <input name="email" type="email" placeholder="Email Address" class="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] outline-none transition text-sm">
              <textarea name="message" placeholder="Tell us what you need..." rows="4" class="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] outline-none transition text-sm resize-none"></textarea>
              <button class="w-full bg-white text-zinc-900 font-semibold py-4 rounded-xl hover:bg-zinc-100 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ FOOTER ══════════ -->
  <footer class="border-t border-white/[0.06] py-10">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-600">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br ${palette.iconGradient} flex items-center justify-center text-white font-bold text-[10px]">${site.businessName.charAt(0)}</div>
        <span>© ${new Date().getFullYear()} ${site.businessName}</span>
      </div>
      <div>Crafted by <a href="https://thegrayarc.com" class="text-zinc-400 hover:text-white transition-colors font-medium">Gray Arc</a></div>
    </div>
  </footer>

  <!-- ══════════ FLOATING WHATSAPP BUTTON ══════════ -->
  <a href="https://wa.me/${site.phoneNumber}" target="_blank" 
     class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 transition-all duration-300"
     style="animation: pulse-glow 3s ease-in-out infinite">
    <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.648-1.373A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.42-.302-2.755.813.858-2.686-.332-.472A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
  </a>

  <!-- ══════════ SCROLL ANIMATION SCRIPT ══════════ -->
  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  </script>

</body>
</html>`;
}
function getSmartPalette(category, theme) {
    const cat = category.toLowerCase();
    if (cat.includes('bakery') || cat.includes('cake') || cat.includes('food') || cat.includes('sweet') || cat.includes('restaurant') || cat.includes('cafe')) {
        return {
            iconGradient: 'from-amber-500 to-orange-600',
            glowColor: '#f59e0b',
            accentGlow: '#ea580c',
            gradientFrom: '#f59e0b',
            gradientTo: '#ea580c',
            textGradientClass: 'from-amber-400 to-orange-500',
        };
    }
    if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa') || cat.includes('makeup')) {
        return {
            iconGradient: 'from-rose-500 to-pink-600',
            glowColor: '#f43f5e',
            accentGlow: '#ec4899',
            gradientFrom: '#f43f5e',
            gradientTo: '#ec4899',
            textGradientClass: 'from-rose-400 to-pink-500',
        };
    }
    if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('yoga')) {
        return {
            iconGradient: 'from-red-500 to-orange-600',
            glowColor: '#ef4444',
            accentGlow: '#f97316',
            gradientFrom: '#ef4444',
            gradientTo: '#f97316',
            textGradientClass: 'from-red-400 to-orange-500',
        };
    }
    if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental') || cat.includes('health') || cat.includes('medical')) {
        return {
            iconGradient: 'from-cyan-500 to-blue-600',
            glowColor: '#06b6d4',
            accentGlow: '#3b82f6',
            gradientFrom: '#06b6d4',
            gradientTo: '#3b82f6',
            textGradientClass: 'from-cyan-400 to-blue-500',
        };
    }
    if (cat.includes('tech') || cat.includes('software') || cat.includes('it') || cat.includes('digital')) {
        return {
            iconGradient: 'from-violet-500 to-purple-600',
            glowColor: '#8b5cf6',
            accentGlow: '#a855f7',
            gradientFrom: '#8b5cf6',
            gradientTo: '#a855f7',
            textGradientClass: 'from-violet-400 to-purple-500',
        };
    }
    // Default elegant palette
    return {
        iconGradient: 'from-blue-500 to-indigo-600',
        glowColor: '#3b82f6',
        accentGlow: '#6366f1',
        gradientFrom: '#3b82f6',
        gradientTo: '#6366f1',
        textGradientClass: 'from-blue-400 to-indigo-500',
    };
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
