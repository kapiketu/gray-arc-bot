const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../templates/GA003/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Meta / SEO title and desc
html = html.replace(
  '<title>Nexora Systems — Engineering Software That Scales</title>',
  '<title>{{business_name}} | {{category}}</title>'
);

html = html.replace(
  '<meta name="description" content="Nexora Systems designs and ships custom software, cloud infrastructure, and AI systems for companies that can\'t afford downtime. 120+ deployments, zero missed SLAs.">',
  '<meta name="description" content="{{about}}">'
);

html = html.replace(
  '<meta property="og:title" content="Nexora Systems">',
  '<meta property="og:title" content="{{business_name}}">'
);

html = html.replace(
  '<meta property="og:description" content="Nexora Systems designs and ships custom software, cloud infrastructure, and AI systems for companies that can\'t afford downtime. 120+ deployments, zero missed SLAs.">',
  '<meta property="og:description" content="{{about}}">'
);

html = html.replace(
  '<meta name="twitter:title" content="Nexora Systems">',
  '<meta name="twitter:title" content="{{business_name}}">'
);

html = html.replace(
  '<meta name="twitter:description" content="Nexora Systems designs and ships custom software, cloud infrastructure, and AI systems for companies that can\'t afford downtime. 120+ deployments, zero missed SLAs.">',
  '<meta name="twitter:description" content="{{about}}">'
);

// 2. Navigation Logo
const navLogoOld = `<a href="#top" class="flex items-center gap-2.5 group">
        <span class="w-8 h-8 rounded-md bg-indigo flex items-center justify-center">
          <span class="text-white font-display font-bold text-sm">N</span>
        </span>
        <span class="font-display font-semibold text-lg text-white tracking-tight">Nexora<span class="text-fog font-normal"> Systems</span></span>
      </a>`;

const navLogoNew = `<div class="flex items-center gap-2.5 group">{{logo}}</div>`;

html = html.replace(navLogoOld, navLogoNew);

// 3. Hero section content
html = html.replace(
  'Systems live in 14 countries',
  '{{category}}'
);

html = html.replace(
  `<h1 class="reveal font-display font-bold text-[2.75rem] leading-[1.08] lg:text-6xl lg:leading-[1.05] tracking-tight">
          Software built for the day it can't go down.
        </h1>`,
  `<h1 class="reveal font-display font-bold text-[2.75rem] leading-[1.08] lg:text-6xl lg:leading-[1.05] tracking-tight">
          {{hero_title}}
        </h1>`
);

html = html.replace(
  `<p class="reveal mt-6 text-lg text-fog max-w-lg leading-relaxed">
          Nexora Systems designs, builds, and operates custom software, cloud infrastructure, and applied AI for companies that treat reliability as a feature, not an afterthought.
        </p>`,
  `<p class="reveal mt-6 text-lg text-fog max-w-lg leading-relaxed">
          {{hero_subtitle}}
        </p>`
);

// 4. Dashboard panel
html = html.replace(
  'nexora-prod / status',
  '{{business_name}} / status'
);

// 5. Overview Section (About)
html = html.replace(
  'Eleven years of building the software other companies depend on.',
  '{{about_title}}'
);

const aboutParagraphsOld = `<p class="text-slate leading-relaxed text-[15px]">
          Nexora Systems started as a three-person team building internal tools for a logistics operator that couldn't find a vendor who understood their scale. Today we're a full engineering practice — architects, platform engineers, and applied AI researchers — who take on the systems other firms won't touch.
        </p>
        <p class="text-slate leading-relaxed text-[15px] mt-4">
          We work with founders who are scaling fast and enterprises who can't afford a fragile stack. Either way, the standard is the same: build it once, build it right, and stand behind it after launch.
        </p>`;

const aboutParagraphsNew = `<div class="text-slate leading-relaxed text-[15px]">{{about_content}}</div>`;

html = html.replace(aboutParagraphsOld, aboutParagraphsNew);

