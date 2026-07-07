import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db, SiteConfig, SiteTestimonial } from '../services/db';
import { processPaymentWebhook } from '../services/billing';
import { purchaseDomain, setupDomainDNS } from '../services/domains';
import { sendCTAUrlMessage, sendTextMessage } from '../services/whatsapp';
import fs from 'fs';
import path from 'path';

export default async function viewerRoutes(fastify: FastifyInstance) {
  
  // 1. Render the generated business websites
  
  // Secret Preview Templates for mock testing
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

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const hostname = request.hostname || request.headers.host || '';
    console.log(`[viewer] Request on root '/' from hostname: ${hostname}`);
    
    // Try to lookup site by custom domain
    const site = await db.getSiteByDomain(hostname);
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

  fastify.get('/preview/:templateId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { templateId } = request.params as { templateId: string };
    const templatesDir = path.join(__dirname, '../../templates');
    const templatePath = path.join(templatesDir, templateId);
    if (!fs.existsSync(templatePath)) {
      return reply.status(404).send(`Template ${templateId} not found.`);
    }

    const nameParam = (request.query as any).name || '';
    const businessName = nameParam.trim() || 'Elite Business Solutions';
    const category = 'Corporate Solutions';

    const mockSiteConfig: SiteConfig = {
      id: `preview-${templateId}`,
      businessName: businessName,
      category: category,
      aboutText: 'Leading provider of innovative solutions. Experience industry-defining quality and professional excellence.',
      phoneNumber: '+91 99999 99999',
      aboutImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80',
      heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
      heroTitle: `Welcome to ${businessName}`,
      heroSubtitle: `We design and ship high-converting solutions tailored to expand your market footprint. Driven by innovation, built to scale.`,
      storyTitle: 'Our Story',
      storyContent: 'Our journey began with a simple yet powerful mission: to provide the community with honest, high-quality, and reliable services. Over the years, we have grown into a trusted industry leader by never compromising on our core values. We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship.',
      billingStatus: 'active',
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      template: templateId,
      customDomain: null,
      domainStatus: 'none',
      theme: {
        bgColor: '#ffffff',
        textColor: '#0B0E14',
        fontFamily: 'Inter, sans-serif',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e3a8a'
      },
      services: [
        {
          name: 'IT Strategy & Consulting',
          description: 'Leverage our decades of domain experience to audit, plan, and guide your technological roadmaps.',
          price: 'Contact Us',
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
          icon: 'briefcase'
        },
        {
          name: 'Custom Software Development',
          description: 'Enterprise-grade systems engineered with modern frameworks, built to perform and outlast its first release.',
          price: 'Contact Us',
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80',
          icon: 'code'
        },
        {
          name: 'Applied AI Integrations',
          description: 'Integrate deep learning, LLMs, and computer vision models directly into real-world business pipelines.',
          price: 'Contact Us',
          image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80',
          icon: 'cpu'
        },
        {
          name: 'Cloud Operations & Scaling',
          description: 'Provisioning, monitoring, and horizontal autoscaling built for high availability and zero downtime.',
          price: 'Contact Us',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80',
          icon: 'cloud'
        },
        {
          name: 'Compliance & Digital Transformation',
          description: 'Technical due diligence, system migrations, and audit compliance groundwork for modern businesses.',
          price: 'Contact Us',
          image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80',
          icon: 'shield'
        }
      ],
      features: [
        {
          title: 'Premium Quality Assurance',
          description: 'We source only the finest materials, leverage advanced techniques, and enforce rigorous quality checks.'
        },
        {
          title: 'Experienced Specialists',
          description: 'Our crew consists of highly trained, certified, and passionate professionals with years of experience.'
        },
        {
          title: 'Client Centric Partnership',
          description: 'Your goals are our priorities. We provide transparent updates and custom, flexible solutions.'
        }
      ],
      testimonials: [
        {
          name: 'Sarah Johnson',
          role: 'CEO, Tech Corporation',
          content: 'They delivered exactly what was in the technical plan. No surprises, no scope creep. Professionalism was stellar.'
        },
        {
          name: 'Aarav Mehta',
          role: 'VP Engineering, Retail Group',
          content: 'Rebuilt our core platform during our highest-traffic quarter without a single hour of downtime.'
        },
        {
          name: 'David Okafor',
          role: 'Director of IT, Healthcare',
          content: 'Post-launch support was the real difference. They stayed embedded for three months standard.'
        }
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80'
      ],
      contactDetails: {
        phone: '+91 99999 99999',
        email: 'hello@corporate.com',
        address: '12 Parliament St, London, UK',
        hours: 'Monday - Saturday: 10:00 AM - 8:00 PM'
      }
    };

    const rendered = renderPremiumWebsite(mockSiteConfig, templateId);
    return reply.type('text/html').send(rendered);
  });

  fastify.get('/site/:siteId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { siteId } = request.params as { siteId: string };
    const site = await db.getSite(siteId);
    
    if (!site) {
      return reply.code(404).type('text/html').send(render404Page());
    }

    const now = new Date();
    const trialExpired = site.billingStatus === 'trial' && now > new Date(site.trialEndsAt);
    const subscriptionInactive = site.billingStatus !== 'trial' && site.billingStatus !== 'active';

    if (trialExpired || subscriptionInactive) {
      return reply.type('text/html').send(renderSubscriptionPendingPage(site));
    }

    const { template } = request.query as { template?: string };
    
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return reply.type('text/html').send(renderPremiumWebsite(site, template || site.template));
  });

  // 2. Mock Razorpay Domain Payment Page
  fastify.get('/pay/domain', async (request: FastifyRequest, reply: FastifyReply) => {
    const { siteId, domain, paymentId, price } = request.query as { siteId: string; domain: string; paymentId: string; price?: string };
    const priceNum = price ? parseInt(price) : 500;
    return reply.type('text/html').send(renderPaymentPage('domain', siteId, domain, paymentId, priceNum));
  });

  // 3. Mock Razorpay Subscription Page
  fastify.get('/pay/subscribe', async (request: FastifyRequest, reply: FastifyReply) => {
    const { siteId, subscriptionId, domain, addon } = request.query as { siteId: string; subscriptionId: string; domain?: string; addon?: string };
    const priceNum = addon ? parseInt(addon) : undefined;
    return reply.type('text/html').send(renderPaymentPage('subscription', siteId, domain, subscriptionId, priceNum));
  });

  // 4. Handle Mock Confirmation
  fastify.post('/pay/confirm', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    
    if (body.type === 'domain') {
      const site = await db.getSite(body.siteId);
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
        await purchaseDomain(body.domain, site.phoneNumber, registrant);

        // 2. Automate DNS Setup (point CNAME records to Railway)
        await setupDomainDNS(body.domain);

        site.customDomain = body.domain;
        site.domainStatus = 'paid';
        await db.saveSite(site);
      }
    } else if (body.type === 'subscription') {
      const site = await db.getSite(body.siteId);
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
            await purchaseDomain(body.domain, site.phoneNumber, registrant);

            // 2. Automate CNAME DNS Setup
            await setupDomainDNS(body.domain);
            
            site.domainStatus = 'paid';
          } else {
            console.log(`[Domain Service] Connecting existing owned domain: ${body.domain}`);
            site.domainStatus = 'active';
          }

          site.customDomain = body.domain;
        }

        await db.saveSite(site);
      }
    }

    // Send a congratulations WhatsApp notification to the user
    try {
      const site = await db.getSite(body.siteId);
      if (site) {
        const hasCustomDomain = !!site.customDomain;
        const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
        const previewLink = `${BASE_URL}/site/${site.id}`;
        
        if (hasCustomDomain) {
          // 1. Send immediate payment confirmation message mentioning 30 minutes activation time
          const immediateText = `Your payment of subscription + domain is successful! ✅\n\nWe are now setting up your domain *${site.customDomain}*. It will be fully active within 30 minutes.\n\nIn the meantime, you can preview your website here: ${previewLink}`;
          await sendTextMessage(site.phoneNumber, immediateText);
          console.log('[Pay Confirm] Immediate payment success notification sent.');

          // 2. Delay the CTA button message by 2 minutes until DNS setup has propagated
          setTimeout(async () => {
            try {
              const liveLink = `http://${site.customDomain}`;
              const notificationText = `🎉 *Congratulations!*\n\nYour custom domain *${site.customDomain}* is now live! Tap below to open your website:`;
              await sendCTAUrlMessage(
                site.phoneNumber,
                notificationText,
                'Open Website',
                liveLink
              );
              console.log('[Pay Confirm Delayed] WhatsApp live custom domain notification sent.');
            } catch (err) {
              console.error('[Pay Confirm Delayed] Failed to send delayed live notification:', err);
            }
          }, 120000); // 2 minutes delay
        } else {
          // If no custom domain (free subdomain only), send CTA link instantly
          const notificationText = `🎉 *Congratulations!*\n\nYour payment was successful and your website is now active! Tap below to visit your website:`;
          await sendCTAUrlMessage(
            site.phoneNumber,
            notificationText,
            'Open Website',
            previewLink
          );
          console.log('[Pay Confirm] Immediate free subdomain activation notification sent.');
        }
      }
    } catch (msgErr) {
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

// ────────────────────────────────────────────────────────
// PREMIUM WEBSITE TEMPLATE ENGINE (DYNAMIC LOADER)
// ────────────────────────────────────────────────────────

function renderPremiumWebsite(site: SiteConfig, templateId?: string): string {
  const templatesDir = path.join(__dirname, '../../templates');
  let finalId = templateId || 'GA001';

  let dirPath = path.join(templatesDir, finalId);
  if (!fs.existsSync(dirPath) || !fs.existsSync(path.join(dirPath, 'index.html'))) {
    console.warn(`[Template Engine] Template ${finalId} not found, falling back...`);
    const folders = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());
    if (folders.length > 0) {
      finalId = folders[0];
      dirPath = path.join(templatesDir, finalId);
    } else {
      return `<html><body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen font-sans">
        <div class="text-center">
          <h1 class="text-2xl font-bold">No templates found</h1>
          <p class="text-zinc-500 mt-2">Please upload a valid website template zip file.</p>
        </div>
      </body></html>`;
    }
  }

  const htmlPath = path.join(dirPath, 'index.html');
  const cssPath = path.join(dirPath, 'style.css');
  const jsPath = path.join(dirPath, 'script.js');

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Inline CSS
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    html = html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
  }

  // Inline JS
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf8');
    html = html.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
  }

  const servicesGridHtml = renderServicesGrid(site.services || [], site.category || 'Local Shop', site.phoneNumber || '', site);
  const testimonialsHtml = renderTestimonialsSlider(site.testimonials || [], site);
  const logoPrompt = `minimalist professional logo icon for ${site.businessName} ${site.category || ''} business, clean vector style, transparent background, no text, single icon`;
  const logoHtml = `<img src="https://image.pollinations.ai/prompt/${encodeURIComponent(logoPrompt)}?width=512&height=512&nologo=true" class="w-10 h-10 rounded-full object-cover" alt="${site.businessName} Logo">`;
  const cleanPhone = (site.phoneNumber || '').replace(/\D/g, '');

  const imageBase = getCategoryImages(site.category || '');

  // Perform substitutions
  const replacements: Record<string, string> = {
    '{{business_name}}': site.businessName,
    '{{category}}': site.category || 'Professional Services',
    '{{about}}': site.aboutText || site.heroSubtitle || 'A premium local business.',
    '{{logo}}': logoHtml,
    '{{hero_title}}': site.heroTitle || `Premium ${site.category || 'Service'} Options`,
    '{{hero_subtitle}}': site.heroSubtitle || `We deliver top-tier ${site.category || 'solutions'} tailored for homes and commercial spaces.`,
    '{{hero_image}}': site.heroImage || imageBase.hero || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80',
    '{{about_title}}': site.storyTitle || 'About Our Company',
    '{{about_content}}': formatParagraphs(site.storyContent || 'We operate at the intersection of traditional craftsmanship and modern technology, ensuring absolute perfection.'),
    '{{about_image}}': site.aboutImage || imageBase.about || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80',
    '{{phone}}': site.phoneNumber || '',
    '{{phone_clean}}': cleanPhone,
    '{{email}}': site.contactDetails?.email || 'contact@mybusiness.com',
    '{{address}}': site.contactDetails?.address || 'Available locally & online',
    '{{services_grid}}': servicesGridHtml,
    '{{testimonials_slider}}': testimonialsHtml,
    '{{feature_1_title}}': site.features?.[0]?.title || 'Consultation',
    '{{feature_1_desc}}': site.features?.[0]?.description || 'We assess your needs and provide a transparent custom estimate.',
    '{{feature_2_title}}': site.features?.[1]?.title || 'Execution',
    '{{feature_2_desc}}': site.features?.[1]?.description || 'Our certified crew executes the project utilizing high quality tools.',
    '{{feature_3_title}}': site.features?.[2]?.title || 'Walkthrough',
    '{{feature_3_desc}}': site.features?.[2]?.description || 'A complete final checklist walkthrough to ensure 100% satisfaction.',
    '{{gallery_img_1}}': site.galleryImages?.[0] || imageBase.products[0] || imageBase.hero,
    '{{gallery_img_2}}': site.galleryImages?.[1] || imageBase.products[1] || imageBase.products[0] || imageBase.hero,
    '{{gallery_img_3}}': site.galleryImages?.[2] || imageBase.products[2] || imageBase.products[0] || imageBase.hero,
    '{{gallery_img_4}}': site.galleryImages?.[3] || imageBase.products[3] || imageBase.products[0] || imageBase.hero,
    '{{gallery_label_1}}': site.services?.[0]?.name || site.category || 'Our Work',
    '{{gallery_label_2}}': site.services?.[1]?.name || site.category || 'Quality Service',
    '{{gallery_label_3}}': site.services?.[2]?.name || site.category || 'Premium Results',
    '{{gallery_label_4}}': site.services?.[3]?.name || site.category || 'Expert Craft'
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  return html;
}

