const fs = require('fs');
const path = require('path');
const { db } = require('../dist/services/db.js');

// Import routing renderer programmatically
// We require it from the compiled dist directory
const viewerModule = require('../dist/routes/viewer.js');
const renderPremiumWebsite = viewerModule.default || viewerModule.renderPremiumWebsite;

const VALID_LUCIDE_ICONS = new Set([
  'utensils', 'coffee', 'cake', 'cookie', 'glass-water', 'shopping-bag',
  'sparkles', 'scissors', 'gem', 'flower', 'heart', 'smile',
  'dumbbell', 'flame', 'trophy', 'target', 'activity',
  'compass', 'map', 'plane', 'globe', 'luggage', 'camera',
  'stethoscope', 'shield', 'award', 'zap', 'star', 'users', 'rocket',
  'briefcase', 'code', 'laptop', 'smartphone', 'database', 'cpu', 'terminal',
  'cloud', 'activity', 'chef-hat', 'smile-plus', 'store', 'phone', 'mail',
  'map-pin', 'clock', 'check-circle-2', 'check', 'arrow-right', 'instagram',
  'facebook', 'twitter', 'youtube', 'linkedin', 'chevron-right', 'chevron-left',
  'quote', 'message-circle', 'chevron-down', 'shield-check'
]);

// ─────────────────────────────────────────────────────────────────────────────
// TEST CASE CONFIGURATIONS (STAGE 16: AI COMPATIBILITY TEST)
// ─────────────────────────────────────────────────────────────────────────────