// About image block replacement
const aboutImgBlockOld = `<div class="reveal relative">
        <div class="aspect-[4/5] rounded-2xl bg-ink relative overflow-hidden">
          <div class="absolute inset-0 blueprint opacity-40"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="grid grid-cols-2 gap-3 p-8 w-full">
              <div class="rounded-xl bg-white/5 border border-white/10 p-5 aspect-square flex flex-col justify-between">
                <i data-lucide="server" class="w-6 h-6 text-indigo"></i>
                <span class="mono text-[10px] text-fog">Infrastructure</span>
              </div>
              <div class="rounded-xl bg-white/5 border border-white/10 p-5 aspect-square flex flex-col justify-between mt-6">
                <i data-lucide="brain-circuit" class="w-6 h-6 text-indigo"></i>
                <span class="mono text-[10px] text-fog">Applied AI</span>
              </div>
              <div class="rounded-xl bg-white/5 border border-white/10 p-5 aspect-square flex flex-col justify-between -mt-6">
                <i data-lucide="code-2" class="w-6 h-6 text-indigo"></i>
                <span class="mono text-[10px] text-fog">Engineering</span>
              </div>
              <div class="rounded-xl bg-white/5 border border-white/10 p-5 aspect-square flex flex-col justify-between">
                <i data-lucide="shield-check" class="w-6 h-6 text-indigo"></i>
                <span class="mono text-[10px] text-fog">Security</span>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-6 -left-6 bg-white rounded-xl border border-line shadow-xl px-6 py-4 hidden sm:block">
          <div class="font-display font-bold text-2xl">2015</div>
          <div class="text-xs text-slate mono">Founded</div>
        </div>
      </div>`;

const aboutImgBlockNew = `<div class="reveal relative">
        <div class="aspect-[4/5] rounded-2xl overflow-hidden relative border border-line shadow-xl">
          <img src="{{about_image}}" class="w-full h-full object-cover" alt="About {{business_name}}">
        </div>
      </div>`;

html = html.replace(aboutImgBlockOld, aboutImgBlockNew);

// 6. Services Grid
const servicesGridOld = `<div class="grid md:grid-cols-6 gap-5">
      <div class="reveal card-lift md:col-span-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 lg:p-10">
        <i data-lucide="code-2" class="w-8 h-8 text-indigo mb-6"></i>
        <h3 class="font-display font-semibold text-xl mb-3">Custom Software Development</h3>
        <p class="text-fog text-sm leading-relaxed max-w-md">Full-stack products built on architecture that's meant to outlive its first version — from internal platforms to customer-facing applications.</p>
      </div>
      <div class="reveal card-lift md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <i data-lucide="cloud" class="w-8 h-8 text-indigo mb-6"></i>
        <h3 class="font-display font-semibold text-lg mb-3">Cloud Infrastructure</h3>
        <p class="text-fog text-sm leading-relaxed">Provisioned, monitored, and scaled without the 3am pages.</p>
      </div>
      <div class="reveal card-lift md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <i data-lucide="brain-circuit" class="w-8 h-8 text-indigo mb-6"></i>
        <h3 class="font-display font-semibold text-lg mb-3">AI Integration</h3>
        <p class="text-fog text-sm leading-relaxed">Applied AI features shipped into real products, not demos.</p>
      </div>
      <div class="reveal card-lift md:col-span-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 lg:p-10">
        <i data-lucide="shield-check" class="w-8 h-8 text-indigo mb-6"></i>
        <h3 class="font-display font-semibold text-xl mb-3">Cybersecurity &amp; Compliance</h3>
        <p class="text-fog text-sm leading-relaxed max-w-md">Security reviews, hardening, and compliance groundwork for teams that get audited and can't afford to guess.</p>
      </div>
      <div class="reveal card-lift md:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <i data-lucide="git-branch" class="w-8 h-8 text-indigo mb-6"></i>
        <h3 class="font-display font-semibold text-lg mb-3">IT Consulting</h3>
        <p class="text-fog text-sm leading-relaxed">Technical due diligence and roadmap planning before you commit budget.</p>
      </div>
      <div class="reveal card-lift md:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <i data-lucide="repeat" class="w-8 h-8 text-indigo mb-6"></i>
        <h3 class="font-display font-semibold text-lg mb-3">Digital Transformation</h3>
        <p class="text-fog text-sm leading-relaxed">Legacy systems migrated without stopping the business that runs on them.</p>
      </div>
    </div>`;

const servicesGridNew = `<div class="grid md:grid-cols-6 gap-5">
      {{services_grid}}
    </div>`;

html = html.replace(servicesGridOld, servicesGridNew);

// 7. Features Grid (replace 4 cards with 3 dynamic cards)
const featuresOld = `<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="clock" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">On-time, by contract</h3>
        <p class="text-sm text-slate leading-relaxed">Fixed milestones with penalty clauses we've never had to pay out.</p>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="headset" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">Direct engineer access</h3>
        <p class="text-sm text-slate leading-relaxed">No account managers relaying messages. You talk to the person building it.</p>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="lock" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">You own the code</h3>
        <p class="text-sm text-slate leading-relaxed">No vendor lock-in. Full source and infrastructure access, always.</p>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="life-buoy" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">Post-launch support</h3>
        <p class="text-sm text-slate leading-relaxed">90 days of embedded support after every release, standard.</p>
      </div>
    </div>`;

