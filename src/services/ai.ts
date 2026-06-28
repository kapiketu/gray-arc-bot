import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { SiteConfig, SiteProduct } from './db';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper to generate a slug from a business name
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// Fallback Mock AI content generator (if API key is missing)
function getMockWebsiteContent(
  phoneNumber: string,
  businessName: string,
  category: string,
  about: string,
  servicesRaw: string,
  contactRaw: string
): SiteConfig {
  const slug = slugify(businessName) || `site-${Math.floor(Math.random() * 10000)}`;
  
  // Parse services
  const services: SiteProduct[] = [];
  const lines = servicesRaw.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('-');
    const name = parts[0]?.trim() || 'Service / Product';
    const price = parts[1]?.trim() || '₹Contact Us';
    services.push({
      name,
      price,
      description: `Premium quality ${name.toLowerCase()} customized to your needs.`
    });
  }

  if (services.length === 0) {
    services.push({ name: 'Standard Product', price: '₹499', description: 'Our signature offering.' });
  }

  // Determine theme based on category
  let theme = {
    primaryColor: '#3b82f6', // blue
    secondaryColor: '#1d4ed8',
    fontFamily: 'Outfit, sans-serif',
    bgColor: '#ffffff',
    textColor: '#1f2937'
  };

  const catLower = category.toLowerCase();
  if (catLower.includes('bakery') || catLower.includes('cake') || catLower.includes('food')) {
    theme = {
      primaryColor: '#b45309', // amber/warm brown
      secondaryColor: '#78350f',
      fontFamily: 'Playfair Display, serif',
      bgColor: '#fffbeb', // amber 50
      textColor: '#451a03'
    };
  } else if (catLower.includes('salon') || catLower.includes('beauty') || catLower.includes('spa')) {
    theme = {
      primaryColor: '#db2777', // pink/rose
      secondaryColor: '#9d174d',
      fontFamily: 'Inter, sans-serif',
      bgColor: '#fff1f2',
      textColor: '#881337'
    };
  } else if (catLower.includes('gym') || catLower.includes('fitness') || catLower.includes('sports')) {
    theme = {
      primaryColor: '#ef4444', // red
      secondaryColor: '#b91c1c',
      fontFamily: 'Oswald, sans-serif',
      bgColor: '#111827', // dark mode
      textColor: '#f9fafb'
    };
  }

  // Set default contact details
  const contactDetails = {
    phone: phoneNumber,
    email: `info@${slug}.com`,
    address: contactRaw || 'Local Business, India',
    hours: 'Monday - Saturday: 10:00 AM - 8:00 PM'
  };

  // Generate 30 days trial end date
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 30);

  return {
    id: slug,
    phoneNumber,
    businessName,
    category,
    aboutText: about,
    theme,
    services,
    contactDetails,
    billingStatus: 'trial',
    trialEndsAt: trialEnds.toISOString(),
    customDomain: null,
    domainStatus: 'none',
    heroTitle: `Welcome to ${businessName}`,
    heroSubtitle: about ? `${about.substring(0, 100)}...` : `We provide the best ${category} services in town.`,
    storyTitle: 'Our Story',
    storyContent: about || `We are proud to serve our community with premium quality ${category} services.`
  };
}

export async function generateWebsiteConfig(
  phoneNumber: string,
  businessName: string,
  category: string,
  about: string,
  servicesRaw: string,
  contactRaw: string
): Promise<SiteConfig> {
  console.log(`[AI Engine] Generating site config for "${businessName}" (${category})`);

  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI')) {
    console.warn('[AI Engine] Gemini API Key is missing. Using local Mock generator.');
    return getMockWebsiteContent(phoneNumber, businessName, category, about, servicesRaw, contactRaw);
  }

  try {
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Using gemini-1.5-flash for speed and structured outputs
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `
    You are a professional website builder and copywriter. Generate a complete structured website configuration based on the user's inputs.
    
    USER INPUTS:
    - Business Name: ${businessName}
    - Business Category: ${category}
    - Business Description: ${about}
    - Services/Products (raw input): ${servicesRaw}
    - Contact Details / Address (raw input): ${contactRaw}
    
    INSTRUCTIONS:
    1. Select the absolute perfect theme for this business from this exact list: 'midnight_neon', 'luxury_spa', 'warm_amber', 'ocean_breeze', 'corporate_clean'.
    2. Write an attractive, punchy Hero Title and Subtitle.
    3. Generate a compelling "Our Story" paragraph expanding on the user's description.
    4. Parse the raw services input into a clean JSON array of products (with a name, price in Rupees e.g. "₹499" or "₹1,200", and a short description).
    5. Clean the contact details into structured fields: phone, email, address, and reasonable operating hours (if not provided, create sensible defaults).
    
    Output the result EXACTLY matching this JSON structure:
    {
      "theme": {
        "themeName": "selected theme string"
      },
      "services": [
        { "name": "service name", "price": "price with currency", "description": "short description" }
      ],
      "contactDetails": {
        "phone": "phone number",
        "email": "email address",
        "address": "physical address",
        "hours": "business hours"
      },
      "heroTitle": "highly engaging main headline",
      "heroSubtitle": "sub-headline urging action",
      "storyTitle": "engaging subtitle for our story section",
      "storyContent": "expanded story paragraph"
    }
    `;

    const response = await model.generateContent(prompt);
    const resultText = response.response.text();
    const generatedConfig = JSON.parse(resultText);

    // Generate trial end date (30 days from now)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);

    const slug = slugify(businessName) || `site-${Math.floor(Math.random() * 10000)}`;

    return {
      id: slug,
      phoneNumber,
      businessName,
      category,
      aboutText: about,
      theme: generatedConfig.theme,
      services: generatedConfig.services,
      contactDetails: generatedConfig.contactDetails,
      billingStatus: 'trial',
      trialEndsAt: trialEnds.toISOString(),
      customDomain: null,
      domainStatus: 'none',
      heroTitle: generatedConfig.heroTitle,
      heroSubtitle: generatedConfig.heroSubtitle,
      storyTitle: generatedConfig.storyTitle,
      storyContent: generatedConfig.storyContent
    };

  } catch (error: any) {
    console.error('[AI Engine] Error generating config with Gemini:', error.message);
    console.warn('[AI Engine] Falling back to local Mock generator.');
    return getMockWebsiteContent(phoneNumber, businessName, category, about, servicesRaw, contactRaw);
  }
}

