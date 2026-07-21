require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const prompt = 'Respond with a simple JSON object containing {"hello": "world"}';
    const result = await model.generateContent(prompt);
    console.log(`  => SUCCESS:`, result.response.text().trim());
    return true;
  } catch (err) {
    console.warn(`  => FAILED:`, err.message);
    return false;
  }
}

async function main() {
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp'
  ];
  for (const m of models) {
    await testModel(m);
  }
}

main().catch(console.error);