export function getDefaultCategoryIcons(category: string): string[] {
  const cat = category.toLowerCase();
  if (cat.includes('bakery') || cat.includes('cake') || cat.includes('sweet') || cat.includes('pastry') || cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe')) {
    return ['utensils', 'coffee', 'cake', 'cookie', 'glass-water', 'shopping-bag'];
  }
  if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa') || cat.includes('makeup') || cat.includes('hair')) {
    return ['sparkles', 'scissors', 'gem', 'flower', 'heart', 'smile'];
  }
  if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('yoga') || cat.includes('training')) {
    return ['dumbbell', 'flame', 'trophy', 'target', 'heart', 'activity'];
  }
  if (cat.includes('travel') || cat.includes('tour') || cat.includes('holiday') || cat.includes('adventure') || cat.includes('trip') || cat.includes('taxi') || cat.includes('cab')) {
    return ['compass', 'map', 'plane', 'globe', 'luggage', 'camera'];
  }
  if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental') || cat.includes('health') || cat.includes('medical')) {
    return ['stethoscope', 'activity', 'heart', 'shield', 'award', 'sparkles'];
  }
  if (cat.includes('tech') || cat.includes('software') || cat.includes('it') || cat.includes('digital') || cat.includes('web') || cat.includes('app') || cat.includes('development') || cat.includes('coding') || cat.includes('programmer')) {
    return ['code', 'laptop', 'smartphone', 'database', 'cpu', 'terminal'];
  }
  return ['zap', 'shield', 'sparkles', 'star', 'award', 'activity'];
}