// ────────────────────────────────────────────────────────
// AI-POWERED WEBSITE EDITING
// ────────────────────────────────────────────────────────

export interface EditResult {
  success: boolean;
  updatedFields: string[];
  summary: string;
  updatedConfig: Partial<SiteConfig>;
}

export async function modifyWebsiteConfig(
  currentConfig: SiteConfig,
  userRequest: string
): Promise<EditResult> {
  console.log(`[AI Editor] Processing edit request for "${currentConfig.businessName}": "${userRequest}"`);

  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI')) {
    console.warn('[AI Editor] Gemini API Key is missing. Using local Mock editor.');
    return getMockEditResult(currentConfig, userRequest);
  }

  try {
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `
You are a website editor AI. A business owner wants to modify their existing website via a WhatsApp message.

CURRENT WEBSITE CONFIGURATION:
${JSON.stringify({
  businessName: currentConfig.businessName,
  category: currentConfig.category,
  heroTitle: currentConfig.heroTitle,
  heroSubtitle: currentConfig.heroSubtitle,
  storyTitle: currentConfig.storyTitle,
  storyContent: currentConfig.storyContent,
  services: currentConfig.services,
  contactDetails: currentConfig.contactDetails,
  theme: currentConfig.theme
}, null, 2)}

USER'S EDIT REQUEST:
"${userRequest}"

INSTRUCTIONS:
1. Understand what the user wants to change.
2. Return ONLY the fields that need to be updated (do not return unchanged fields).
3. For services array: if they want to add a product, return the full updated services array. If they want to remove one, return the array without that item. If they want to change a price, update just that item.
4. Be intelligent about interpreting the request. For example "change my number" means update contactDetails.phone.

Return a JSON object with this exact structure:
{
  "success": true,
  "updatedFields": ["list of field names that were changed"],
  "summary": "A short, friendly confirmation message describing what was changed",
  "updatedConfig": {
    // Only include fields that changed. Possible fields:
    // "businessName", "heroTitle", "heroSubtitle", "storyTitle", "storyContent",
    // "services" (full array), "contactDetails" (full object), "theme" (full object), "category"
  }
}

If the request is unclear or impossible, return:
{
  "success": false,
  "updatedFields": [],
  "summary": "A friendly message asking the user to clarify what they want to change",
  "updatedConfig": {}
}
`;

    const response = await model.generateContent(prompt);
    const resultText = response.response.text();
    const editResult: EditResult = JSON.parse(resultText);
    
    console.log('[AI Editor] Edit result:', editResult.summary);
    return editResult;

  } catch (error: any) {
    console.error('[AI Editor] Error with Gemini:', error.message);
    return getMockEditResult(currentConfig, userRequest);
  }
}