const featuresNew = `<div class="grid md:grid-cols-3 gap-6">
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="shield" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">{{feature_1_title}}</h3>
        <p class="text-sm text-slate leading-relaxed">{{feature_1_desc}}</p>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="sparkles" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">{{feature_2_title}}</h3>
        <p class="text-sm text-slate leading-relaxed">{{feature_2_desc}}</p>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl p-7">
        <div class="w-11 h-11 rounded-lg bg-indigo/10 flex items-center justify-center mb-6">
          <i data-lucide="award" class="w-5 h-5 text-indigo"></i>
        </div>
        <h3 class="font-display font-semibold mb-2">{{feature_3_title}}</h3>
        <p class="text-sm text-slate leading-relaxed">{{feature_3_desc}}</p>
      </div>
    </div>`;

html = html.replace(featuresOld, featuresNew);

// 8. Portfolio Gallery
const portfolioOld = `<div class="grid md:grid-cols-3 gap-6">
      <div class="reveal card-lift bg-white border border-line rounded-2xl overflow-hidden">
        <div class="aspect-video bg-ink relative overflow-hidden flex items-center justify-center">
          <div class="absolute inset-0 blueprint opacity-30"></div>
          <i data-lucide="bar-chart-3" class="w-10 h-10 text-indigo relative"></i>
        </div>
        <div class="p-6">
          <span class="mono text-[11px] text-indigo uppercase tracking-wide">Logistics · Platform</span>
          <h3 class="font-display font-semibold text-lg mt-2 mb-2">Fleet Ops Dashboard</h3>
          <p class="text-sm text-slate leading-relaxed">Real-time routing platform processing 40,000 deliveries a day across six countries.</p>
        </div>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl overflow-hidden">
        <div class="aspect-video bg-ink relative overflow-hidden flex items-center justify-center">
          <div class="absolute inset-0 blueprint opacity-30"></div>
          <i data-lucide="credit-card" class="w-10 h-10 text-indigo relative"></i>
        </div>
        <div class="p-6">
          <span class="mono text-[11px] text-indigo uppercase tracking-wide">Fintech · Infrastructure</span>
          <h3 class="font-display font-semibold text-lg mt-2 mb-2">Payments Rail Migration</h3>
          <p class="text-sm text-slate leading-relaxed">Zero-downtime migration of a legacy ledger system to a modern, auditable core.</p>
        </div>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl overflow-hidden">
        <div class="aspect-video bg-ink relative overflow-hidden flex items-center justify-center">
          <div class="absolute inset-0 blueprint opacity-30"></div>
          <i data-lucide="scan-line" class="w-10 h-10 text-indigo relative"></i>
        </div>
        <div class="p-6">
          <span class="mono text-[11px] text-indigo uppercase tracking-wide">Healthcare · Applied AI</span>
          <h3 class="font-display font-semibold text-lg mt-2 mb-2">Clinical Intake Assistant</h3>
          <p class="text-sm text-slate leading-relaxed">An AI intake layer that cut administrative time per patient by 34%.</p>
        </div>
      </div>
    </div>`;

const portfolioNew = `<div class="grid md:grid-cols-3 gap-6">
      <div class="reveal card-lift bg-white border border-line rounded-2xl overflow-hidden">
        <div class="aspect-video relative overflow-hidden">
          <img src="{{gallery_img_1}}" class="w-full h-full object-cover" alt="{{gallery_label_1}}">
        </div>
        <div class="p-6">
          <span class="mono text-[11px] text-indigo uppercase tracking-wide">{{category}}</span>
          <h3 class="font-display font-semibold text-lg mt-2 mb-2">{{gallery_label_1}}</h3>
          <p class="text-sm text-slate leading-relaxed">Premium quality solution tailored for our clients.</p>
        </div>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl overflow-hidden">
        <div class="aspect-video relative overflow-hidden">
          <img src="{{gallery_img_2}}" class="w-full h-full object-cover" alt="{{gallery_label_2}}">
        </div>
        <div class="p-6">
          <span class="mono text-[11px] text-indigo uppercase tracking-wide">{{category}}</span>
          <h3 class="font-display font-semibold text-lg mt-2 mb-2">{{gallery_label_2}}</h3>
          <p class="text-sm text-slate leading-relaxed">High-performance deployment optimized for efficiency.</p>
        </div>
      </div>
      <div class="reveal card-lift bg-white border border-line rounded-2xl overflow-hidden">
        <div class="aspect-video relative overflow-hidden">
          <img src="{{gallery_img_3}}" class="w-full h-full object-cover" alt="{{gallery_label_3}}">
        </div>
        <div class="p-6">
          <span class="mono text-[11px] text-indigo uppercase tracking-wide">{{category}}</span>
          <h3 class="font-display font-semibold text-lg mt-2 mb-2">{{gallery_label_3}}</h3>
          <p class="text-sm text-slate leading-relaxed">Secure integrations built for seamless scale.</p>
        </div>
      </div>
    </div>`;