function renderServicesGrid(services: Array<{ name: string; description: string; price?: string; image?: string; icon?: string }>, category: string, phone: string, site: SiteConfig): string {
  if (site && site.template === 'GA003') {
    const defaultIcons = getDefaultCategoryIcons(category);
    let gridItems = '';
    services.forEach((s, idx) => {
      if (idx >= 5) return; // grid-cols-5 row limit
      const icon = s.icon || defaultIcons[idx % defaultIcons.length];
      const delay = idx * 100;
      
      const isHighlighted = (idx === 2); // 3rd card Web Development is dark highlighted in reference image
      
      if (isHighlighted) {
        gridItems += `
          <div class="reveal card-lift bg-slate-950 text-white border border-slate-900 rounded-[2rem] p-8 flex flex-col justify-between h-full shadow-lg" style="transition-delay: ${delay}ms;">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-6">
                <i data-lucide="${icon}" class="w-6 h-6 text-blue-400"></i>
              </div>
              <h3 class="font-display font-semibold text-xl text-white mb-3">${s.name}</h3>
              <p class="text-slate-400 text-sm leading-relaxed">${s.description}</p>
            </div>
            <div class="flex justify-between items-center mt-8 pt-4 border-t border-slate-900">
              <span class="text-blue-400 font-bold text-sm">${s.price || 'Contact Us'}</span>
              <a href="https://wa.me/${phone.replace(/\D/g, '')}?text=Hi! I am interested in ${encodeURIComponent(s.name)}" target="_blank" class="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-all flex items-center gap-1">Read More <i data-lucide="arrow-right" class="w-3 h-3"></i></a>
            </div>
          </div>
        `;
      } else {
        gridItems += `
          <div class="reveal card-lift bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between h-full" style="transition-delay: ${delay}ms;">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <i data-lucide="${icon}" class="w-6 h-6 text-blue-600"></i>
              </div>
              <h3 class="font-display font-semibold text-xl text-slate-900 mb-3">${s.name}</h3>
              <p class="text-slate-500 text-sm leading-relaxed">${s.description}</p>
            </div>
            <div class="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
              <span class="text-blue-600 font-bold text-sm">${s.price || 'Contact Us'}</span>
              <a href="https://wa.me/${phone.replace(/\D/g, '')}?text=Hi! I am interested in ${encodeURIComponent(s.name)}" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-all flex items-center gap-1">Read More <i data-lucide="arrow-right" class="w-3 h-3"></i></a>
            </div>
          </div>
        `;
      }
    });
    return gridItems;
  }

  if (services.length === 0) return '';

  const defaultIcons = getDefaultCategoryIcons(category);
  let gridItems = '';
  services.forEach((s, idx) => {
    if (idx >= 6) return;
    
    // Sanitize service name to avoid commas/slashes that break the AI endpoint
    const cleanName = s.name.replace(/[/,]/g, '').replace(/\s+/g, ' ').trim();
    let cardImg = s.image;
    if (!cardImg) {
      cardImg = `https://image.pollinations.ai/prompt/premium%20hd%20photography%20of%20${encodeURIComponent(cleanName)}%20for%20${encodeURIComponent(category)}%20business?width=1200&height=800&nologo=true`;
      if (idx === 1) {
        cardImg = 'https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?w=1200&q=80&auto=format&fit=crop';
      }
    }
    const icon = s.icon || defaultIcons[idx % defaultIcons.length];
    const delay = idx * 100;

    if (idx === 0) {
      // Featured card — larger span
      gridItems += `
        <div class="md:col-span-2 md:row-span-2 group relative rounded-3xl overflow-hidden glass border border-white/5 transition-transform duration-500 hover:-translate-y-2 cursor-pointer" data-aos="zoom-in" data-aos-delay="${delay}">
            <img src="${cardImg}" alt="${s.name}" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" onerror="this.onerror=null;this.src='https://via.placeholder.com/1200x800?text=No+Image';">
            <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent"></div>
            <div class="absolute inset-0 p-8 flex flex-col justify-end">
                <div class="bg-gold-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-gold-500 mb-6 backdrop-blur-md">
                    <i data-lucide="${icon}" class="w-7 h-7"></i>
                </div>
                <h4 class="text-3xl font-bold text-white mb-3">${s.name}</h4>
                <p class="text-gray-300 max-w-md">${s.description}</p>
                <div class="flex justify-between items-center mt-6">
                    <span class="text-gold-500 font-extrabold text-xl">${s.price || 'Contact Us'}</span>
                    <a href="https://wa.me/${phone.replace(/\D/g, '')}?text=Hi! I am interested in ${encodeURIComponent(s.name)}" target="_blank" class="px-6 py-2 rounded-full bg-gold-500 text-dark-900 font-bold hover:scale-105 transition-all text-sm">Enquire</a>
                </div>
            </div>
        </div>
      `;
    } else {
      // All other cards — same background image treatment
      gridItems += `
        <div class="group relative rounded-3xl overflow-hidden glass border border-white/5 transition-transform duration-500 hover:-translate-y-2 cursor-pointer" data-aos="zoom-in" data-aos-delay="${delay}">
            <img src="${cardImg}" alt="${s.name}" class="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500" onerror="this.onerror=null;this.src='https://via.placeholder.com/1200x800?text=No+Image';">
            <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/70 to-dark-900/30"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end">
                <div class="bg-gold-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-gold-500 mb-4 backdrop-blur-md">
                    <i data-lucide="${icon}" class="w-6 h-6"></i>
                </div>
                <h4 class="text-xl font-bold text-white mb-2">${s.name}</h4>
                <p class="text-gray-300 text-sm mb-4 line-clamp-2">${s.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-gold-500 font-bold text-sm">${s.price || 'Contact Us'}</span>
                    <a href="https://wa.me/${phone.replace(/\D/g, '')}?text=Hi! I am interested in ${encodeURIComponent(s.name)}" target="_blank" class="text-xs border border-white/10 px-3 py-1 rounded-full hover:bg-gold-500 hover:text-dark-900 hover:border-gold-500 transition-all font-semibold">Enquire</a>
                </div>
            </div>
        </div>
      `;
    }
  });

  return `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">\n${gridItems}\n</div>`;
}

