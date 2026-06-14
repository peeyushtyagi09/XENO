const geminiService = require("../services/gemini.service");
const ApiError = require("../utils/ApiError");

/**
 * POST /api/ai/test
 * AI Response generate karne ke liye controller handler
 * 
 * Controller ka kaam:
 * 1. Request body se validate kiya hua prompt extract karna
 * 2. Service layer (geminiService) ko processing delegate karna
 * 3. Ek standard structured JSON return karna
 */
const generateResponse = async (req, res) => {
  const { prompt } = req.body;

  // Input checking (waise validation middleware isse pehle catch kar lega)
  if (!prompt || typeof prompt !== "string") {
    throw new ApiError(400, "Sahi prompt string bhejna zaroori hai");
  }

  // Hinglish comment: Gemini service ko call karke response generate kar rahe hain
  const responseText = await geminiService.generateAIResponse(prompt);

  // Hinglish comment: Client ko response format me return kar rahe hain
  res.status(200).json({
    success: true,
    response: responseText,
  });
};

module.exports = {
  generateResponse,
};
