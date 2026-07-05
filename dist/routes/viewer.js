"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = viewerRoutes;
const db_1 = require("../services/db");
const domains_1 = require("../services/domains");
const whatsapp_1 = require("../services/whatsapp");
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
    fastify.get('/', async (request, reply) => {
        const hostname = request.hostname || request.headers.host || '';
        console.log(`[viewer] Request on root '/' from hostname: ${hostname}`);
        // Try to lookup site by custom domain
        const site = await db_1.db.getSiteByDomain(hostname);
        if (site) {
            const now = new Date();
            const trialExpired = site.billingStatus === 'trial' && now > new Date(site.trialEndsAt);
            const subscriptionInactive = site.billingStatus !== 'trial' && site.billingStatus !== 'active';
            if (trialExpired || subscriptionInactive) {
                return reply.type('text/html').send(renderSubscriptionPendingPage(site));
            }
            return reply.type('text/html').send(renderPremiumWebsite(site, site.template));
        }
        // Default main landing page when accessing root of main builder app
        return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Gray Arc Website Builder</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
      <style>body { font-family: 'Outfit', sans-serif; }</style>
    </head>
    <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center relative overflow-hidden">
      <div class="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -top-40 -left-40"></div>
      <div class="absolute w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl -bottom-40 -right-40"></div>
      
      <div class="max-w-xl p-8 bg-zinc-950/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/5 text-center relative z-10 mx-6">
        <div class="w-16 h-1 bg-gradient-to-r from-indigo-500 to-green-500 mx-auto mb-8 rounded-full"></div>
        <h1 class="text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-green-400 text-transparent bg-clip-text">The Gray Arc</h1>
        <p class="text-zinc-400 text-base mb-8 max-w-md mx-auto leading-relaxed">
          Create premium, high-converting business websites instantly directly through WhatsApp! Powered by AI.
        </p>
        <a href="https://wa.me/919693186322" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full bg-gradient-to-r from-indigo-600 to-green-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-white">
          Build Your Website Now
        </a>
      </div>
    </body>
    </html>
  `);
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
        const { template } = request.query;
        return reply.type('text/html').send(renderPremiumWebsite(site, template || site.template));
    });
    // 2. Mock Razorpay Domain Payment Page
    fastify.get('/pay/domain', async (request, reply) => {
        const { siteId, domain, paymentId, price } = request.query;
        const priceNum = price ? parseInt(price) : 500;
        return reply.type('text/html').send(renderPaymentPage('domain', siteId, domain, paymentId, priceNum));
    });
    // 3. Mock Razorpay Subscription Page
    fastify.get('/pay/subscribe', async (request, reply) => {
        const { siteId, subscriptionId, domain, addon } = request.query;
        const priceNum = addon ? parseInt(addon) : undefined;
        return reply.type('text/html').send(renderPaymentPage('subscription', siteId, domain, subscriptionId, priceNum));
    });
    // 4. Handle Mock Confirmation
    fastify.post('/pay/confirm', async (request, reply) => {
        const body = request.body;
        if (body.type === 'domain') {
            const site = await db_1.db.getSite(body.siteId);
            if (site) {
                // Construct registrant contact details from form inputs
                const registrant = {
                    nameFirst: body.name ? body.name.split(' ')[0] : 'Gray',
                    nameLast: body.name && body.name.split(' ').length > 1 ? body.name.split(' ').slice(1).join(' ') : 'Arc',
                    email: body.email || 'domains@thegrayarc.com',
                    address1: body.address1 || '123 Tech Square',
                    city: body.city || 'Mumbai',
                    state: body.state || 'Maharashtra',
                    postalCode: body.postalCode || '400001'
                };
                // 1. Purchase domain via GoDaddy API
                await (0, domains_1.purchaseDomain)(body.domain, site.phoneNumber, registrant);
                // 2. Automate DNS Setup (point CNAME records to Railway)
                await (0, domains_1.setupDomainDNS)(body.domain);
                site.customDomain = body.domain;
                site.domainStatus = 'paid';
                await db_1.db.saveSite(site);
            }
        }
        else if (body.type === 'subscription') {
            const site = await db_1.db.getSite(body.siteId);
            if (site) {
                site.billingStatus = 'active';
                // If it's a combined subscription + domain registration
                if (body.domain) {
                    const registrant = {
                        nameFirst: body.name ? body.name.split(' ')[0] : 'Gray',
                        nameLast: body.name && body.name.split(' ').length > 1 ? body.name.split(' ').slice(1).join(' ') : 'Arc',
                        email: body.email || 'domains@thegrayarc.com',
                        address1: body.address1 || '123 Tech Square',
                        city: body.city || 'Mumbai',
                        state: body.state || 'Maharashtra',
                        postalCode: body.postalCode || '400001'
                    };
                    const addonPrice = body.addon ? parseInt(body.addon) : 0;
                    if (addonPrice > 0) {
                        // 1. Purchase domain under registrant
                        await (0, domains_1.purchaseDomain)(body.domain, site.phoneNumber, registrant);
                        // 2. Automate CNAME DNS Setup
                        await (0, domains_1.setupDomainDNS)(body.domain);
                        site.domainStatus = 'paid';
                    }
                    else {
                        console.log(`[Domain Service] Connecting existing owned domain: ${body.domain}`);
                        site.domainStatus = 'active';
                    }
                    site.customDomain = body.domain;
                }
                await db_1.db.saveSite(site);
            }
        }
        // Send a congratulations WhatsApp notification to the user
        try {
            const site = await db_1.db.getSite(body.siteId);
            if (site) {
                const hasCustomDomain = !!site.customDomain;
                const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
                const previewLink = `${BASE_URL}/site/${site.id}`;
                if (hasCustomDomain) {
                    // 1. Send immediate payment confirmation message mentioning 30 minutes activation time
                    const immediateText = `Your payment of subscription + domain is successful! ✅\n\nWe are now setting up your domain *${site.customDomain}*. It will be fully active within 30 minutes.\n\nIn the meantime, you can preview your website here: ${previewLink}`;
                    await (0, whatsapp_1.sendTextMessage)(site.phoneNumber, immediateText);
                    console.log('[Pay Confirm] Immediate payment success notification sent.');
                    // 2. Delay the CTA button message by 2 minutes until DNS setup has propagated
                    setTimeout(async () => {
                        try {
                            const liveLink = `http://${site.customDomain}`;
                            const notificationText = `🎉 *Congratulations!*\n\nYour custom domain *${site.customDomain}* is now live! Tap below to open your website:`;
                            await (0, whatsapp_1.sendCTAUrlMessage)(site.phoneNumber, notificationText, 'Open Website', liveLink);
                            console.log('[Pay Confirm Delayed] WhatsApp live custom domain notification sent.');
                        }
                        catch (err) {
                            console.error('[Pay Confirm Delayed] Failed to send delayed live notification:', err);
                        }
                    }, 120000); // 2 minutes delay
                }
                else {
                    // If no custom domain (free subdomain only), send CTA link instantly
                    const notificationText = `🎉 *Congratulations!*\n\nYour payment was successful and your website is now active! Tap below to visit your website:`;
                    await (0, whatsapp_1.sendCTAUrlMessage)(site.phoneNumber, notificationText, 'Open Website', previewLink);
                    console.log('[Pay Confirm] Immediate free subdomain activation notification sent.');
                }
            }
        }
        catch (msgErr) {
            console.error('[Pay Confirm] Failed to send payment confirmation WhatsApp messages:', msgErr);
        }
        const isCustomDomain = !!body.domain;
        const addonPrice = body.addon ? parseInt(body.addon) : 0;
        const isPointedDomain = isCustomDomain && addonPrice === 0;
        const customDomainUrl = isCustomDomain ? `http://${body.domain.replace(/^https?:\/\//i, '').trim()}` : '';
        const previewUrl = `/site/${body.siteId}`;
        return reply.type('text/html').send(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>body{font-family:'Inter',sans-serif}</style></head>
      <body class="bg-zinc-950 flex items-center justify-center min-h-screen px-4 py-8">
        <div class="text-center p-8 sm:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full">
          <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mx-auto mb-6 text-4xl">✓</div>
          <h1 class="text-2xl font-bold text-white mb-2">Payment Successful</h1>
          <p class="text-zinc-400 text-sm mb-6">Your website has been activated successfully.</p>
          
          ${isCustomDomain ? `
            <div class="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 mb-8 text-left">
              <span class="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                ${isPointedDomain ? 'Point Your Domain' : 'Your Live Domain'}
              </span>
              <a href="${customDomainUrl}" target="_blank" class="text-blue-400 font-bold text-base hover:underline break-all block mb-3">${body.domain} →</a>
              
              ${isPointedDomain ? `
                <div class="text-zinc-400 text-xs leading-relaxed space-y-2 mt-2">
                  <p class="font-semibold text-zinc-300">To complete connection, add this record in your domain registrar DNS settings:</p>
                  <div class="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1.5 font-mono text-[11px] text-zinc-300">
                    <div><span class="text-zinc-500">Type:</span> CNAME</div>
                    <div><span class="text-zinc-500">Name:</span> www</div>
                    <div><span class="text-zinc-500">Points to:</span> gray-arc-bot-production.up.railway.app</div>
                  </div>
                  <p class="text-[10px] text-zinc-500">Once added, changes may take up to 30 minutes to propagate.</p>
                </div>
              ` : `
                <p class="text-zinc-400 text-xs leading-relaxed">GoDaddy registration is complete. Global DNS propagation may take up to 2-3 minutes to reflect on all networks.</p>
              `}
            </div>
            
            <div class="flex flex-col gap-3">
              <a href="${customDomainUrl}" target="_blank" class="w-full bg-white text-zinc-900 font-bold py-3.5 px-6 rounded-xl hover:bg-zinc-100 transition shadow-lg text-sm text-center">
                ${isPointedDomain ? 'Open Website' : 'Open Live Domain'}
              </a>
              <a href="${previewUrl}" class="w-full bg-zinc-800 hover:bg-zinc-700/85 text-zinc-300 font-semibold py-3 px-6 rounded-xl transition text-sm text-center">
                View Temporary Preview Site
              </a>
            </div>
          ` : `
            <a href="${previewUrl}" class="inline-block bg-white text-zinc-900 font-semibold py-3.5 px-8 rounded-xl hover:bg-zinc-100 transition shadow-lg text-sm">
              View Website →
            </a>
          `}
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
function renderPremiumClassicTemplate(site) {
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
    
    @keyframes marquee-ltr {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0%); }
    }
    .animate-marquee-ltr {
      animation: marquee-ltr 22s linear infinite;
    }
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
        <a href="#contact" class="text-sm font-medium text-slate-600 hover:text-${theme.primary}-600 transition-colors">Contact</a>
        <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm ${theme.accentBg} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Chat Now</a>
      </div>

      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none" aria-label="Toggle Menu">
        <i class="fas fa-bars text-xl" id="menu-icon"></i>
      </button>
    </div>

    <!-- Mobile Navigation Dropdown Menu -->
    <div id="mobile-menu" class="hidden md:hidden absolute top-full left-0 right-0 border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300">
      <div class="px-6 py-4 flex flex-col space-y-4">
        <a href="#about" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">About</a>
        <a href="#features" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Why Choose Us</a>
        <a href="#services" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Services</a>
        <a href="#testimonials" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Reviews</a>
        <a href="#faq" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">FAQ</a>
        <a href="#contact" class="mobile-nav-link text-sm font-semibold text-slate-600 hover:text-${theme.primary}-600 transition-colors">Contact</a>
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
        <img src="${images.hero}" alt="${site.businessName} Hero Image" class="w-full h-full aspect-[4/5] object-cover rounded-2xl shadow-inner">
      </div>
    </div>
  </header>

  <!-- Moving Text Ticker Section -->
  <div class="w-full bg-[#18181b] text-zinc-100 py-3.5 overflow-hidden shadow-inner border-y border-[#27272a] relative z-10">
    <div class="flex whitespace-nowrap min-w-full">
      <div class="flex shrink-0 gap-8 px-4 justify-around min-w-full animate-marquee-ltr text-xs md:text-sm font-bold tracking-wider uppercase">
        <span>Premium Services</span>
        <span>•</span>
        <span>Direct WhatsApp Booking</span>
        <span>•</span>
        <span>Client Satisfaction Guaranteed</span>
        <span>•</span>
        <span>Professional Expert Care</span>
        <span>•</span>
        <span>Trusted Local Solutions</span>
      </div>
      <div class="flex shrink-0 gap-8 px-4 justify-around min-w-full animate-marquee-ltr text-xs md:text-sm font-bold tracking-wider uppercase">
        <span>Premium Services</span>
        <span>•</span>
        <span>Direct WhatsApp Booking</span>
        <span>•</span>
        <span>Client Satisfaction Guaranteed</span>
        <span>•</span>
        <span>Professional Expert Care</span>
        <span>•</span>
        <span>Trusted Local Solutions</span>
      </div>
    </div>
  </div>

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

  <!-- Why Choose Us -->
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

  <!-- Services -->
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

  <!-- Testimonials -->
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

  <!-- FAQ -->
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
        { question: 'Where are you located and do you offer delivery?', answer: 'Where are you located and do you offer delivery? We are based in local area, India, serving clients across the region. If you need precise directions, maps, or want to check if we service your specific area, feel free to send us a message on WhatsApp and we will share our location details.' }
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

  <!-- Contact Section -->
  <section id="contact" class="py-24 bg-slate-50 border-t border-slate-100">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 theme-font-title">Contact Us</h2>
        <p class="text-slate-600">Get in touch with us directly via phone, WhatsApp, or visit us at our location.</p>
        <div class="w-16 h-1 bg-${theme.primary}-500 mx-auto mt-6 rounded-full"></div>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Phone & WhatsApp Card -->
        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-${theme.primary}-50 text-${theme.primary}-600 flex items-center justify-center text-xl mb-6">
              <i class="fas fa-phone-alt"></i>
            </div>
            <h3 class="font-bold text-xl text-slate-900 mb-3">Call or Chat</h3>
            <p class="text-sm text-slate-600 leading-relaxed mb-4">Have any questions? Give us a call or send a message on WhatsApp.</p>
          </div>
          <div class="space-y-2">
            <a href="tel:${site.phoneNumber}" class="block text-base font-bold text-${theme.primary}-600 hover:underline">${site.contactDetails?.phone || site.phoneNumber}</a>
            <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline">
              <i class="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>

        <!-- Address Card -->
        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-${theme.primary}-50 text-${theme.primary}-600 flex items-center justify-center text-xl mb-6">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h3 class="font-bold text-xl text-slate-900 mb-3">Our Location</h3>
            <p class="text-sm text-slate-600 leading-relaxed mb-4">Visit us at our physical location. We'd love to welcome you.</p>
          </div>
          <p class="text-base font-bold text-slate-800">${site.contactDetails?.address || 'Local Business, India'}</p>
        </div>

        <!-- Business Hours Card -->
        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-${theme.primary}-50 text-${theme.primary}-600 flex items-center justify-center text-xl mb-6">
              <i class="fas fa-clock"></i>
            </div>
            <h3 class="font-bold text-xl text-slate-900 mb-3">Business Hours</h3>
            <p class="text-sm text-slate-600 leading-relaxed mb-4">We are open during the following hours to assist you.</p>
          </div>
          <p class="text-base font-bold text-slate-800">${site.contactDetails?.hours || 'Monday - Saturday: 10:00 AM - 8:00 PM'}</p>
        </div>
      </div>
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
    <a href="https://wa.me/${site.phoneNumber}" target="_blank" rel="noopener noreferrer" 
       class="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group relative">
      <i class="fab fa-whatsapp text-xl"></i>
    </a>
    <a href="tel:${site.phoneNumber}" 
       class="w-10 h-10 bg-[#00E676] hover:bg-[#00c853] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group relative">
      <i class="fas fa-phone text-base"></i>
    </a>
  </div>

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

      // Close menu when links are clicked
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
function renderAstroAgencyTemplate(site) {
    const theme = getCategoryTheme(site.category);
    const formatPrice = (price) => {
        if (price.toLowerCase().includes('contact'))
            return 'Contact Us';
        return price;
    };
    // On-the-fly copy text expansion to fix short content
    let subtitle = site.heroSubtitle || '';
    if (subtitle.length < 120) {
        subtitle = `${subtitle} Discover unparalleled excellence and client-focused solutions tailored to meet your unique needs. We combine years of specialized experience with a passion for quality to deliver results you can depend on, every single time.`;
    }
    let story = site.storyContent || site.aboutText || '';
    if (story.length < 150) {
        story = `${story} Our journey began with a simple yet powerful mission: to serve our community with honest, high-quality, and reliable solutions. Over the years, we have grown into a trusted industry leader by never compromising on our core values. We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Whether you are seeking a consultation, a premium product, or a custom service solution, our experienced specialists work tirelessly to ensure your expectations are not just met, but exceeded.`;
    }
    // Helper to split hero title and apply gradient theme highlights like original AgenceX
    const titleWords = (site.heroTitle || 'Social Media Marketing is the Best Ever').split(' ');
    let heroTitleHtml = '';
    if (titleWords.length > 3) {
        const firstPart = titleWords.slice(0, titleWords.length - 3).join(' ');
        const highlightedPart = titleWords.slice(titleWords.length - 3, titleWords.length - 1).join(' ');
        const lastPart = titleWords[titleWords.length - 1];
        heroTitleHtml = `${firstPart} <span class="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 from-20% via-[var(--color-primary)] via-30% to-green-600">${highlightedPart}</span> ${lastPart}`;
    }
    else if (titleWords.length > 1) {
        const firstPart = titleWords.slice(0, titleWords.length - 1).join(' ');
        const lastWord = titleWords[titleWords.length - 1];
        heroTitleHtml = `${firstPart} <span class="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 from-20% via-[var(--color-primary)] via-30% to-green-600">${lastWord}</span>`;
    }
    else {
        heroTitleHtml = `<span class="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 from-20% via-[var(--color-primary)] via-30% to-green-600">${titleWords[0]}</span>`;
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.businessName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: '${theme.primaryHex}',
            'box-bg': 'rgb(var(--color-box))',
            'box-border': 'rgb(var(--box-border))',
            'heading-1': 'rgb(var(--heading-1))',
            'heading-2': 'rgb(var(--heading-2))',
            'heading-3': 'rgb(var(--heading-3))',
          },
          screens: {
            midmd: '880px',
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --color-bg: 255 255 255;
      --color-box: 255 255 255;
      --box-border: 229 231 235;
      --box-sd: 226 232 240 / 0.5;
      --heading-1: 23 37 84;
      --heading-2: 31 41 55;
      --heading-3: 55 65 81;
      --color-primary: ${theme.primaryHex};
    }

    .dark {
      --color-bg: 3 7 18;
      --color-box: 17 24 39;
      --box-border: 243 244 246 / 0.1;
      --box-sd: transparent;
      --heading-1: 255 255 255;
      --heading-2: 243 244 246;
      --heading-3: 209 213 219;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background-color: rgb(var(--color-bg));
      color: rgb(var(--heading-3));
      font-family: 'Raleway', sans-serif;
    }
  </style>
</head>
<body class="overflow-x-hidden antialiased transition-colors duration-300">

  <!-- Header / Navigation -->
  <header class="absolute inset-x-0 top-0 z-50 py-6">
    <div class="max-w-6xl mx-auto px-6">
      <nav class="w-full flex justify-between gap-6 relative items-center">
        <!-- Logo -->
        <div class="min-w-max inline-flex relative">
          <a href="#" class="relative flex items-center gap-3">
            <div class="relative w-7 h-7 overflow-hidden flex rounded-xl">
              <span class="absolute w-4 h-4 -top-1 -right-1 bg-green-500 rounded-md rotate-45"></span>
              <span class="absolute w-4 h-4 -bottom-1 -right-1 bg-[#FCDC58] rounded-md rotate-45"></span>
              <span class="absolute w-4 h-4 -bottom-1 -left-1 bg-[var(--color-primary)] rounded-md rotate-45"></span>
              <span class="absolute w-2 h-2 rounded-full bg-[rgb(var(--heading-1))] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
            </div>
            <div class="inline-flex text-lg font-semibold text-[rgb(var(--heading-1))]">
              ${site.businessName}
            </div>
          </a>
        </div>

        <!-- Desktop Navigation Items -->
        <div class="hidden lg:flex items-center gap-x-8">
          <ul class="flex gap-x-6 text-sm font-medium text-[rgb(var(--heading-3))]">
            <li><a href="#about-us" class="hover:text-[var(--color-primary)] transition-colors">About Us</a></li>
            <li><a href="#features" class="hover:text-[var(--color-primary)] transition-colors">Features</a></li>
            <li><a href="#services" class="hover:text-[var(--color-primary)] transition-colors">Services</a></li>
            <li><a href="#contact" class="hover:text-[var(--color-primary)] transition-colors">Contact</a></li>
          </ul>
        </div>

        <!-- Right Buttons (Theme toggle + CTA) -->
        <div class="flex items-center gap-x-3">
          <!-- Light/Dark Mode Switcher -->
          <button id="theme-switch" class="outline-none flex relative text-[rgb(var(--heading-2))] rounded-full p-2 border border-[rgb(var(--box-border))] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <i class="fas fa-moon text-lg dark:hidden"></i>
            <i class="fas fa-sun text-lg hidden dark:block"></i>
          </button>
          
          <a href="https://wa.me/${site.phoneNumber}" class="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full bg-[var(--color-primary)] text-white hover:opacity-95 transition-all">
            Get Started
          </a>

          <!-- Mobile Toggle menu button -->
          <button id="mobile-toggle" class="lg:hidden p-2 rounded-lg text-[rgb(var(--heading-3))] focus:outline-none">
            <i class="fas fa-bars text-xl" id="mobile-icon"></i>
          </button>
        </div>

        <!-- Mobile Navigation Panel -->
        <div id="mobile-nav" class="hidden absolute top-full left-0 right-0 mt-3 p-6 rounded-3xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-xl flex flex-col space-y-4 z-50 animate-fade-in">
          <a href="#about-us" class="mobile-nav-link text-sm font-semibold text-[rgb(var(--heading-3))] hover:text-[var(--color-primary)]">About Us</a>
          <a href="#features" class="mobile-nav-link text-sm font-semibold text-[rgb(var(--heading-3))] hover:text-[var(--color-primary)]">Features</a>
          <a href="#services" class="mobile-nav-link text-sm font-semibold text-[rgb(var(--heading-3))] hover:text-[var(--color-primary)]">Services</a>
          <a href="#contact" class="mobile-nav-link text-sm font-semibold text-[rgb(var(--heading-3))] hover:text-[var(--color-primary)]">Contact</a>
          <a href="https://wa.me/${site.phoneNumber}" class="mobile-nav-link inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold rounded-xl bg-[var(--color-primary)] text-white">Get Started</a>
        </div>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-32 lg:pt-36 pb-20">
    <div class="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
      <!-- Glow Shapes -->
      <div class="absolute w-full lg:w-1/2 inset-y-0 lg:right-0 pointer-events-none">
        <span class="absolute -left-6 md:left-4 top-24 lg:top-28 w-24 h-24 rotate-90 skew-x-12 rounded-3xl bg-green-400 blur-xl opacity-40 lg:opacity-75 lg:block hidden"></span>
        <span class="absolute right-4 bottom-12 w-24 h-24 rounded-3xl bg-[var(--color-primary)] blur-xl opacity-60"></span>
      </div>
      <span class="w-4/12 lg:w-2/12 aspect-square bg-gradient-to-tr from-[var(--color-primary)] to-green-400 absolute -top-5 lg:left-0 rounded-full skew-y-12 blur-2xl opacity-20 pointer-events-none"></span>

      <!-- Content -->
      <div class="relative flex flex-col items-center text-center lg:text-left lg:items-start lg:max-w-none max-w-3xl mx-auto lg:mx-0 lg:flex-1 lg:w-1/2">
        <h1 class="text-3xl/tight sm:text-4xl/tight md:text-5xl/tight xl:text-6xl/tight font-bold text-[rgb(var(--heading-1))] leading-tight">
          ${heroTitleHtml}
        </h1>
        <p class="mt-8 text-base text-[rgb(var(--heading-3))] leading-relaxed max-w-xl">
          ${subtitle}
        </p>

        <!-- Dynamic Action Form -->
        <div class="mt-10 w-full flex max-w-md mx-auto lg:mx-0">
          <form action="https://wa.me/${site.phoneNumber}" class="py-1.5 pl-6 w-full pr-1.5 flex gap-3 items-center shadow-lg border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] rounded-full focus-within:border-[var(--color-primary)] transition-all">
            <span class="min-w-max pr-2 border-r border-[rgb(var(--box-border))] text-[rgb(var(--heading-3))]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
              </svg>
            </span>
            <input type="text" placeholder="Interested? Send a message..." readonly class="w-full py-3 outline-none bg-transparent text-sm cursor-pointer text-[rgb(var(--heading-2))] font-medium">
            <button class="min-w-max text-white bg-[var(--color-primary)] hover:opacity-90 px-6 py-3 rounded-full font-semibold transition-all">
              Get Started
            </button>
          </form>
        </div>
      </div>

      <!-- Image -->
      <div class="flex flex-1 lg:w-1/2 lg:h-auto relative lg:max-w-none lg:mx-0 mx-auto max-w-3xl w-full">
        <img src="/public/images/image1.webp" alt="Hero banner image" class="w-full aspect-[4/3] lg:aspect-square rounded-3xl object-cover shadow-xl border border-[rgb(var(--box-border))]">
      </div>
    </div>
  </section>

  <!-- Number/Stats Section -->
  <section class="relative pb-24">
    <div class="max-w-6xl mx-auto px-6">
      <div class="mx-auto lg:mx-0 p-6 sm:p-8 rounded-3xl bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] shadow-lg md:divide-x divide-[rgb(var(--box-border))] grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <h2 class="font-bold text-2xl sm:text-3xl md:text-4xl text-[rgb(var(--heading-1))]">12+</h2>
          <p class="mt-2 text-xs md:text-sm text-[rgb(var(--heading-3))] font-medium">Created projects</p>
        </div>
        <div class="text-center">
          <h2 class="font-bold text-2xl sm:text-3xl md:text-4xl text-[rgb(var(--heading-1))]">200+</h2>
          <p class="mt-2 text-xs md:text-sm text-[rgb(var(--heading-3))] font-medium">Projects</p>
        </div>
        <div class="text-center">
          <h2 class="font-bold text-2xl sm:text-3xl md:text-4xl text-[rgb(var(--heading-1))]">120</h2>
          <p class="mt-2 text-xs md:text-sm text-[rgb(var(--heading-3))] font-medium">Happy Client</p>
        </div>
        <div class="text-center">
          <h2 class="font-bold text-2xl sm:text-3xl md:text-4xl text-[rgb(var(--heading-1))]">5+</h2>
          <p class="mt-2 text-xs md:text-sm text-[rgb(var(--heading-3))] font-medium">Years</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Trusted By Section -->
  <section class="pb-20">
    <div class="mx-auto max-w-7xl w-full px-5 sm:px-8 md:px-14 lg:px-5 space-y-8">
      <div class="text-center max-w-3xl mx-auto">
        <h2 class="text-[rgb(var(--heading-1))] font-semibold text-2xl sm:text-3xl md:text-4xl">
          Trusted by companies like
        </h2>
      </div>
      <div class="flex justify-center flex-wrap gap-4">
        <div class="p-4 sm:p-5 rounded-xl bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] group">
          <img src="/public/logos/spotify.png" width="100" height="60" alt="spotify" class="h-7 sm:h-10 w-auto ease-linear duration-300 grayscale group-hover:!grayscale-0 group-hover:scale-105">
        </div>
        <div class="p-4 sm:p-5 rounded-xl bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] group">
          <img src="/public/logos/slack.png" width="100" height="60" alt="slack" class="h-7 sm:h-10 w-auto ease-linear duration-300 grayscale group-hover:!grayscale-0 group-hover:scale-105">
        </div>
        <div class="p-4 sm:p-5 rounded-xl bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] group">
          <img src="/public/logos/paypallogo.png" width="100" height="60" alt="paypal" class="h-7 sm:h-10 w-auto ease-linear duration-300 grayscale group-hover:!grayscale-0 group-hover:scale-105">
        </div>
        <div class="p-4 sm:p-5 rounded-xl bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] group">
          <img src="/public/logos/spotify.png" width="100" height="60" alt="spotify" class="h-7 sm:h-10 w-auto ease-linear duration-300 grayscale group-hover:!grayscale-0 group-hover:scale-105">
        </div>
        <div class="p-4 sm:p-5 rounded-xl bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] group">
          <img src="/public/logos/slack.png" width="100" height="60" alt="slack" class="h-7 sm:h-10 w-auto ease-linear duration-300 grayscale group-hover:!grayscale-0 group-hover:scale-105">
        </div>
      </div>
    </div>
  </section>

  <!-- Services / Products Section -->
  <section id="services" class="py-24 relative">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 class="text-3xl md:text-4xl font-bold text-[rgb(var(--heading-1))]">What we offer</h2>
        <p class="text-[rgb(var(--heading-3))] text-base max-w-lg mx-auto">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        ${site.services.map((item, i) => {
        let desc = item.description || '';
        if (desc.length < 80) {
            desc = `${desc} We take pride in providing this professional service built on years of expertise. We focus on delivering top-tier details, client consultation, and custom adjustments to fit your exact goals.`;
        }
        return `<a href="https://wa.me/${site.phoneNumber}?text=${encodeURIComponent('Hi! I am interested in ' + item.name)}" 
             class="p-5 sm:p-6 lg:p-8 rounded-3xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-lg shadow-box-shadow relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:shadow-xl transition-all duration-300 group">
            <div>
              <div class="rounded-xl bg-gray-300 dark:bg-gray-950 p-3 text-[rgb(var(--heading-1))] w-max relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <div class="mt-6 space-y-4 relative">
                <h3 class="text-lg md:text-xl font-semibold text-[rgb(var(--heading-2))] group-hover:text-[var(--color-primary)] transition-colors">
                  ${item.name}
                </h3>
                <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed">
                  ${desc}
                </p>
              </div>
            </div>
            <span class="absolute w-32 aspect-square -bottom-16 -right-16 bg-[var(--color-primary)]/10 rounded-full"></span>
          </a>`;
    }).join('')}
      </div>
    </div>
  </section>

  <!-- About Us Section -->
  <section id="about-us" class="py-24 border-y border-[rgb(var(--box-border))]">
    <div class="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
      <!-- Left image -->
      <div class="flex-1 flex w-full lg:w-1/2">
        <div class="w-full relative">
          <div class="absolute rotate-45 -left-5 md:-left-10 lg:-left-20 xl:-left-24 p-1 top-1/2 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-orange-400 blur-3xl opacity-35 pointer-events-none"></div>
          <div class="absolute p-1 -top-4 md:-top-10 right-0 w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-orange-400 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <span class="absolute w-full aspect-[16/5] -skew-x-12 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-green-400 opacity-20 blur-2xl left-0 bottom-0 pointer-events-none"></span>
          <img src="/public/images/dev-with-c-1.webp" alt="About story banner image" class="w-full aspect-[4/3] rounded-3xl object-cover shadow-xl border border-[rgb(var(--box-border))] relative z-10">
        </div>
      </div>

      <!-- Right text -->
      <div class="flex-grow lg:w-1/2 flex flex-col items-start text-left">
        <h2 class="text-3xl md:text-4xl font-bold text-[rgb(var(--heading-1))] leading-tight">
          ${site.storyTitle || 'We help drive your business forward faster'}
        </h2>
        <p class="mt-8 text-base text-[rgb(var(--heading-3))] leading-relaxed">
          ${story}
        </p>

        <!-- Mission / Vision Cards -->
        <div class="pt-8 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="p-5 rounded-2xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-sm text-left">
            <div class="rounded-xl bg-gray-300 dark:bg-gray-950 p-3 text-[rgb(var(--heading-1))] w-max relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h4 class="font-semibold text-lg text-[rgb(var(--heading-2))] mt-6 mb-4">Mission</h4>
            <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed">To deliver top-tier ${site.category.toLowerCase()} services that enhance our customers' lives and businesses with reliability, excellence, and care.</p>
          </div>

          <div class="p-5 rounded-2xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-sm text-left">
            <div class="rounded-xl bg-gray-300 dark:bg-gray-950 p-3 text-[rgb(var(--heading-1))] w-max relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 class="font-semibold text-lg text-[rgb(var(--heading-2))] mt-6 mb-4">Vision</h4>
            <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed">To be the leading provider of ${site.category.toLowerCase()} solutions, recognized for our commitment to excellence, innovation, and client satisfaction.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-24 border-b border-[rgb(var(--box-border))]">
    <div class="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-center">
      <!-- Left content -->
      <div class="flex-grow lg:w-1/2 flex flex-col items-start text-left">
        <h2 class="text-3xl md:text-4xl font-bold text-[rgb(var(--heading-1))] leading-tight">Why Choose Us</h2>
        <p class="mt-6 text-base text-[rgb(var(--heading-3))] leading-relaxed">We are committed to delivering excellence and building long-term relationships based on outstanding results.</p>
        
        <ul class="mt-8 space-y-6 font-medium text-[rgb(var(--heading-3))] w-full">
          ${(site.features || [
        { title: 'Premium Quality Assurance', description: 'We source only the finest materials, leverage advanced techniques, and enforce rigorous quality checks to ensure that every single deliverable meets the absolute highest industry standards.' },
        { title: 'Experienced Specialists', description: 'Our professionals bring years of expertise and dedication to every client request. Our crew consists of highly trained, certified, and passionate professionals.' },
        { title: 'Client Centric Partnership', description: 'Your satisfaction is our primary goal. We tailor our services to match your vision, taking the time to understand your exact requirements.' }
    ]).map((feat) => `
            <li class="flex items-start gap-4">
              <span class="font-bold bg-[rgb(var(--color-box))] border border-[rgb(var(--box-border))] rounded-full w-8 h-8 text-[var(--color-primary)] inline-flex justify-center items-center shrink-0 shadow-sm">&checkmark;</span>
              <div>
                <h4 class="font-semibold text-base text-[rgb(var(--heading-2))]">${feat.title}</h4>
                <p class="text-sm text-[rgb(var(--heading-3))] mt-1">${feat.description}</p>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Right image -->
      <div class="flex-1 flex w-full lg:w-1/2 relative">
        <div class="absolute rotate-45 -left-5 md:-left-10 lg:-left-20 xl:-left-24 p-1 top-1/2 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-orange-400 blur-3xl opacity-35 pointer-events-none"></div>
        <div class="absolute p-1 -top-4 md:-top-10 right-0 w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-orange-400 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <span class="absolute w-full aspect-[16/5] -skew-x-12 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-green-400 opacity-20 blur-2xl left-0 bottom-0 pointer-events-none"></span>
        <img src="/public/images/dev-with-c.webp" alt="Feature showcase banner image" class="w-full aspect-[4/3] rounded-3xl object-cover shadow-xl border border-[rgb(var(--box-border))] relative z-10">
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="py-24 border-b border-[rgb(var(--box-border))]">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 class="text-3xl md:text-4xl font-bold text-[rgb(var(--heading-1))]">Contact Us</h2>
        <p class="text-[rgb(var(--heading-3))] text-base max-w-lg mx-auto">Get in touch with us directly via phone, WhatsApp, or visit our location.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
        <!-- Phone & WhatsApp Card -->
        <div class="p-8 rounded-3xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-all duration-300">
          <div>
            <div class="rounded-xl bg-gray-300 dark:bg-gray-950 p-3 text-[rgb(var(--heading-1))] w-max">
              <i class="fas fa-phone-alt text-lg"></i>
            </div>
            <h3 class="text-lg md:text-xl font-semibold text-[rgb(var(--heading-2))] mt-6 mb-4">Phone & Chat</h3>
            <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed mb-6">Have any questions? Give us a call or send a message on WhatsApp.</p>
          </div>
          <div class="space-y-3">
            <a href="tel:${site.phoneNumber}" class="block text-base font-bold text-[var(--color-primary)] hover:underline">${site.contactDetails?.phone || site.phoneNumber}</a>
            <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center gap-2 text-sm font-semibold text-green-500 hover:underline">
              <i class="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>

        <!-- Address Card -->
        <div class="p-8 rounded-3xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-all duration-300">
          <div>
            <div class="rounded-xl bg-gray-300 dark:bg-gray-950 p-3 text-[rgb(var(--heading-1))] w-max">
              <i class="fas fa-map-marker-alt text-lg"></i>
            </div>
            <h3 class="text-lg md:text-xl font-semibold text-[rgb(var(--heading-2))] mt-6 mb-4">Our Location</h3>
            <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed mb-6">Visit us at our physical location. We'd love to welcome you.</p>
          </div>
          <p class="text-base font-bold text-[rgb(var(--heading-2))]">${site.contactDetails?.address || 'Local Business, India'}</p>
        </div>

        <!-- Business Hours Card -->
        <div class="p-8 rounded-3xl border border-[rgb(var(--box-border))] bg-[rgb(var(--color-box))] shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-all duration-300">
          <div>
            <div class="rounded-xl bg-gray-300 dark:bg-gray-950 p-3 text-[rgb(var(--heading-1))] w-max">
              <i class="fas fa-clock text-lg"></i>
            </div>
            <h3 class="text-lg md:text-xl font-semibold text-[rgb(var(--heading-2))] mt-6 mb-4">Business Hours</h3>
            <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed mb-6">We are open during the following hours to assist you.</p>
          </div>
          <p class="text-base font-bold text-[rgb(var(--heading-2))]">${site.contactDetails?.hours || 'Monday - Saturday: 10:00 AM - 8:00 PM'}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section id="cta" class="pb-24">
    <div class="max-w-6xl mx-auto px-6">
      <div class="w-full relative py-12 md:py-16 px-6 md:px-12 rounded-3xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-transparent border border-[rgb(var(--box-border))] shadow-inner overflow-hidden">
        <!-- Glows -->
        <div class="absolute right-0 top-0 h-full w-full flex justify-end pointer-events-none">
          <div class="w-28 h-28 overflow-hidden flex rounded-xl relative blur-2xl">
            <span class="absolute w-16 h-16 -top-1 -right-1 bg-green-500 rounded-md rotate-45"></span>
            <span class="absolute w-16 h-16 -bottom-1 -right-1 bg-[#FCDC58] rounded-md rotate-45"></span>
            <span class="absolute w-16 h-16 -bottom-1 -left-1 bg-[var(--color-primary)] rounded-md rotate-45"></span>
          </div>
        </div>
        <div class="absolute left-0 bottom-0 h-full w-full flex items-end pointer-events-none">
          <div class="w-28 h-28 overflow-hidden flex rounded-xl relative blur-2xl">
            <span class="absolute w-16 h-16 -top-1 -right-1 bg-green-500 rounded-md rotate-45"></span>
            <span class="absolute w-16 h-16 -bottom-1 -right-1 bg-[#FCDC58] rounded-md rotate-45"></span>
            <span class="absolute w-16 h-16 -bottom-1 -left-1 bg-[var(--color-primary)] rounded-md rotate-45"></span>
          </div>
        </div>

        <div class="mx-auto text-center max-w-xl md:max-w-2xl relative z-10 flex flex-col items-center">
          <h2 class="text-3xl/tight sm:text-4xl/tight md:text-5xl/tight font-bold text-[rgb(var(--heading-1))] leading-tight">
            Connect with <span class="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 from-20% via-[var(--color-primary)] via-30% to-green-600">${site.businessName}</span> Today
          </h2>
          <p class="pt-6 text-sm text-[rgb(var(--heading-3))] leading-relaxed max-w-lg">
            Ready to scale up? Message us on WhatsApp right now to let us know your requirements. Our specialists are online to guide you.
          </p>
          <div class="pt-8">
            <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-all shadow-md">
              Get In Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="relative bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-transparent pt-20 rounded-t-3xl border-t border-[rgb(var(--box-border))]">
    <div class="max-w-6xl mx-auto px-6 pb-8 relative overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 text-left">
        <div class="flex flex-col gap-4">
          <a href="#" class="relative flex items-center gap-3">
            <div class="relative w-7 h-7 overflow-hidden flex rounded-xl">
              <span class="absolute w-4 h-4 -top-1 -right-1 bg-green-500 rounded-md rotate-45"></span>
              <span class="absolute w-4 h-4 -bottom-1 -right-1 bg-[#FCDC58] rounded-md rotate-45"></span>
              <span class="absolute w-4 h-4 -bottom-1 -left-1 bg-[var(--color-primary)] rounded-md rotate-45"></span>
              <span class="absolute w-2 h-2 rounded-full bg-[rgb(var(--heading-1))] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
            </div>
            <div class="inline-flex text-lg font-semibold text-[rgb(var(--heading-1))]">
              ${site.businessName}
            </div>
          </a>
          <p class="text-sm text-[rgb(var(--heading-3))] leading-relaxed mt-4">
            Your trusted partner for premium ${site.category.toLowerCase()} services.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-bold text-[rgb(var(--heading-1))] text-base mb-2">Company</h4>
          <ul class="text-sm text-[rgb(var(--heading-3))] space-y-2 font-medium">
            <li><a href="#about-us" class="hover:text-[var(--color-primary)]">About Us</a></li>
            <li><a href="#" class="hover:text-[var(--color-primary)]">Blog</a></li>
            <li><a href="#" class="hover:text-[var(--color-primary)]">Jobs</a></li>
          </ul>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-bold text-[rgb(var(--heading-1))] text-base mb-2">Resources</h4>
          <ul class="text-sm text-[rgb(var(--heading-3))] space-y-2 font-medium">
            <li><a href="#" class="hover:text-[var(--color-primary)]">FAQs Support</a></li>
            <li><a href="#testimonials" class="hover:text-[var(--color-primary)]">Guides</a></li>
            <li><a href="#contact" class="hover:text-[var(--color-primary)] font-semibold text-[var(--color-primary)]">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div class="w-full h-px bg-[rgb(var(--box-border))] my-8"></div>
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs md:text-sm text-[rgb(var(--heading-3))] font-medium">
        <div>
          &copy; 2026 ${site.businessName}. All rights reserved.
        </div>
        <div>
          Powered by The Gray Arc.
        </div>
      </div>
    </div>
  </footer>

  <!-- Floating Sticky Contact Buttons -->
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <!-- WhatsApp Sticky Button -->
    <a href="https://wa.me/${site.phoneNumber}" target="_blank" rel="noopener noreferrer" 
       class="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group relative">
      <i class="fab fa-whatsapp text-xl"></i>
    </a>
    <!-- Call Sticky Button -->
    <a href="tel:${site.phoneNumber}" 
       class="w-10 h-10 bg-[#00E676] hover:bg-[#00c853] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 group relative">
      <i class="fas fa-phone text-base"></i>
    </a>
  </div>

  <!-- Mobile Toggle Script & Light/Dark Theme Switcher Script -->
  <script>
    // 1. Mobile Menu Nav Toggle
    const mobileBtn = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileIcon = document.getElementById('mobile-icon');
    
    if (mobileBtn && mobileNav && mobileIcon) {
      mobileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = mobileNav.classList.contains('hidden');
        if (isHidden) {
          mobileNav.classList.remove('hidden');
          mobileIcon.classList.remove('fa-bars');
          mobileIcon.classList.add('fa-xmark');
        } else {
          mobileNav.classList.add('hidden');
          mobileIcon.classList.remove('fa-xmark');
          mobileIcon.classList.add('fa-bars');
        }
      });

      // Close menu when links are clicked
      const links = mobileNav.querySelectorAll('.mobile-nav-link');
      links.forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.add('hidden');
          mobileIcon.classList.remove('fa-xmark');
          mobileIcon.classList.add('fa-bars');
        });
      });
    }

    // 2. Light / Dark Mode Toggle
    const themeBtn = document.getElementById('theme-switch');
    // Set initial theme from localStorage
    if (localStorage.getItem('appTheme') === 'dark' || (!('appTheme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const doc = document.documentElement;
        if (doc.classList.contains('dark')) {
          doc.classList.remove('dark');
          localStorage.setItem('appTheme', 'light');
        } else {
          doc.classList.add('dark');
          localStorage.setItem('appTheme', 'dark');
        }
      });
    }
  </script>

</body>
</html>`;
}
function renderPremiumWebsite(site, templateName) {
    if (templateName === 'astroship') {
        return renderAstroshipTemplate(site);
    }
    if (templateName === 'story') {
        return renderStoryTemplate(site);
    }
    return renderNaturePortfolioTemplate(site);
}
function getSemanticServiceImage(serviceName, category, index) {
    const name = (serviceName || '').toLowerCase();
    const cat = (category || '').toLowerCase();
    // Bakery / Food
    if (cat.includes('bakery') || cat.includes('cake') || cat.includes('sweet') || cat.includes('pastry') || cat.includes('cupcake') || cat.includes('dessert') || cat.includes('food') || cat.includes('bread') || cat.includes('cafe') || cat.includes('baking') || cat.includes('baker')) {
        if (name.includes('cupcake') || name.includes('muffin')) {
            const options = [
                'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1486427944544-d2c246c4df14?w=600&q=80&auto=format&fit=crop'
            ];
            return options[index % options.length];
        }
        if (name.includes('cake') || name.includes('fondant') || name.includes('pastry') || name.includes('dessert')) {
            const options = [
                'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&q=80&auto=format&fit=crop'
            ];
            return options[index % options.length];
        }
        if (name.includes('bread') || name.includes('loaf') || name.includes('bun') || name.includes('croissant') || name.includes('bake')) {
            const options = [
                'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80&auto=format&fit=crop'
            ];
            return options[index % options.length];
        }
        if (name.includes('cookie') || name.includes('biscuit') || name.includes('macaron')) {
            const options = [
                'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&q=80&auto=format&fit=crop'
            ];
            return options[index % options.length];
        }
        // Fallback bakery images
        const bakeryDefaults = [
            'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1556217477-d325251ece38?w=800&q=80&auto=format&fit=crop'
        ];
        return bakeryDefaults[index % bakeryDefaults.length];
    }
    // Salon / Beauty
    if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa') || cat.includes('makeup') || cat.includes('hair') || cat.includes('nail')) {
        if (name.includes('hair') || name.includes('cut') || name.includes('color') || name.includes('style') || name.includes('shave') || name.includes('barber')) {
            return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80&auto=format&fit=crop';
        }
        if (name.includes('nail') || name.includes('mani') || name.includes('pedi')) {
            return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&auto=format&fit=crop';
        }
        if (name.includes('massage') || name.includes('spa') || name.includes('facial') || name.includes('skin')) {
            return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80&auto=format&fit=crop';
        }
        if (name.includes('makeup') || name.includes('bridal') || name.includes('cosmetic')) {
            return 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=600&q=80&auto=format&fit=crop';
        }
        const salonDefaults = [
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&auto=format&fit=crop'
        ];
        return salonDefaults[index % salonDefaults.length];
    }
    // Gym / Fitness
    if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('yoga') || cat.includes('train')) {
        if (name.includes('yoga') || name.includes('stretch') || name.includes('pilates') || name.includes('meditation')) {
            return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format&fit=crop';
        }
        if (name.includes('cardio') || name.includes('run') || name.includes('treadmill') || name.includes('cycling') || name.includes('spin')) {
            return 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80&auto=format&fit=crop';
        }
        if (name.includes('weight') || name.includes('lift') || name.includes('strength') || name.includes('crossfit') || name.includes('gym')) {
            return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&auto=format&fit=crop';
        }
        const fitnessDefaults = [
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80&auto=format&fit=crop'
        ];
        return fitnessDefaults[index % fitnessDefaults.length];
    }
    // Clinic / Health
    if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental') || cat.includes('health') || cat.includes('medical') || cat.includes('physio')) {
        if (name.includes('teeth') || name.includes('dental') || name.includes('dentist') || name.includes('ortho') || name.includes('root')) {
            return 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80&auto=format&fit=crop';
        }
        const clinicDefaults = [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80&auto=format&fit=crop'
        ];
        return clinicDefaults[index % clinicDefaults.length];
    }
    // Default Fallback
    const defaultCategoryImages = getCategoryImages(category);
    if (defaultCategoryImages && defaultCategoryImages.products && defaultCategoryImages.products.length > 0) {
        return defaultCategoryImages.products[index % defaultCategoryImages.products.length];
    }
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&auto=format&fit=crop';
}
function renderNaturePortfolioTemplate(site) {
    const images = getCategoryImages(site.category || '');
    let subtitle = site.heroSubtitle || '';
    if (subtitle.length < 50) {
        subtitle = `${subtitle} Delivering excellence and quality in everything we do.`;
    }
    let story = site.storyContent || site.aboutText || '';
    if (story.length < 100) {
        story = `${story} We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Our team works tirelessly to ensure your expectations are not just met, but exceeded.`;
    }
    const currentYear = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site.businessName} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        [x-cloak] { display: none !important; }
        body { font-family: 'Nunito', sans-serif; background-color: #fbfcf7; color: #2d431f; overflow-x: hidden; }
        .text-brand-dark { color: #355322; }
        .text-brand-primary { color: #4b7833; }
        .text-brand-light { color: #6a8c4f; }
        .bg-brand-primary { background-color: #4b7833; }
        .bg-brand-primary:hover { background-color: #3b6028; }
        .bg-brand-secondary { background-color: #9dbf83; }
        .bg-brand-light { background-color: #f0f5e9; }
        .pill-shadow { box-shadow: 0 10px 40px -10px rgba(75, 120, 51, 0.2); }
        .card-shadow { box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-shadow:hover { box-shadow: 0 30px 50px -15px rgba(75, 120, 51, 0.15); transform: translateY(-12px); }
        .fab-hover:hover { transform: scale(1.1) translateY(-5px); }
        .scroll-reveal { opacity: 0; transform: translateY(50px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px) rotate(-6deg); } 50% { transform: translateY(-20px) rotate(2deg); } }
        @keyframes float-fast { 0%, 100% { transform: translateY(0px) rotate(12deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
        .animate-float-1 { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-fast 4s ease-in-out infinite; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
    </style>
</head>
<body class="antialiased relative" x-data="{ mobileMenuOpen: false }">

    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 items-end">
        <a href="https://wa.me/${site.phoneNumber}" target="_blank" class="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 fab-hover transition-all duration-300 z-50 border-2 border-white">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="tel:${site.contactDetails?.phone || site.phoneNumber}" class="w-14 h-14 bg-[#4b7833] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#4b7833]/40 fab-hover transition-all duration-300 z-50 border-2 border-white">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        </a>
    </div>

    <div class="relative px-4 sm:px-6 pt-4 pb-24 max-w-[1600px] mx-auto">
        <nav class="absolute top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-[#fbfcf7]/95 backdrop-blur-md rounded-full px-6 py-4 flex justify-between items-center z-50 shadow-sm border border-white/50">
            <div class="text-xl sm:text-2xl font-extrabold text-[#4b7833] tracking-tight hover:scale-105 transition-transform cursor-pointer truncate max-w-[160px] sm:max-w-none">${site.businessName}</div>
            <div class="hidden lg:flex items-center space-x-10 text-[15px] font-bold text-[#455736]">
                <a href="#about" class="hover:text-[#4b7833] hover:-translate-y-1 transition-transform inline-block">About</a>
                <a href="#services" class="hover:text-[#4b7833] hover:-translate-y-1 transition-transform inline-block">Services</a>
                <a href="#process" class="hover:text-[#4b7833] hover:-translate-y-1 transition-transform inline-block">Process</a>
                <a href="#work" class="hover:text-[#4b7833] hover:-translate-y-1 transition-transform inline-block">Work</a>
                <a href="#contact" class="hover:text-[#4b7833] hover:-translate-y-1 transition-transform inline-block">Contact</a>
            </div>
            <div class="flex items-center gap-4">
                <a href="#contact" class="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-primary text-white text-sm font-bold transition hover:-translate-y-1 shadow-lg shadow-[#4b7833]/30">Hire Me Today</a>
                <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden text-[#455736] p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        </nav>

        <div x-show="mobileMenuOpen" x-cloak class="lg:hidden fixed inset-x-4 top-24 bg-white rounded-3xl shadow-2xl z-[100] overflow-hidden border border-gray-100" @click.outside="mobileMenuOpen = false">
            <div class="flex flex-col p-6 space-y-4">
                <a href="#about" @click="mobileMenuOpen = false" class="text-lg font-bold text-[#455736] hover:text-[#4b7833]">About</a>
                <a href="#services" @click="mobileMenuOpen = false" class="text-lg font-bold text-[#455736] hover:text-[#4b7833]">Services</a>
                <a href="#process" @click="mobileMenuOpen = false" class="text-lg font-bold text-[#455736] hover:text-[#4b7833]">Process</a>
                <a href="#work" @click="mobileMenuOpen = false" class="text-lg font-bold text-[#455736] hover:text-[#4b7833]">Work</a>
                <a href="#contact" @click="mobileMenuOpen = false" class="text-lg font-bold text-[#455736] hover:text-[#4b7833]">Contact</a>
            </div>
        </div>

        <div class="relative w-full h-[600px] sm:h-[800px] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden group">
            <img src="${images.hero || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000'}" alt="Workspace" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent"></div>
            <div class="relative z-20 h-full flex flex-col justify-center px-6 sm:px-16 md:px-24 max-w-4xl pt-20">
                <div class="scroll-reveal inline-flex items-center gap-2 bg-brand-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-bold w-max mb-6 backdrop-blur-sm shadow-[0_0_20px_rgba(75,120,51,0.5)]">
                    <svg class="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    ${site.category || 'Professional Services'}
                </div>
                <h1 class="scroll-reveal delay-100 text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1]">
                    ${site.heroTitle || site.businessName}
                </h1>
                <p class="scroll-reveal delay-200 text-white/90 text-base sm:text-lg md:text-xl font-medium max-w-2xl mb-10 leading-relaxed">
                    ${subtitle}
                </p>
                <div class="scroll-reveal delay-300 flex flex-wrap gap-4">
                    <a href="#work" class="bg-brand-primary text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#3b6028] hover:-translate-y-1 transition-all border-2 border-transparent shadow-[0_10px_30px_rgba(75,120,51,0.4)]">Explore My Work</a>
                    <a href="#about" class="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/20 hover:-translate-y-1 transition-all border-2 border-white/20">Read My Story</a>
                </div>
            </div>
        </div>

        <div class="absolute -bottom-16 sm:-bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-brand-secondary p-2 sm:p-4 rounded-[2rem] sm:rounded-full pill-shadow z-30 transform hover:-translate-y-2 transition-transform duration-500">
            <div class="bg-white rounded-[1.8rem] sm:rounded-full grid grid-cols-2 md:grid-cols-4 p-4 text-center gap-y-4 md:gap-y-0">
                <div class="px-2 py-2 border-r border-b border-gray-100 md:border-b-0 hover:scale-105 transition-transform">
                    <div class="text-2xl sm:text-3xl font-extrabold text-brand-dark">10+</div>
                    <div class="text-xs sm:text-sm font-bold text-[#6a8c4f] uppercase tracking-wider mt-1">Years Exp</div>
                </div>
                <div class="px-2 py-2 border-b md:border-b-0 md:border-r border-gray-100 hover:scale-105 transition-transform">
                    <div class="text-2xl sm:text-3xl font-extrabold text-brand-dark">500+</div>
                    <div class="text-xs sm:text-sm font-bold text-[#6a8c4f] uppercase tracking-wider mt-1">Happy Clients</div>
                </div>
                <div class="px-2 py-2 border-r border-gray-100 md:border-r-0 hover:scale-105 transition-transform">
                    <div class="text-2xl sm:text-3xl font-extrabold text-brand-dark">100%</div>
                    <div class="text-xs sm:text-sm font-bold text-[#6a8c4f] uppercase tracking-wider mt-1">Satisfaction</div>
                </div>
                <div class="px-2 py-2 hover:scale-105 transition-transform">
                    <div class="text-2xl sm:text-3xl font-extrabold text-brand-dark">24/7</div>
                    <div class="text-xs sm:text-sm font-bold text-[#6a8c4f] uppercase tracking-wider mt-1">Support</div>
                </div>
            </div>
        </div>
    </div>

    <section id="about" class="max-w-7xl mx-auto px-6 py-24 sm:py-32 mt-20 sm:mt-10">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div class="relative pl-6 pt-6 scroll-reveal">
                <div class="absolute inset-0 border-2 border-dashed border-[#9dbf83] rounded-full scale-110 animate-spin-slow opacity-50 z-0"></div>
                <div class="rounded-[2.5rem] overflow-hidden border-[12px] border-white card-shadow relative z-10">
                    <img src="${images.about || 'https://images.unsplash.com/photo-1554046920-90dc5823ca0d?q=80&w=1000'}" alt="${site.businessName}" class="w-full h-[350px] sm:h-[500px] md:h-[650px] object-cover hover:scale-105 transition-transform duration-[10s]">
                </div>
                <div class="absolute top-0 left-0 bg-brand-primary text-white w-24 h-24 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center border-8 border-[#fbfcf7] shadow-xl animate-float-1 z-20">
                    <svg class="w-6 h-6 sm:w-10 sm:h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <span class="text-xs sm:text-base font-bold text-center leading-tight">Expert<br>Professional</span>
                </div>
                <div class="absolute -bottom-6 -right-6 bg-white w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-xl border-8 border-[#fbfcf7] animate-float-2 z-20">
                    <span class="text-3xl sm:text-5xl drop-shadow-md">✨</span>
                </div>
            </div>
            <div class="scroll-reveal delay-200">
                <span class="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4 block inline-block hover:scale-105 transition-transform">The Journey Behind the Craft</span>
                <h2 class="text-3xl sm:text-5xl font-extrabold text-brand-dark mb-6 leading-tight">
                    ${site.storyTitle || "Our Story"}
                </h2>
                <p class="text-[#6b7b59] text-base sm:text-lg font-medium leading-relaxed mb-6">
                    ${story}
                </p>
                <div class="flex flex-wrap items-center gap-6">
                    <a href="#contact" class="bg-brand-primary text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-[#3b6028] hover:-translate-y-1 transition-all shadow-lg shadow-[#4b7833]/30 group w-max">
                        <svg class="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Contact for Details
                    </a>
                </div>
            </div>
        </div>
    </section>

    <section id="services" class="bg-brand-light py-24 sm:py-32 rounded-[3rem] sm:rounded-[4rem] mx-2 sm:mx-6 mb-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-20 max-w-3xl mx-auto scroll-reveal">
                <span class="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4 block inline-block hover:scale-105 transition-transform">Core Competencies</span>
                <h2 class="text-3xl sm:text-5xl font-extrabold text-brand-dark mb-6">Comprehensive Solutions</h2>
                <p class="text-[#6b7b59] text-base sm:text-lg font-medium leading-relaxed">Explore our core offerings and professional services.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${site.services.map((service, index) => `
                <div class="bg-white rounded-[2.5rem] p-6 pb-10 card-shadow group scroll-reveal delay-${index * 100} flex flex-col h-full border border-gray-100 cursor-pointer" onclick="window.open('https://wa.me/${site.phoneNumber}?text=Hi! I am interested in ${encodeURIComponent(service.name)}', '_blank')">
                    <div class="overflow-hidden rounded-[1.5rem] mb-8 relative h-64 shrink-0">
                        <div class="absolute inset-0 bg-brand-primary/30 group-hover:bg-transparent transition duration-500 z-10"></div>
                        <img src="${getSemanticServiceImage(service.name, site.category || '', index)}" alt="${service.name}" class="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[10s]">
                    </div>
                    <div class="px-2 flex flex-col flex-grow">
                        <div class="flex justify-between items-start mb-2 gap-2">
                           <h3 class="text-xl sm:text-2xl font-extrabold text-brand-dark group-hover:text-brand-primary transition-colors">${service.name}</h3>
                        </div>
                        <p class="text-[#6b7b59] font-medium mb-6 leading-relaxed flex-grow">
                            ${service.description || 'Professional service tailored to your specific requirements.'}
                        </p>
                        <div class="text-sm font-bold text-[#4b7833] uppercase tracking-wider mt-auto group-hover:underline">Order via WhatsApp →</div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="process" class="py-24 sm:py-32 bg-white relative z-10">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-24 max-w-3xl mx-auto scroll-reveal">
                <span class="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4 block">Proven Methodology</span>
                <h2 class="text-3xl sm:text-5xl font-extrabold text-brand-dark mb-6">A Workflow Built for Success</h2>
                <p class="text-[#6b7b59] text-base sm:text-lg font-medium leading-relaxed">A seamless workflow designed to deliver the best results.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 relative">
                <div class="hidden md:block absolute top-16 left-1/6 w-2/3 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-[#355322] z-0 rounded-full opacity-30 transform translate-x-1/4"></div>
                <div class="relative z-10 flex flex-col items-center text-center scroll-reveal delay-100 group">
                    <div class="w-32 h-32 rounded-full bg-brand-primary text-white flex items-center justify-center text-4xl font-extrabold mb-8 shadow-[0_0_30px_rgba(75,120,51,0.3)] border-8 border-white group-hover:scale-110 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(75,120,51,0.5)] shrink-0">1</div>
                    <h3 class="text-2xl font-bold text-brand-dark mb-4">Consultation</h3>
                    <p class="text-[#6b7b59] font-medium leading-relaxed max-w-sm">We begin by understanding your exact needs and vision.</p>
                </div>
                <div class="relative z-10 flex flex-col items-center text-center scroll-reveal delay-200 group">
                    <div class="w-32 h-32 rounded-full bg-brand-secondary text-white flex items-center justify-center text-4xl font-extrabold mb-8 shadow-[0_0_30px_rgba(75,120,51,0.3)] border-8 border-white group-hover:scale-110 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(75,120,51,0.5)] shrink-0">2</div>
                    <h3 class="text-2xl font-bold text-brand-dark mb-4">Execution</h3>
                    <p class="text-[#6b7b59] font-medium leading-relaxed max-w-sm">Our specialists work meticulously to deliver exceptional quality.</p>
                </div>
                <div class="relative z-10 flex flex-col items-center text-center scroll-reveal delay-300 group">
                    <div class="w-32 h-32 rounded-full bg-[#355322] text-white flex items-center justify-center text-4xl font-extrabold mb-8 shadow-[0_0_30px_rgba(75,120,51,0.3)] border-8 border-white group-hover:scale-110 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(75,120,51,0.5)] shrink-0">3</div>
                    <h3 class="text-2xl font-bold text-brand-dark mb-4">Delivery</h3>
                    <p class="text-[#6b7b59] font-medium leading-relaxed max-w-sm">You receive the final result, guaranteed to exceed expectations.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="work" class="bg-brand-light py-24 sm:py-32 rounded-[3rem] sm:rounded-[4rem] mx-2 sm:mx-6 my-12 border border-[#9dbf83]/20">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6 scroll-reveal">
                <div class="max-w-2xl">
                    <span class="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4 block inline-block hover:scale-105 transition-transform">Featured Case Studies</span>
                    <h2 class="text-3xl sm:text-5xl font-extrabold text-brand-dark mb-6">Showcasing Digital Excellence</h2>
                    <p class="text-[#6b7b59] text-base sm:text-lg font-medium leading-relaxed">A curated glimpse into some of our favorite projects and client success stories.</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                ${site.services.slice(0, 2).map((service, index) => `
                <div class="group cursor-pointer scroll-reveal delay-${index * 100} bg-white rounded-[3rem] p-4 pb-8 card-shadow border border-gray-100 ${index % 2 === 0 ? 'md:mt-16 mt-0' : ''}">
                    <div class="overflow-hidden rounded-[2.5rem] mb-8 relative">
                        <div class="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/20 transition-colors duration-500 z-10"></div>
                        <img src="${getSemanticServiceImage(service.name, site.category || '', index + 2)}" alt="${service.name}" class="w-full h-[250px] sm:h-[350px] object-cover group-hover:scale-110 transition-transform duration-700">
                    </div>
                    <div class="flex justify-between items-start px-6">
                        <div class="max-w-md pr-4">
                            <h3 class="text-2xl sm:text-3xl font-extrabold text-brand-dark mb-3 group-hover:text-brand-primary transition-colors">${service.name}</h3>
                            <p class="text-[#6b7b59] font-medium leading-relaxed">${service.description || 'Premium quality and exceptional delivery.'}</p>
                        </div>
                        <div class="w-14 h-14 rounded-full bg-white border border-[#9dbf83] text-[#4b7833] flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-md shrink-0 group-hover:rotate-45">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="py-24 sm:py-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-20 max-w-2xl mx-auto scroll-reveal">
                <span class="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4 block inline-block hover:scale-105 transition-transform">Client Success Stories</span>
                <h2 class="text-3xl sm:text-5xl font-extrabold text-brand-dark mb-6">Don't Just Take My Word For It</h2>
                <p class="text-[#6b7b59] text-base sm:text-lg font-medium leading-relaxed">Read what our clients have to say about working with us.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                ${(site.testimonials || [
        { name: 'Sarah M.', role: 'Loyal Client', content: 'The level of professionalism and care they brought to the table was simply outstanding. They understood my requirements perfectly, kept me informed at every step, and delivered a result that was far better than I could have imagined.' },
        { name: 'David R.', role: 'Business Owner', content: 'I have been a customer for over a year now, and I can confidently say their consistency is unmatched. From their helpful support to the superb final delivery, every interaction is a pleasant experience. Five stars!' }
    ]).slice(0, 2).map((review, index) => `
                <div class="bg-white p-6 sm:p-12 rounded-[3rem] card-shadow border border-gray-100 relative scroll-reveal delay-${index * 100} hover:scale-[1.02] transition-transform">
                    <div class="absolute top-10 right-10 text-9xl text-brand-secondary/20 font-serif opacity-50 group-hover:scale-110 transition-transform">"</div>
                    <div class="text-[#9dbf83] flex mb-8 relative z-10 gap-1">
                        ${'<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>'.repeat(5)}
                    </div>
                    <p class="text-[#355322] text-lg sm:text-xl font-bold leading-loose mb-10 relative z-10 italic">
                        "${review.content}"
                    </p>
                    <div class="flex items-center gap-5 border-t border-gray-100 pt-6">
                        <div class="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center text-2xl font-bold shadow-sm">${review.name.charAt(0)}</div>
                        <div>
                            <h5 class="font-extrabold text-brand-dark text-lg">${review.name}</h5>
                            <span class="text-sm font-bold text-[#6a8c4f] uppercase tracking-wider">${review.role || 'Verified Client'}</span>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <footer id="contact" class="bg-brand-primary text-white rounded-t-[3rem] sm:rounded-t-[4rem] mx-2 sm:mx-6 px-6 pt-28 pb-16 overflow-hidden relative">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none animate-spin-slow"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        <div class="max-w-7xl mx-auto relative z-10 scroll-reveal">
            <div class="text-center mb-24 max-w-4xl mx-auto">
                <span class="text-brand-secondary font-bold uppercase tracking-widest text-sm mb-6 block hover:scale-105 transition-transform inline-block">Let's Connect</span>
                <h2 class="text-4xl sm:text-7xl font-extrabold mb-10 leading-tight">Ready to build something extraordinary?</h2>
                <p class="text-brand-light text-lg sm:text-xl mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto">We take on a limited number of new clients to ensure everyone receives our absolute best. Inquire below to check availability.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-6">
                    <a href="mailto:${site.contactDetails?.email || 'hello@' + (site.customDomain || 'company.com')}" class="inline-flex items-center justify-center bg-white text-brand-primary px-12 py-5 rounded-full font-extrabold text-xl hover:scale-105 hover:-translate-y-2 transition-all shadow-2xl shadow-black/20">
                        ${site.contactDetails?.email || 'hello@' + (site.customDomain || 'company.com')}
                    </a>
                    <a href="https://wa.me/${site.phoneNumber}" class="inline-flex items-center justify-center bg-transparent border-2 border-white/40 text-white px-12 py-5 rounded-full font-extrabold text-xl hover:bg-white/10 hover:-translate-y-2 transition-all">
                        Book a Strategy Call
                    </a>
                </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-10 gap-8 text-base font-medium text-white/70">
                <div>&copy; ${currentYear} ${site.businessName}. All rights reserved. Designed with precision and care.</div>
                <div class="flex gap-8">
                    <a href="https://wa.me/${site.phoneNumber}" target="_blank" class="hover:text-white transition hover:-translate-y-1 inline-block">WhatsApp</a>
                    <a href="tel:${site.phoneNumber}" class="hover:text-white transition hover:-translate-y-1 inline-block">Call</a>
                </div>
            </div>
        </div>
    </footer>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
            document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
        });
    </script>
</body>
</html>`;
}
function renderStoryTemplate(site) {
    const images = getCategoryImages(site.category || '');
    let subtitle = site.heroSubtitle || '';
    if (subtitle.length < 50) {
        subtitle = `${subtitle} Delivering excellence and quality in everything we do.`;
    }
    let story = site.storyContent || site.aboutText || '';
    if (story.length < 100) {
        story = `${story} We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Our team works tirelessly to ensure your expectations are not just met, but exceeded.`;
    }
    const currentYear = new Date().getFullYear();
    return `<!DOCTYPE HTML>
<!--
	Story by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
<html>
	<head>
		<title>${site.businessName} - Story</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="/public/templates/story/assets/css/main.css" />
		<noscript><link rel="stylesheet" href="/public/templates/story/assets/css/noscript.css" /></noscript>
	</head>
	<body class="is-preload">

		<!-- Wrapper -->
			<div id="wrapper" class="divided">

				<!-- One: Hero -->
					<section class="banner style1 orient-left content-align-left image-position-right fullscreen onload-image-fade-in onload-content-fade-right">
						<div class="content">
							<h1>${site.businessName}</h1>
							<p class="major">${site.heroTitle || site.category || 'Professional Services'}</p>
							<p>${subtitle}</p>
							<ul class="actions stacked">
								<li><a href="#first" class="button big wide smooth-scroll-middle">Get Started</a></li>
							</ul>
						</div>
						<div class="image">
							<img src="${images.hero || '/public/templates/story/images/banner.jpg'}" alt="" />
						</div>
					</section>

				<!-- Two: About -->
					<section class="spotlight style1 orient-right content-align-left image-position-center onscroll-image-fade-in" id="first">
						<div class="content">
							<h2>${site.storyTitle || 'About Us'}</h2>
							<p>${story}</p>
							<ul class="actions stacked">
								<li><a href="#services" class="button">Explore Services</a></li>
							</ul>
						</div>
						<div class="image">
							<img src="${images.about || '/public/templates/story/images/spotlight01.jpg'}" alt="" />
						</div>
					</section>

				<!-- Three & Four: Interactive Showcases (First 2 Services) -->
				${site.services.slice(0, 2).map((service, index) => `
					<section class="spotlight style1 orient-${index % 2 === 0 ? 'left' : 'right'} content-align-left image-position-center onscroll-image-fade-in">
						<div class="content">
							<h2>${service.name}</h2>
							<p>${service.description || 'Premium service tailored to your requirements.'}</p>
							<ul class="actions stacked">
								<li><a href="https://wa.me/${site.phoneNumber}?text=Hi! I am interested in ${encodeURIComponent(service.name)}" target="_blank" class="button">Order ${service.name}</a></li>
							</ul>
						</div>
						<div class="image">
							<img src="${getSemanticServiceImage(service.name, site.category || '', index + 1)}" alt="${service.name}" />
						</div>
					</section>
				`).join('')}

				<!-- Five: Gallery (Full Catalog) -->
					<section id="services" class="wrapper style1 align-center">
						<div class="inner">
							<h2>Our Catalog & Services</h2>
							<p>Explore our core offerings and order directly via WhatsApp.</p>
						</div>

						<!-- Gallery -->
							<div class="gallery style2 medium lightbox onscroll-fade-in">
							${site.services.map((service, index) => `
								<article>
									<a href="${getSemanticServiceImage(service.name, site.category || '', index)}" class="image">
										<img src="${getSemanticServiceImage(service.name, site.category || '', index)}" alt="${service.name}" />
									</a>
									<div class="caption">
										<h3>${service.name}</h3>
										<p>${service.description || 'Premium quality offering.'}</p>
										<ul class="actions fixed">
											<li><span class="button small" onclick="window.open('https://wa.me/${site.phoneNumber}?text=Hi! I am interested in ${encodeURIComponent(service.name)}', '_blank')">Order via WhatsApp</span></li>
										</ul>
									</div>
								</article>
							`).join('')}
							</div>

					</section>

				<!-- Six: Features -->
					<section class="wrapper style1 align-center">
						<div class="inner">
							<h2>Why Choose Us</h2>
							<p>We are committed to delivering excellence and building long-term relationships based on outstanding results.</p>
							<div class="items style1 medium onscroll-fade-in">
							${(site.features || [
        { title: 'Premium Quality Assurance', description: 'We source only the finest materials, leverage advanced techniques, and enforce rigorous quality checks to ensure the highest standards.' },
        { title: 'Experienced Specialists', description: 'Our professionals bring years of expertise and dedication to every client request. Highly trained and certified.' },
        { title: 'Client Centric Partnership', description: 'Your satisfaction is our primary goal. We tailor our services to match your vision, taking the time to understand your exact requirements.' }
    ]).map((feat, index) => {
        const icons = ['gem', 'bolt', 'leaf', 'cog', 'envelope', 'paper-plane'];
        const icon = icons[index % icons.length];
        return `
									<section>
										<span class="icon style2 major fa-${icon}"></span>
										<h3>${feat.title}</h3>
										<p>${feat.description}</p>
									</section>
								`;
    }).join('')}
							</div>
						</div>
					</section>

				<!-- Seven: Contact -->
					<section id="contact" class="wrapper style1 align-center">
						<div class="inner medium">
							<h2>Get in Touch</h2>
							<form method="post" action="#" onsubmit="event.preventDefault(); window.open('https://wa.me/${site.phoneNumber}?text=' + encodeURIComponent('Hi! My name is ' + document.getElementById('name').value + '. ' + document.getElementById('message').value), '_blank')">
								<div class="fields">
									<div class="field half">
										<label for="name">Name</label>
										<input type="text" name="name" id="name" required />
									</div>
									<div class="field half">
										<label for="email">Email</label>
										<input type="email" name="email" id="email" required />
									</div>
									<div class="field">
										<label for="message">Message</label>
										<textarea name="message" id="message" rows="6" required></textarea>
									</div>
								</div>
								<ul class="actions special">
									<li><input type="submit" name="submit" id="submit" value="Send Message via WhatsApp" /></li>
								</ul>
							</form>

						</div>
					</section>

				<!-- Footer -->
					<footer class="wrapper style1 align-center">
						<div class="inner">
							<p>&copy; ${currentYear} ${site.businessName}. All rights reserved.</p>
							<p>Design: <a href="https://html5up.net">HTML5 UP</a>. Powered by The Gray Arc.</p>
						</div>
					</footer>

			</div>

		<!-- Floating Sticky Contact Buttons -->
		<div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 items-end" style="position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; flex-direction: column; gap: 16px; align-items: flex-end;">
			<a href="https://wa.me/${site.phoneNumber}" target="_blank" style="width: 56px; height: 56px; background-color: #25D366; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(37,211,102,0.4); border: 2px solid white; text-decoration: none;">
				<svg style="width: 32px; height: 32px; margin: auto;" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
			</a>
			<a href="tel:${site.contactDetails?.phone || site.phoneNumber}" style="width: 56px; height: 56px; background-color: #4b7833; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(75,120,51,0.4); border: 2px solid white; text-decoration: none;">
				<svg style="width: 28px; height: 28px; margin: auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
			</a>
		</div>

		<!-- Scripts -->
			<script src="/public/templates/story/assets/js/jquery.min.js"></script>
			<script src="/public/templates/story/assets/js/jquery.scrollex.min.js"></script>
			<script src="/public/templates/story/assets/js/jquery.scrolly.min.js"></script>
			<script src="/public/templates/story/assets/js/browser.min.js"></script>
			<script src="/public/templates/story/assets/js/breakpoints.min.js"></script>
			<script src="/public/templates/story/assets/js/util.js"></script>
			<script src="/public/templates/story/assets/js/main.js"></script>

	</body>
</html>`;
}
function renderAstroshipTemplate(site) {
    const images = getCategoryImages(site.category || '');
    let subtitle = site.heroSubtitle || '';
    if (subtitle.length < 50) {
        subtitle = `${subtitle} Delivering excellence and quality in everything we do.`;
    }
    let story = site.storyContent || site.aboutText || '';
    if (story.length < 100) {
        story = `${story} We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Our team works tirelessly to ensure your expectations are not just met, but exceeded.`;
    }
    const currentYear = new Date().getFullYear();
    return `<!DOCTYPE html><html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/public/templates/astroship/favicon.svg"><title>${site.businessName} - Astroship</title><link rel="stylesheet" href="/public/templates/astroship/_astro/about.BzqdUs8y.css"></head> <body> <div class="max-w-(--breakpoint-xl) mx-auto px-5">  <header class="flex flex-col lg:flex-row justify-between items-center my-5">  <div class="flex w-full lg:w-auto items-center justify-between"> <a href="#" class="text-lg"><span class="font-bold text-slate-800">${site.businessName}</span> </a> <div class="block lg:hidden"> <button id="astronav-menu" aria-label="Toggle Menu">  <svg fill="currentColor" class="w-4 h-4 text-gray-800" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <title>Toggle Menu</title> <path class="astronav-close-icon astronav-toggle hidden" fill-rule="evenodd" clip-rule="evenodd" d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 111.414 1.414l-4.828 4.829 4.828 4.828z"></path> <path class="astronav-open-icon astronav-toggle" fill-rule="evenodd" d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"></path> </svg>  </button> </div> </div> <nav class="astronav-items astronav-toggle hidden w-full lg:w-auto mt-2 lg:flex lg:mt-0">  <ul class="flex flex-col lg:flex-row lg:gap-3"> <li> <a href="#about" class="flex lg:px-3 py-2 items-center text-gray-600 hover:text-gray-900"> <span> About</span>  </a> </li><li> <a href="#services" class="flex lg:px-3 py-2 items-center text-gray-600 hover:text-gray-900"> <span> Services</span>  </a> </li><li> <a href="#contact" class="flex lg:px-3 py-2 items-center text-gray-600 hover:text-gray-900"> <span> Contact</span>  </a> </li> </ul>  </nav>  <script>(function(){const closeOnClick = false;

["DOMContentLoaded", "astro:after-swap"].forEach((event) => {
  document.addEventListener(event, addListeners);
});

function cloneAndReplace(element) {
  const clone = element.cloneNode(true);
  element.parentNode.replaceChild(clone, element);
}

function addListeners() {
  const oldMenuButton = document.getElementById("astronav-menu");
  if (oldMenuButton) {
    cloneAndReplace(oldMenuButton);
  }

  const menuButton = document.getElementById("astronav-menu");
  menuButton && menuButton.addEventListener("click", toggleMobileNav);
}

function toggleMobileNav() {
  [...document.querySelectorAll(".astronav-toggle")].forEach((el) => {
    el.classList.toggle("hidden");
  });
}
})();</script> <div class="hidden lg:flex items-center gap-4"> <a href="tel:${site.phoneNumber}" class="rounded-sm text-center transition focus-visible:ring-2 ring-offset-2 ring-gray-200 px-4 py-2 bg-black text-white hover:bg-gray-800 border-2 border-transparent">Call Now</a> </div> </header>  </div>  

  <div class="max-w-(--breakpoint-xl) mx-auto px-5">  
    <main class="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24"> 
      <div class="py-6 md:order-1 hidden md:block"> 
        <img src="${images.hero || '/public/templates/astroship/_astro/hero.DlKDY3ml_ZQyPaD.png'}" alt="Hero Image" width="520" height="424" class="rounded-3xl shadow-2xl object-cover h-[350px] w-[500px]">
      </div> 
      <div> 
        <h1 class="text-5xl lg:text-6xl xl:text-7xl font-bold lg:tracking-tight xl:tracking-tighter">
          ${site.heroTitle || site.businessName}
        </h1> 
        <p class="text-lg mt-4 text-slate-600 max-w-xl">
          ${subtitle}
        </p> 
        <div class="mt-6 flex flex-col sm:flex-row gap-3"> 
          <a href="#services" class="rounded-sm text-center transition focus-visible:ring-2 ring-offset-2 ring-gray-200 px-5 py-2.5 bg-black text-white hover:bg-gray-800 border-2 border-transparent flex gap-1 items-center justify-center">
            Explore Services
          </a> 
          <a href="https://wa.me/${site.phoneNumber}" target="_blank" class="rounded-sm text-center transition focus-visible:ring-2 ring-offset-2 ring-gray-200 px-5 py-2.5 bg-white border-2 border-black hover:bg-gray-100 text-black flex gap-1 items-center justify-center">
            Order via WhatsApp
          </a> 
        </div> 
      </div> 
    </main> 

    <!-- About Section -->
    <div id="about" class="py-16 border-t border-slate-100">
      <div class="max-w-3xl">
        <h2 class="text-4xl lg:text-5xl font-bold lg:tracking-tight">${site.storyTitle || 'About Us'}</h2>
        <p class="text-lg mt-4 text-slate-600 leading-relaxed">${story}</p>
      </div>
    </div>

    <!-- Services Section -->
    <div id="services" class="mt-16 md:mt-24 border-t border-slate-100 pt-16"> 
      <h2 class="text-4xl lg:text-5xl font-bold lg:tracking-tight">
        Professional Services & Catalog
      </h2> 
      <p class="text-lg mt-4 text-slate-600">
        Choose from our core professional offerings. Tap any service to place an order via WhatsApp.
      </p> 
    </div> 

    <div class="grid sm:grid-cols-2 md:grid-cols-3 mt-16 gap-16"> 
      ${site.services.map((service, index) => {
        const icons = ['briefcase', 'window-alt', 'data', 'bot', 'file-find', 'user'];
        const icon = icons[index % icons.length];
        return `
          <div class="flex gap-4 items-start cursor-pointer group" onclick="window.open('https://wa.me/${site.phoneNumber}?text=Hi! I am interested in ${encodeURIComponent(service.name)}', '_blank')"> 
            <div class="mt-1 bg-black rounded-full p-2 w-8 h-8 shrink-0 flex items-center justify-center"> 
              <svg width="1em" height="1em" class="text-white" fill="currentColor" viewBox="0 0 24 24">
                <symbol id="ai:bx:bxs-briefcase" viewBox="0 0 24 24"><path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v3h20V8c0-1.103-.897-2-2-2zM9 4h6v2H9V4zm5 10h-4v-2H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-8v2z" fill="currentColor"/></symbol>
                <symbol id="ai:bx:bxs-window-alt" viewBox="0 0 24 24"><path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-3 3h2v2h-2V6zm-3 0h2v2h-2V6zM4 19v-9h16.001l.001 9H4z" fill="currentColor"/></symbol>
                <symbol id="ai:bx:bxs-data" viewBox="0 0 24 24"><path d="M20 6c0-2.168-3.663-4-8-4S4 3.832 4 6v2c0 2.168 3.663 4 8 4s8-1.832 8-4V6zm-8 13c-4.337 0-8-1.832-8-4v3c0 2.168 3.663 4 8 4s8-1.832 8-4v-3c0 2.168-3.663 4-8 4z" fill="currentColor"/><path d="M20 10c0 2.168-3.663 4-8 4s-8-1.832-8-4v3c0 2.168 3.663 4 8 4s8-1.832 8-4v-3z" fill="currentColor"/></symbol>
                <symbol id="ai:bx:bxs-bot" viewBox="0 0 24 24"><path d="M21 10.975V8a2 2 0 0 0-2-2h-6V4.688c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5a2 2 0 0 0-2 2v2.998l-.072.005A.999.999 0 0 0 2 12v2a1 1 0 0 0 1 1v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a1 1 0 0 0 1-1v-1.938a1.004 1.004 0 0 0-.072-.455c-.202-.488-.635-.605-.928-.632zM7 12c0-1.104.672-2 1.5-2s1.5.896 1.5 2s-.672 2-1.5 2S7 13.104 7 12zm8.998 6c-1.001-.003-7.997 0-7.998 0v-2s7.001-.002 8.002 0l-.004 2zm-.498-4c-.828 0-1.5-.896-1.5-2s.672-2 1.5-2s1.5.896 1.5 2s-.672 2-1.5 2z" fill="currentColor"/></symbol>
                <symbol id="ai:bx:bxs-file-find" viewBox="0 0 24 24"><path d="M6 22h12c.178 0 .348-.03.512-.074l-3.759-3.759A4.966 4.966 0 0 1 12 19c-2.757 0-5-2.243-5-5s2.243-5 5-5s5 2.243 5 5a4.964 4.964 0 0 1-.833 2.753l3.759 3.759c.044-.164.074-.334.074-.512V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" fill="currentColor"/><circle cx="12" cy="14" r="3" fill="currentColor"/></symbol>
                <symbol id="ai:bx:bxs-user" viewBox="0 0 24 24"><path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z" fill="currentColor"/></symbol>
                <use href="#ai:bx:bxs-${icon}"></use>
              </svg> 
            </div> 
            <div> 
              <h3 class="font-semibold text-lg group-hover:text-indigo-600 transition-colors">${service.name}</h3>  
              <p class="text-slate-500 mt-2 leading-relaxed">${service.description || 'Professional service tailored to your requirements.'}</p> 
            </div> 
          </div>
        `;
    }).join('')}
    </div> 

    <!-- Contact Form Section -->
    <div id="contact" class="bg-black p-8 md:px-20 md:py-16 mt-24 mx-auto max-w-5xl rounded-2xl text-center"> 
      <h2 class="text-white text-4xl md:text-5xl tracking-tight font-bold">
        Get in Touch Today
      </h2> 
      <p class="text-slate-400 mt-4 text-lg max-w-lg mx-auto">
        Have questions? Fill out the fields below to send an instant message straight to our WhatsApp.
      </p> 
      <form class="mt-8 max-w-md mx-auto flex flex-col gap-4 text-left" onsubmit="event.preventDefault(); window.open('https://wa.me/${site.phoneNumber}?text=' + encodeURIComponent('Hi! My name is ' + document.getElementById('name').value + '. ' + document.getElementById('message').value), '_blank')">
        <div>
          <label for="name" class="block text-slate-300 text-sm font-semibold mb-1">Your Name</label>
          <input type="text" id="name" required class="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label for="message" class="block text-slate-300 text-sm font-semibold mb-1">Your Message</label>
          <textarea id="message" required rows="4" class="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"></textarea>
        </div>
        <button type="submit" class="mt-2 rounded-md text-center transition px-5 py-3 bg-indigo-600 text-white hover:bg-indigo-500 font-semibold border-2 border-transparent w-full">
          Send Message via WhatsApp
        </button>
      </form> 
    </div>  

  </div>  

  <footer class="my-20 border-t border-slate-100 pt-10"> 
    <p class="text-center text-sm text-slate-500">
      Copyright &copy; ${currentYear} ${site.businessName}. All rights reserved.
    </p> 
    <p class="text-center text-xs text-slate-500 mt-1">
      Powered by The Gray Arc. Design from Web3Templates.
    </p> 
  </footer>  

  <!-- Floating Sticky Contact Buttons -->
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 items-end" style="position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; flex-direction: column; gap: 16px; align-items: flex-end;">
    <a href="https://wa.me/${site.phoneNumber}" target="_blank" style="width: 56px; height: 56px; background-color: #25D366; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(37,211,102,0.4); border: 2px solid white; text-decoration: none;">
      <svg style="width: 32px; height: 32px; margin: auto;" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <a href="tel:${site.contactDetails?.phone || site.phoneNumber}" style="width: 56px; height: 56px; background-color: #4b7833; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(75,120,51,0.4); border: 2px solid white; text-decoration: none;">
      <svg style="width: 28px; height: 28px; margin: auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
    </a>
  </div>

 </body> </html>`;
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
function renderPaymentPage(type, siteId, domain, paymentId, price) {
    const isDomain = type === 'domain';
    const hasAddon = !isDomain && !!domain && !!price;
    let pageTitle = 'Subscription';
    let pricingText = 'Monthly Subscription';
    let priceDisplay = '₹399';
    let detailText = '<p class="text-zinc-500 text-xs mt-2">Recurring UPI AutoPay mandate</p>';
    if (isDomain) {
        pageTitle = 'Domain Payment';
        pricingText = 'Domain Registration';
        priceDisplay = `₹${price || 500}`;
        detailText = `<p class="text-zinc-500 text-sm mt-3">Domain: <strong class="text-white">${domain}</strong></p>`;
    }
    else if (hasAddon) {
        pageTitle = 'Activate Domain & Site';
        pricingText = 'Custom Domain Setup';
        priceDisplay = `₹${399 + (price || 0)}`;
        detailText = `
      <div class="text-zinc-500 text-xs mt-3 space-y-1">
        <p>• Today's Payment: <strong class="text-white">₹${399 + (price || 0)}</strong> (₹${price} Domain + ₹399 Subscription)</p>
        <p>• Future Months: <strong class="text-white">₹399/month</strong> auto-debit</p>
        <p>• Domain: <strong class="text-white">${domain}</strong></p>
      </div>`;
    }
    // Determine if we need WHOIS Form
    const showWhoisForm = isDomain || hasAddon;
    return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif}</style></head>
    <body class="bg-zinc-950 flex items-center justify-center min-h-screen py-6 px-4">
      <div class="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full max-w-md animate-fade-in">
        <div class="flex justify-between items-center mb-8">
          <span class="text-blue-400 font-bold text-lg">Razorpay</span>
          <span class="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full font-semibold border border-blue-500/20">Test Mode</span>
        </div>
        <div class="mb-8">
          <div class="text-zinc-500 text-sm">${pricingText}</div>
          <div class="text-4xl font-black text-white mt-1">${priceDisplay}<span class="text-sm font-normal text-zinc-500">${isDomain ? '' : ' /month'}</span></div>
          ${detailText}
        </div>
        <form action="/pay/confirm" method="POST" class="space-y-4">
          <input type="hidden" name="type" value="${type}">
          <input type="hidden" name="siteId" value="${siteId}">
          
          ${hasAddon ? `
            <input type="hidden" name="domain" value="${domain}">
            <input type="hidden" name="addon" value="${price}">
          ` : ''}

          ${isDomain ? `<input type="hidden" name="domain" value="${domain}">` : ''}
          ${!isDomain && !hasAddon ? `<input type="hidden" name="subscriptionId" value="${paymentId}">` : ''}

          ${showWhoisForm ? `
            <div class="space-y-3 mb-6 border-t border-zinc-800 pt-6">
              <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Domain Registrant Details</h4>
              <div>
                <label class="block text-[11px] text-zinc-500 mb-1">Full Name</label>
                <input type="text" name="name" required placeholder="John Doe" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block text-[11px] text-zinc-500 mb-1">Email Address</label>
                <input type="email" name="email" required placeholder="john@example.com" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block text-[11px] text-zinc-500 mb-1">Street Address</label>
                <input type="text" name="address1" required placeholder="123 Main St" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] text-zinc-500 mb-1">City</label>
                  <input type="text" name="city" required placeholder="Mumbai" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-[11px] text-zinc-500 mb-1">State</label>
                  <input type="text" name="state" required placeholder="Maharashtra" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
                </div>
              </div>
              <div>
                <label class="block text-[11px] text-zinc-500 mb-1">Pin Code</label>
                <input type="text" name="postalCode" required placeholder="400001" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
              </div>
            </div>
          ` : ''}
          <button type="submit" class="w-full ${showWhoisForm ? 'bg-blue-500 hover:bg-blue-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-white font-bold py-4 rounded-xl transition shadow-lg">
            ${showWhoisForm ? 'Authorize AutoPay & Register' : 'Authorize UPI AutoPay'}
          </button>
        </form>
        <p class="text-center text-xs text-zinc-600 mt-6">🔒 Secured by Razorpay</p>
      </div>
    </body></html>`;
}