const testCases = [
  {
    name: "Test Case 1: Sparse Content (Minimal details, 1 service)",
    site: {
      id: "sparse-salon",
      businessName: "Hair",
      category: "Hair Salon",
      phoneNumber: "9876543210",
      aboutText: "Quick haircuts.",
      theme: { primaryColor: "#ec4899", secondaryColor: "#db2777" },
      services: [
        { name: "Haircut", price: "₹200", description: "Trim.", icon: "scissors" }
      ],
      contactDetails: { address: "Jodhpur", hours: "Daily" }
    }
  },
  {
    name: "Test Case 2: Dense Content (Long titles, 8 services, dense blocks)",
    site: {
      id: "dense-agency",
      businessName: "Advanced Global Digital Marketing and SEO Consultation Agency Pvt Ltd",
      category: "Digital Marketing Agency",
      phoneNumber: "9876543210",
      aboutText: "We help brands scale using data-driven advertising networks.",
      theme: { primaryColor: "#2563eb", secondaryColor: "#1d4ed8" },
      services: [
        { name: "Search Engine Optimization Strategy", price: "₹15,000", description: "Audit current traffic, perform detailed keyword analysis, build structured schema blocks, and clean up speed parameters for search visibility.", icon: "search" },
        { name: "Meta Paid Ads Campaign Execution", price: "₹25,000", description: "Design high-converting creatives, copywrite headlines, target precise audience models, and optimize ROAS across platforms.", icon: "instagram" },
        { name: "Enterprise Custom Web Development", price: "₹50,000", description: "Build scalable landing pages using modern frameworks and responsive Tailwind layouts.", icon: "code" },
        { name: "Brand Visual Guidelines Design", price: "₹10,000", description: "Establish consistent brand palettes, typography scales, spacing, and design token assets.", icon: "pen-tool" },
        { name: "Conversion Rate Optimization (CRO)", price: "₹20,000", description: "Audit design flowcharts, CTAs, button layouts, and validation gates to scale sales ratios.", icon: "activity" },
        { name: "Content Strategy & Copywriting", price: "₹12,000", description: "Write layout-optimized feature descriptions, faq details, and story copies matching strict word limits.", icon: "pencil" },
        { name: "Email Marketing Automation Setup", price: "₹18,000", description: "Setup subscriber lists, build automated welcome flows, and optimize newsletter click-through rates.", icon: "mail" },
        { name: "Analytics & Attribution Dashboard", price: "₹15,000", description: "Integrate custom event triggers, heatmaps, and build local business attribution models.", icon: "bar-chart" }
      ],
      features: [
        { title: "Data Driven Optimization", description: "We run deep analytics to maximize conversion, tracking user events and screen flows." },
        { title: "Experienced Engineering Crew", description: "Our certified developers build lightweight and responsive HTML landing pages." },
        { title: "Attribution Guarantee Model", description: "We provide detailed monthly reports highlighting visual analytics and leads." }
      ],
      faqs: [
        { question: "How long does a campaign audit take?", answer: "Audits are completed within 3-5 business days." },
        { question: "What is your support schedule?", answer: "Our specialists are online Monday through Friday from 9 AM to 6 PM." }
      ],
      testimonials: [
        { name: "Siddharth Verma", role: "SaaS Founder", content: "Their SEO audit and custom speed optimization tripled our monthly inbound leads in under 60 days." },
        { name: "Kirti Sen", role: "E-commerce Owner", content: "The paid ads execution scaled our ROAS to 4.2x while cutting lead acquisition costs by 30%." }
      ],
      contactDetails: { address: "4th Floor, Tech Hub Center, Jodhpur", hours: "Monday - Friday: 9:00 AM - 6:00 PM" }
    }
  },
  {
    name: "Test Case 3: Empty Sections (Missing reviews, FAQs, gallery)",
    site: {
      id: "minimalist-gym",
      businessName: "Iron Gym",
      category: "Gym",
      phoneNumber: "9876543210",
      aboutText: "High intensity training space.",
      theme: { primaryColor: "#ef4444", secondaryColor: "#dc2626" },
      services: [
        { name: "Free Weights Access", price: "₹1,500/mo", description: "Access to premium dumbbells and weight lifting platforms.", icon: "dumbbell" }
      ],
      contactDetails: { address: "Jodhpur", hours: "Open 24/7" }
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY AUDITOR
// ─────────────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\n======================================================================");
  console.log("            STAGE 16: AI COMPATIBILITY TEST RUNNER");
  console.log("======================================================================\n");

  let allPassed = true;

  for (const tc of testCases) {
    console.log(`▶ Executing: "${tc.name}"`);
    try {
      // Compile HTML layout for template GA004
      // We call the imported renderer from dist
      const html = viewerModule.renderPremiumWebsite(tc.site, 'GA004');
      
      let tcPassed = true;
      const failures = [];

      // 1. Placeholder Audit: Check for unresolved {{placeholder}} tags
      const placeholderRegex = /\{\{[a-zA-Z0-9_-]+\}\}/g;
      const matches = html.match(placeholderRegex) || [];
      if (matches.length > 0) {
        tcPassed = false;
        failures.push(`Unresolved placeholders remaining: ${Array.from(new Set(matches)).join(', ')}`);
      }

      // 2. SEO Schema Audit: Confirm local business JSON-LD exists
      if (!html.includes('application/ld+json')) {
        tcPassed = false;
        failures.push("Missing Schema.org JSON-LD script block inside HTML <head>.");
      } else {
        // Try parsing JSON-LD script
        try {
          const jsonStart = html.indexOf('<script type="application/ld+json">') + 35;
          const jsonEnd = html.indexOf('</script>', jsonStart);
          const jsonStr = html.substring(jsonStart, jsonEnd).trim();
          JSON.parse(jsonStr);
        } catch (e) {
          tcPassed = false;
          failures.push("Failed to parse Schema.org JSON-LD payload: Invalid JSON.");
        }
      }

      // 3. Lucide Icons Audit: Validate all rendered icon attributes
      const iconRegex = /data-lucide="([^"]+)"/g;
      let iconMatch;
      const invalidIcons = [];
      while ((iconMatch = iconRegex.exec(html)) !== null) {
        const iconName = iconMatch[1];
        if (!VALID_LUCIDE_ICONS.has(iconName)) {
          invalidIcons.push(iconName);
        }
      }
      if (invalidIcons.length > 0) {
        tcPassed = false;
        failures.push(`Invalid Lucide icons rendered: ${Array.from(new Set(invalidIcons)).join(', ')}`);
      }

      // 4. Adaptive Layout Audit:
      if (tc.name.includes("Dense")) {
        // Dense layout (services > 4) MUST automatically use details/accordion variant
        if (!html.includes('<details') || !html.includes('</details>')) {
          tcPassed = false;
          failures.push("Adaptive Layout Rule failed: Services list (> 4 items) did not collapse to Accordion variant.");
        } else {
          console.log("   ✓ Adaptive Layout Rule check: Correctly switched to Accordion variant.");
        }
      } else {
        // Sparse layout (services <= 4) MUST use card grid
        if (html.includes('<details')) {
          tcPassed = false;
          failures.push("Adaptive Layout Rule failed: Sparse services list (<= 4 items) mistakenly used Accordion variant.");
        }
      }

      if (tcPassed) {
        console.log(`   ✅ PASSED\n`);
      } else {
        allPassed = false;
        console.log(`   ❌ FAILED:`);
        failures.forEach(f => console.log(`      - ${f}`));
        console.log('\n');
      }
    } catch (err) {
      allPassed = false;
      console.log(`   💥 CRITICAL CRASH:`);
      console.error(err);
      console.log('\n');
    }
  }

  console.log("======================================================================");
  if (allPassed) {
    console.log("   🎉 ALL COMPATIBILITY TESTS PASSED: TEMPLATE GA004 IS AI-READY!");
    console.log("======================================================================\n");
    process.exit(0);
  } else {
    console.log("   ⚠️ SOME COMPATIBILITY TESTS FAILED. CHECK LAYOUT LOGS.");
    console.log("======================================================================\n");
    process.exit(1);
  }
}

runTests().catch(console.error);