// Mock editor for when Gemini API is not available
function getMockEditResult(currentConfig: SiteConfig, userRequest: string): EditResult {
  const req = userRequest.toLowerCase();

  // Handle phone number changes
  const phoneMatch = userRequest.match(/(?:phone|number|call|mobile)[:\s]*[\+]?(\d[\d\s-]{7,})/i);
  if (phoneMatch) {
    const newPhone = phoneMatch[1].replace(/[\s-]/g, '');
    return {
      success: true,
      updatedFields: ['contactDetails'],
      summary: `✅ Phone number updated to ${newPhone}`,
      updatedConfig: {
        contactDetails: { ...currentConfig.contactDetails, phone: newPhone }
      }
    };
  }

  // Handle email changes
  const emailMatch = userRequest.match(/(?:email|mail)[:\s]*([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) {
    return {
      success: true,
      updatedFields: ['contactDetails'],
      summary: `✅ Email updated to ${emailMatch[1]}`,
      updatedConfig: {
        contactDetails: { ...currentConfig.contactDetails, email: emailMatch[1] }
      }
    };
  }

  // Handle business name changes
  if (req.includes('change name') || req.includes('rename') || req.includes('business name')) {
    const nameMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
    if (nameMatch) {
      const newName = nameMatch[1].trim();
      return {
        success: true,
        updatedFields: ['businessName', 'heroTitle'],
        summary: `✅ Business name updated to "${newName}"`,
        updatedConfig: {
          businessName: newName,
          heroTitle: `Welcome to ${newName}`
        }
      };
    }
  }

  // Handle heading/title changes
  if (req.includes('heading') || req.includes('title') || req.includes('headline')) {
    const titleMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
    if (titleMatch) {
      return {
        success: true,
        updatedFields: ['heroTitle'],
        summary: `✅ Main heading updated to "${titleMatch[1].trim()}"`,
        updatedConfig: { heroTitle: titleMatch[1].trim() }
      };
    }
  }

  // Handle description/about changes
  if (req.includes('description') || req.includes('about') || req.includes('story')) {
    const descMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
    if (descMatch) {
      return {
        success: true,
        updatedFields: ['storyContent'],
        summary: `✅ About section updated.`,
        updatedConfig: { storyContent: descMatch[1].trim() }
      };
    }
  }

  // Handle address changes
  if (req.includes('address') || req.includes('location') || req.includes('area')) {
    const addrMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
    if (addrMatch) {
      return {
        success: true,
        updatedFields: ['contactDetails'],
        summary: `✅ Address updated.`,
        updatedConfig: {
          contactDetails: { ...currentConfig.contactDetails, address: addrMatch[1].trim() }
        }
      };
    }
  }

  // Handle adding a product
  if (req.includes('add') && (req.includes('product') || req.includes('service') || req.includes('item'))) {
    const productMatch = userRequest.match(/(?:add\s+(?:a\s+)?(?:new\s+)?(?:product|service|item)[:\s]*)?(.+?)\s*[-–]\s*(₹?\d[\d,]*)/i);
    if (productMatch) {
      const newProduct: SiteProduct = {
        name: productMatch[1].trim(),
        price: productMatch[2].includes('₹') ? productMatch[2] : `₹${productMatch[2]}`,
        description: `Premium quality ${productMatch[1].trim().toLowerCase()}.`
      };
      return {
        success: true,
        updatedFields: ['services'],
        summary: `✅ Added "${newProduct.name}" (${newProduct.price}) to your menu.`,
        updatedConfig: {
          services: [...currentConfig.services, newProduct]
        }
      };
    }
  }

  // Handle removing a product
  if (req.includes('remove') || req.includes('delete')) {
    const itemName = userRequest.replace(/(?:remove|delete)\s+/i, '').trim();
    const updatedServices = currentConfig.services.filter(
      s => !s.name.toLowerCase().includes(itemName.toLowerCase())
    );
    if (updatedServices.length < currentConfig.services.length) {
      return {
        success: true,
        updatedFields: ['services'],
        summary: `✅ Removed "${itemName}" from your menu.`,
        updatedConfig: { services: updatedServices }
      };
    }
  }

  // Handle price changes
  if (req.includes('price') || req.includes('cost') || req.includes('charge')) {
    const priceMatch = userRequest.match(/(.+?)\s*(?:price|cost|charge)\s*(?:to|as|:)\s*(₹?\d[\d,]*)/i);
    if (priceMatch) {
      const updatedServices = currentConfig.services.map(s => {
        if (s.name.toLowerCase().includes(priceMatch[1].trim().toLowerCase())) {
          return { ...s, price: priceMatch[2].includes('₹') ? priceMatch[2] : `₹${priceMatch[2]}` };
        }
        return s;
      });
      return {
        success: true,
        updatedFields: ['services'],
        summary: `✅ Price updated for "${priceMatch[1].trim()}" to ${priceMatch[2]}.`,
        updatedConfig: { services: updatedServices }
      };
    }
  }

  // Handle hours changes
  if (req.includes('hours') || req.includes('timing') || req.includes('open') || req.includes('close')) {
    const hoursMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
    if (hoursMatch) {
      return {
        success: true,
        updatedFields: ['contactDetails'],
        summary: `✅ Business hours updated.`,
        updatedConfig: {
          contactDetails: { ...currentConfig.contactDetails, hours: hoursMatch[1].trim() }
        }
      };
    }
  }

  // Fallback: unclear request
  return {
    success: false,
    updatedFields: [],
    summary: `I couldn't understand what you'd like to change. Try something like:\n\n• "Change phone number to 9876543210"\n• "Add product: Vanilla Cake - ₹450"\n• "Remove Croissant"\n• "Change heading to Best Bakery in Town"\n• "Update address to MG Road, Bangalore"`,
    updatedConfig: {}
  };
}

