const fs = require('fs');
const path = require('path');
const { compileDynamicLayout } = require('../dist/services/templateEngine.js');

const mockSite = {
  id: 'test-cafe',
  businessName: 'Glow Cafe',
  category: 'Cafe',
  phoneNumber: '9123456789',
  aboutText: 'The best organic coffee in town.',
  theme: {
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    bgColor: '#030712',
    textColor: '#f3f4f6',
    fontFamily: 'Outfit, sans-serif'
  },
  services: [
    { name: 'Cold Brew', price: '₹180', description: 'Slow-steeped organic coffee beans served over clear ice.', icon: 'coffee' },
    { name: 'Avocado Toast', price: '₹220', description: 'Freshly smashed organic avocados on sourdough toast.', icon: 'utensils' }
  ],
  contactDetails: {
    address: '123 Sunshine Boulevard, Jodhpur',
    hours: 'Monday - Saturday: 8:00 AM - 10:00 PM'
  }
};

try {
  console.log('Testing Adaptive Variant Selector...');
  const layouts = compileDynamicLayout(mockSite);
  console.log('Composed layout blocks:');
  console.log(Object.keys(layouts));
  
  if (layouts.hero.includes('Glow Card') || layouts.hero.includes('Visual Image Background')) {
    console.log('SUCCESS: Correctly chose centered glow variant Hero_02 for Cafe!');
  } else {
    console.log('FAILED: Incorrect hero variant selection.');
  }
} catch (err) {
  console.error('Dynamic Compilation Failed!');
  console.error(err);
}