html = html.replace(portfolioOld, portfolioNew);

// 9. Testimonials Grid -> slider
const testimonialsOld = `<div class="grid md:grid-cols-3 gap-6">
      <div class="reveal bg-white border border-line rounded-2xl p-8">
        <i data-lucide="quote" class="w-6 h-6 text-indigo mb-5"></i>
        <p class="text-sm leading-relaxed text-ink/90 mb-6">Nexora rebuilt our core platform during our highest-traffic quarter without a single hour of downtime. That alone justified the entire budget.</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo/10 flex items-center justify-center font-display font-semibold text-indigo text-sm">A</div>
          <div>
            <div class="font-display font-semibold text-sm">Aarav Mehta</div>
            <div class="text-xs text-slate">VP Engineering, Retail Group</div>
          </div>
        </div>
      </div>
      <div class="reveal bg-white border border-line rounded-2xl p-8">
        <i data-lucide="quote" class="w-6 h-6 text-indigo mb-5"></i>
        <p class="text-sm leading-relaxed text-ink/90 mb-6">They gave us a technical plan we could actually read and approve, then delivered exactly what was in it. No surprises, no scope creep.</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo/10 flex items-center justify-center font-display font-semibold text-indigo text-sm">S</div>
          <div>
            <div class="font-display font-semibold text-sm">Sarah Lindqvist</div>
            <div class="text-xs text-slate">COO, Fintech Startup</div>
          </div>
        </div>
      </div>
      <div class="reveal bg-white border border-line rounded-2xl p-8">
        <i data-lucide="quote" class="w-6 h-6 text-indigo mb-5"></i>
        <p class="text-sm leading-relaxed text-ink/90 mb-6">Post-launch support was the real difference. Most vendors disappear after go-live. Nexora stayed embedded for three months.</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo/10 flex items-center justify-center font-display font-semibold text-indigo text-sm">D</div>
          <div>
            <div class="font-display font-semibold text-sm">David Okafor</div>
            <div class="text-xs text-slate">Director of IT, Healthcare Network</div>
          </div>
        </div>
      </div>
    </div>`;

const testimonialsNew = `{{testimonials_slider}}`;

html = html.replace(testimonialsOld, testimonialsNew);

// 10. Contact Form
const contactFormOld = `<form id="contactForm" class="reveal max-w-md mx-auto text-left" novalidate>
      <div class="mb-5">
        <label for="fullName" class="block text-xs mono uppercase tracking-wide text-fog mb-2">Name</label>
        <input type="text" id="fullName" name="fullName" placeholder="Your full name"
          class="w-full px-4 py-3.5 rounded-lg bg-white/5 border border-white/15 focus:border-indigo focus:bg-white/10 outline-none transition-colors text-sm">
        <p class="error-text hidden text-xs text-red-400 mt-1.5">Please enter your name.</p>
      </div>
      <div class="mb-6">
        <label for="phone" class="block text-xs mono uppercase tracking-wide text-fog mb-2">Phone Number</label>
        <input type="tel" id="phone" name="phone" placeholder="+91 00000 00000"
          class="w-full px-4 py-3.5 rounded-lg bg-white/5 border border-white/15 focus:border-indigo focus:bg-white/10 outline-none transition-colors text-sm">
        <p class="error-text hidden text-xs text-red-400 mt-1.5">Please enter a valid phone number.</p>
      </div>
      <button type="submit" class="w-full py-3.5 rounded-lg bg-indigo hover:bg-indigod transition-colors font-semibold text-sm">
        Request a callback
      </button>
      <div id="successMsg" class="hidden mt-5 px-5 py-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
        <i data-lucide="check-circle-2" class="w-5 h-5 shrink-0"></i>
        <span>Thanks — we've received your details and will call you shortly.</span>
      </div>
    </form>`;

