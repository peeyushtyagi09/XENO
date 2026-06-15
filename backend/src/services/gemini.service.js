const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("../../example.env");
const ApiError = require("../utils/ApiError");

// API key check karo
if (!GEMINI_API_KEY) {
  console.warn("⚠️ [AI SERVICE] GEMINI_API_KEY is not defined in environment variables! Gemini requests will fail.");
}

// Client ko initialize karo
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
console.log("genAI", genAI);

/**
 * Prompt ka response generate karne ke liye service function
 * @param {string} prompt - request body se mila hua prompt text
 * @returns {Promise<string>} - Gemini dwara return kiya gaya raw text
 */
const generateAIResponse = async (prompt) => {
  if (!genAI) {
    console.error("[AI SERVICE] Gemini Error: API Key missing or not initialized");
    throw new ApiError(500, "Gemini API key server par configured nahi hai. Please check .env file.");
  }

  try {
    console.log("[AI SERVICE] Gemini Request Started");
    
    // Gemini model select karo — yahan hum standard flash model use kar rahe hain
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Gemini ko prompt bhej rahe hain
    const result = await model.generateContent(prompt);
    
    console.log("[AI SERVICE] Gemini Response Received");

    // Response ko check kar rahe hain agar null ya undefined hai
    if (!result || !result.response) {
      console.error("[AI SERVICE] Gemini Error: Empty response object received");
      throw new ApiError(502, "Gemini API se response nahi mila ya empty response object aya.");
    }

    // Response ko sanitize kar rahe hain aur text extract kar rahe hain
    const text = result.response.text();
    if (!text || text.trim() === "") {
      console.error("[AI SERVICE] Gemini Error: Empty text content in response");
      throw new ApiError(502, "Gemini API se empty response text received.");
    }

    return text.trim();
  } catch (error) {
    console.error(`[AI SERVICE] Gemini Error: ${error.message}`);
    
    // Agar ApiError class ka instance hai to as-is throw karo
    if (error.statusCode) {
      throw error;
    }
    
    // Network failures ya bad API key issues ke liye standard 502 Bad Gateway
    throw new ApiError(502, `Gemini API calling me problem aayi: ${error.message}`);
  }
};

module.exports = {
  generateAIResponse,
  genAI,
};
