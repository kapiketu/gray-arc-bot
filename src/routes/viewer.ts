import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db, SiteConfig } from '../services/db';
import { processPaymentWebhook } from '../services/billing';

export default async function viewerRoutes(fastify: FastifyInstance) {
  
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

    return reply.type('text/html').send(renderPremiumWebsite(site));
  });

  // 2. Mock Razorpay Domain Payment Page
  fastify.get('/pay/domain', async (request: FastifyRequest, reply: FastifyReply) => {
    const { siteId, domain, paymentId } = request.query as { siteId: string; domain: string; paymentId: string };
    return reply.type('text/html').send(renderPaymentPage('domain', siteId, domain, paymentId));
  });

  // 3. Mock Razorpay Subscription Page
  fastify.get('/pay/subscribe', async (request: FastifyRequest, reply: FastifyReply) => {
    const { siteId, subscriptionId } = request.query as { siteId: string; subscriptionId: string };
    return reply.type('text/html').send(renderPaymentPage('subscription', siteId, undefined, subscriptionId));
  });

  // 4. Handle Mock Confirmation
  fastify.post('/pay/confirm', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    
    if (body.type === 'domain') {
      const site = await db.getSite(body.siteId);
      if (site) {
        site.customDomain = body.domain;
        site.domainStatus = 'paid';
        await db.saveSite(site);
      }
    } else if (body.type === 'subscription') {
      const site = await db.getSite(body.siteId);
      if (site) {
        site.billingStatus = 'active';
        await db.saveSite(site);
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


function renderPremiumWebsite(site: SiteConfig): string {
    const images = getCategoryImages(site.category);
    return `
<!DOCTYPE html><html><head lang="en">
    <meta charset="UTF-8">

    <!--Page Title-->
    <title>${site.businessName} - Premium Website</title>

    <!--Meta Keywords and Description-->
    <meta name="keywords" content="">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

    <!--Favicon-->
    <link rel="shortcut icon" href="http://www.shapingrain.com/downloads/demos/namari/images/favicon.ico" title="Favicon">

    <!-- Main CSS Files -->
    <link rel="stylesheet" href="http://www.shapingrain.com/downloads/demos/namari/css/style.css">

    <!-- Namari Color CSS -->
    <link rel="stylesheet" href="http://www.shapingrain.com/downloads/demos/namari/css/namari-color.css">

    <!--Icon Fonts - Font Awesome Icons-->
    <link rel="stylesheet" href="http://www.shapingrain.com/downloads/demos/namari/css/font-awesome.min.css">

    <!-- Animate CSS-->
    <link href="http://www.shapingrain.com/downloads/demos/namari/css/animate.css" rel="stylesheet" type="text/css">

    <!--Google Webfonts-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800" rel="stylesheet" type="text/css">
</head>
<body>

<!-- Preloader -->
<div id="preloader">
    <div id="status" class="la-ball-triangle-path">
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
<!--End of Preloader-->

<div class="page-border" data-wow-duration="0.7s" data-wow-delay="0.2s">
    <div class="top-border wow fadeInDown animated" style="visibility: visible; animation-name: fadeInDown;"></div>
    <div class="right-border wow fadeInRight animated" style="visibility: visible; animation-name: fadeInRight;"></div>
    <div class="bottom-border wow fadeInUp animated" style="visibility: visible; animation-name: fadeInUp;"></div>
    <div class="left-border wow fadeInLeft animated" style="visibility: visible; animation-name: fadeInLeft;"></div>
</div>

<div id="wrapper">

    <header id="banner" class="scrollto clearfix" data-enllax-ratio=".5">
        <div id="header" class="nav-collapse">
            <div class="row clearfix">
                <div class="col-1">

                    <!--Logo-->
                    <div id="logo">

                        <!--Logo that is shown on the banner-->
                        <h1 style="color:white; font-size: 24px; font-weight: bold; margin: 0;">${site.businessName}</h1>
                        <!--End of Banner Logo-->

                        <!--The Logo that is shown on the sticky Navigation Bar-->
                        <h1 style="color:#333; font-size: 24px; font-weight: bold; margin: 0;">${site.businessName}</h1>
                        <!--End of Navigation Logo-->

                    </div>
                    <!--End of Logo-->

                    <aside>

                        <!--Social Icons in Header-->
                        
                        <!--End of Social Icons in Header-->

                    </aside>

                    <!--Main Navigation-->
                    <nav id="nav-main">
                        <ul>
                            <li>
                                <a href="#banner">Home</a>
                            </li>
                            <li>
                                <a href="#about">About</a>
                            </li>
                            <li>
                                <a href="#gallery">Gallery</a>
                            </li>
                            <li>
                                <a href="#services">Services</a>
                            </li>
                            <li>
                                <a href="#testimonials">Testimonials</a>
                            </li>
                            <li>
                                <a href="#clients">Clients</a>
                            </li>
                            <li>
                                <a href="#pricing">Pricing</a>
                            </li>
                        </ul>
                    </nav>
                    <!--End of Main Navigation-->

                    <div id="nav-trigger"><span></span></div>
                    <nav id="nav-mobile"></nav>

                </div>
            </div>
        </div><!--End of Header-->

        <!--Banner Content-->
        <div id="banner-content" class="row clearfix">

            <div class="col-38">

                <div class="section-heading">${site.heroTitle || site.businessName}</div>

                <!--Call to Action-->
                <a href="https://wa.me/${site.phoneNumber}" class="button">Contact Us on WhatsApp</a>
                <!--End Call to Action-->

            </div>

        </div><!--End of Row-->
    </header>

    <!--Main Content Area-->
    <main id="content">

        <!--Introduction-->
        <section id="about" class="introduction scrollto">

            <div class="row clearfix">

                <div class="col-3">
                    <div class="section-heading">${site.storyTitle || "Our Story"}</div>

                </div>

                <div class="col-2-3">
    <h2 class="section-heading" data-wow-delay="0.1s">${site.storyTitle || "Our Story"}</h2>
    <p>${site.storyContent || site.aboutText}</p>
    <a href="https://wa.me/${site.phoneNumber}" class="button" data-wow-delay="0.2s">Get in touch</a>
</div>

            </div>


        </section>
<section id="services" class="scrollto clearfix">
    <div class="row clearfix">
        <div class="col-3">
            <div class="section-heading">
                <h3>SERVICES</h3>
                <h2 class="section-title">What We Offer</h2>
            </div>
        </div>
        <div class="col-2-3">
            ${site.services.map((item, i) => `
            <div class="col-2 icon-block icon-top wow fadeInUp" data-wow-delay="${0.1 * i}s">
                <div class="icon-block-description">
                    <img src="${images.products[i % images.products.length]}" style="width: 100%; border-radius: 4px; margin-bottom: 15px;">
                    <h4>${item.name}</h4>
                    <p style="color: #3b82f6; font-weight: bold; margin-top: 5px;">${item.price}</p>
                    <p>${item.description}</p>
                    <a href="https://wa.me/${site.phoneNumber}?text=${encodeURIComponent('Hi! I am interested in ' + item.name)}" class="button" style="margin-top: 15px; padding: 8px 15px;">Order Now</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>

        <!--End of Introduction-->


        <!--Gallery-->
        
        <!--End of Gallery-->


        <!--Content Section-->
        <div id="services" class="scrollto clearfix">

            <div class="row no-padding-bottom clearfix">


                <!--Content Left Side-->
                <div class="col-3">
                    <!--User Testimonial-->
                    <blockquote class="testimonial text-right bigtest">
                        <q>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore
                            et dolore magna aliqua</q>
                        <footer>— John Doe, Happy Customer</footer>
                    </blockquote>
                    <!-- End of Testimonial-->

                </div>
                <!--End Content Left Side-->

                <!--Content of the Right Side-->
                <div class="col-3">
                    <div class="section-heading">
                        <h3>BELIEVING</h3>
                        <h2 class="section-title">Focusing On What Matters Most</h2>
                        <p class="section-subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam!</p>
                    </div>
                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
                        dicta sunt explicabo.
                    </p>
                    <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                        consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet!
                    </p>
                    <!-- Just replace the Video ID "UYJ5IjBRlW8" with the ID of your video on YouTube (Found within the URL) -->
                    <a href="#" data-videoid="UYJ5IjBRlW8" data-videosite="youtube" class="button video link-lightbox">
                        WATCH VIDEO <i class="fa fa-play" aria-hidden="true"></i>
                    </a>
                </div>
                <!--End Content Right Side-->

                <div class="col-3">
                    <img src="http://www.shapingrain.com/downloads/demos/namari/images/dancer.jpg" alt="Dancer">
                </div>

            </div>


        </div>
        <!--End of Content Section-->

        <!--Testimonials-->
        
        <!--End of Testimonials-->

        <!--Clients-->
        
        <!--End of Clients-->

        <!--Pricing Tables-->
        
        <!--End of Pricing Tables-->

    </main>
    <!--End Main Content Area-->


    <!--Footer-->
    <footer id="landing-footer" class="clearfix">
    <div class="row clearfix text-center">
        <h2 style="color: white; margin-bottom: 20px;">Get In Touch</h2>
        <p style="color: #ccc; margin-bottom: 30px;">Ready to start? Send us a message directly on WhatsApp.</p>
        <a href="https://wa.me/${site.phoneNumber}" class="button">Chat with us</a>
        <p style="margin-top: 50px; font-size: 12px; color: #666;">Powered by The Gray Arc</p>
    </div>
</footer>
    <!--End of Footer-->

</div>

<!-- Include JavaScript resources -->
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.1.8.3.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/wow.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/featherlight.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/featherlight.gallery.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.enllax.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.scrollUp.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.easing.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.stickyNavbar.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.waypoints.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/images-loaded.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/lightbox.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/site.js"></script>


<script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'a12d367798259c5d',t:'MTc4MjY1NTE3NA=='};var a=document.createElement('script');a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script>
</body></html>
    `;
}


interface CategoryImages {
  hero: string;
  about: string;
  products: string[];
}

function getCategoryImages(category: string): CategoryImages {
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
        <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-full mx-auto mb-6 text-2xl">⚠</div>
        <h1 class="text-2xl font-bold text-white mb-3">Trial Expired</h1>
        <p class="text-zinc-400 text-sm mb-8">The 30-day free trial for <strong class="text-white">${site.businessName}</strong> has ended. Reactivate your website for just ₹399/month.</p>
        <a href="/pay/subscribe?siteId=${site.id}" class="inline-block bg-white text-zinc-900 font-bold py-4 px-8 rounded-xl hover:bg-zinc-100 transition">
          Reactivate (₹399/mo)
        </a>
      </div>
    </body></html>`;
}

function renderPaymentPage(type: string, siteId: string, domain?: string, paymentId?: string): string {
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