function renderTestimonialsSlider(testimonials: SiteTestimonial[], site?: SiteConfig): string {
  if (testimonials.length === 0) return '';

  if (site && site.template === 'GA003') {
    let items = '';
    testimonials.forEach((t) => {
      const initials = (t.name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      items += `
        <div class="reveal bg-white border border-line rounded-2xl p-8 text-left shadow-sm">
          <i data-lucide="quote" class="w-6 h-6 text-indigo mb-5"></i>
          <p class="text-sm leading-relaxed text-ink/90 mb-6">"${t.content}"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo/10 flex items-center justify-center font-display font-semibold text-indigo text-sm">${initials}</div>
            <div>
              <div class="font-display font-semibold text-sm text-ink">${t.name}</div>
              <div class="text-xs text-slate">${t.role || 'Verified Client'}</div>
            </div>
          </div>
        </div>
      `;
    });
    return `<div class="grid md:grid-cols-3 gap-6">\n${items}\n</div>`;
  }

  let items = '';
  testimonials.forEach((t) => {
    const initials = (t.name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    items += `
      <div class="min-w-[100%] md:min-w-[50%] lg:min-w-[33.333%] snap-center">
          <div class="glass p-8 rounded-3xl border border-white/5 h-full flex flex-col">
              <div class="flex gap-1 text-gold-500 mb-6">
                  <i data-lucide="star" class="w-5 h-5 fill-gold-500"></i>
                  <i data-lucide="star" class="w-5 h-5 fill-gold-500"></i>
                  <i data-lucide="star" class="w-5 h-5 fill-gold-500"></i>
                  <i data-lucide="star" class="w-5 h-5 fill-gold-500"></i>
                  <i data-lucide="star" class="w-5 h-5 fill-gold-500"></i>
              </div>
              <p class="text-gray-300 text-lg mb-8 flex-1 italic">"${t.content}"</p>
              <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-white font-bold border border-white/10">${initials}</div>
                  <div>
                      <h5 class="text-white font-bold">${t.name}</h5>
                      <p class="text-sm text-gray-500">${t.role || 'Verified Client'}</p>
                  </div>
              </div>
          </div>
      </div>
    `;
  });

  return `<div class="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-8" id="testimonial-slider">\n${items}\n</div>`;
}

function formatParagraphs(content: string): string {
  return content.split('\n').filter(p => p.trim()).map(p => `<p class="text-gray-400 text-lg leading-relaxed">${p}</p>`).join('\n');
}

export interface CategoryImages {
  hero: string;
  about: string;
  products: string[];
}

export function getCategoryImages(category: string): CategoryImages {
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

function render404Page(): string {
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

function renderSubscriptionPendingPage(site: SiteConfig): string {
  return `<!DOCTYPE html><html><head><title>Subscription Required — ${site.businessName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif}</style></head>
    <body class="bg-zinc-950 flex items-center justify-center min-h-screen px-4">
      <div class="text-center p-10 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg">
        <div class="w-16 h-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-full mx-auto mb-6 text-2xl">⚠</div>
        <h1 class="text-2xl font-bold text-white mb-3">Trial Expired</h1>
        <p class="text-zinc-400 text-sm mb-8">The 30-day free trial for <strong class="text-white">${site.businessName}</strong> has ended. Reactivate your website for just ₹399/month.</p>
        <a href="/pay/subscribe?siteId=${site.id}" class="inline-block bg-white text-zinc-900 font-bold py-4 px-8 rounded-xl hover:bg-zinc-100 transition">
          Reactivate (₹399/mo)
        </a>
      </div>
    </body></html>`;
}

function renderPaymentPage(type: string, siteId: string, domain?: string, paymentId?: string, price?: number): string {
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
  } else if (hasAddon) {
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
