const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("./example.env");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const candidates = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-1.5-flash", // checking just in case
];

async function testQuota() {
  for (const modelName of candidates) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'hello' in one word");
      console.log(`✅ Success with ${modelName}:`, result.response.text().trim());
      break; // Stop at the first working model
    } catch (err) {
      console.log(`❌ Failed with ${modelName}:`, err.message);
    }
  }
}

testQuota();