const contactFormNew = `<form id="contactForm" class="reveal max-w-md mx-auto text-left" onsubmit="event.preventDefault(); var name=document.getElementById('fullName').value; var phone=document.getElementById('phoneNum').value; window.open('https://wa.me/{{phone_clean}}?text=Hi! My name is '+encodeURIComponent(name)+'. Phone: '+encodeURIComponent(phone)+'. I would like to inquire about your services.','_blank');">
      <div class="mb-5">
        <label for="fullName" class="block text-xs mono uppercase tracking-wide text-fog mb-2">Name</label>
        <input type="text" id="fullName" placeholder="Your full name" required
          class="w-full px-4 py-3.5 rounded-lg bg-white/5 border border-white/15 focus:border-indigo focus:bg-white/10 outline-none transition-colors text-sm">
      </div>
      <div class="mb-6">
        <label for="phoneNum" class="block text-xs mono uppercase tracking-wide text-fog mb-2">Phone Number</label>
        <input type="tel" id="phoneNum" placeholder="+91 00000 00000" required
          class="w-full px-4 py-3.5 rounded-lg bg-white/5 border border-white/15 focus:border-indigo focus:bg-white/10 outline-none transition-colors text-sm">
      </div>
      <button type="submit" class="w-full py-3.5 rounded-lg bg-indigo hover:bg-indigod transition-colors font-semibold text-sm">
        Request a callback
      </button>
    </form>`;

html = html.replace(contactFormOld, contactFormNew);

// 11. Footer details
const footerLogoOld = `<div class="flex items-center gap-2.5 mb-5">
          <span class="w-8 h-8 rounded-md bg-indigo flex items-center justify-center">
            <span class="text-white font-display font-bold text-sm">N</span>
          </span>
          <span class="font-display font-semibold text-lg">Nexora Systems</span>
        </div>`;

const footerLogoNew = `<div class="flex items-center gap-2.5 mb-5">{{logo}}</div>`;

html = html.replace(footerLogoOld, footerLogoNew);

html = html.replace(
  '<p class="text-sm text-fog leading-relaxed max-w-sm">Custom software, cloud infrastructure, and applied AI for companies that can\'t afford downtime.</p>',
  '<p class="text-sm text-fog leading-relaxed max-w-sm">{{about}}</p>'
);

html = html.replace(
  '<li class="flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4"></i> +91 90000 00000</li>',
  '<li class="flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4"></i> {{phone}}</li>'
);

html = html.replace(
  '<li class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> hello@nexorasystems.com</li>',
  '<li class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> {{email}}</li>'
);

html = html.replace(
  '<li class="flex items-start gap-2"><i data-lucide="map-pin" class="w-4 h-4 mt-0.5"></i> <span>Dehradun, Uttarakhand, India</span></li>',
  '<li class="flex items-start gap-2"><i data-lucide="map-pin" class="w-4 h-4 mt-0.5"></i> <span>{{address}}</span></li>'
);

html = html.replace(
  '<p class="text-xs text-fog">© 2026 Nexora Systems. All rights reserved.</p>',
  '<p class="text-xs text-fog">© <span id="year"></span> {{business_name}}. All rights reserved.</p>'
);

// 12. Script updates (remove contactForm submit listener from scripts block since we did it onsubmit)
const scriptSubmitOld = `  // Contact form validation + submission
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('successMsg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const nameError = nameInput.nextElementSibling;
    const phoneError = phoneInput.nextElementSibling;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const phonePattern = /^[+]?[\\d\\s()-]{7,15}$/;

    let valid = true;
    if (name.length < 2) {
      nameError.classList.remove('hidden');
      nameInput.classList.add('border-red-400');
      valid = false;
    } else {
      nameError.classList.add('hidden');
      nameInput.classList.remove('border-red-400');
    }

    if (!phonePattern.test(phone)) {
      phoneError.classList.remove('hidden');
      phoneInput.classList.add('border-red-400');
      valid = false;
    } else {
      phoneError.classList.add('hidden');
      phoneInput.classList.remove('border-red-400');
    }

    if (!valid) return;

    // -----------------------------------------------------------
    // BACKEND HOOK: replace this block with an actual request that
    // emails { name, phone } to the business owner's address
    // (e.g. POST to a serverless function / form endpoint).
    // Only name + phone are ever collected or sent, per spec.
    // -----------------------------------------------------------
    console.log('Submitting lead:', { name, phone });

    form.querySelectorAll('input, button[type="submit"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('label').forEach(el => el.classList.add('hidden'));
    successMsg.classList.remove('hidden');
    lucide.createIcons();
  });`;

html = html.replace(scriptSubmitOld, '');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Tokenization completed successfully!');
