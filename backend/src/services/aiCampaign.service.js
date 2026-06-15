const { genAI } = require("./gemini.service");
const ApiError = require("../utils/ApiError");

/**
 * Marketer ke natural language goal se marketing campaign content recommend karta hai
 * @param {string} goal - marketer ka objective/goal
 * @returns {Promise<object>} - structured campaign recommendation object
 */
const generateCampaign = async (goal) => {
  // Check karo agar central Gemini client initialized hai ya nahi
  if (!genAI) {
    console.error("[AI CAMPAIGN] Error: Gemini client is not initialized (missing API key)");
    throw new ApiError(500, "Gemini API client ready nahi hai. Server configuration check karein.");
  }

  try {
    console.log("[AI CAMPAIGN] Request received");
    console.log("[AI CAMPAIGN] Calling Gemini");

    // JSON output forced response ke liye configuration set ki hai
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Strategy role and response instruction define kiye hain
    const prompt = `
You are a senior CRM marketing strategist working at a customer engagement platform.
Your task is to recommend a complete marketing campaign based on the marketer's objective/goal.

Marketer's Goal: "${goal}"

You MUST respond with a JSON object containing the exact structure and keys shown below.
Response fields:
- "campaignName": A creative, concise name automatically generated for this campaign (e.g., "Inactive Customer Winback Campaign" or "Summer Sale Launch").
- "audience": The recommended target customer segments/audience (e.g., "Customers inactive for 60+ days" or "High-value users").
- "channel": The suggested channel. Must be one of: "Email", "SMS", "WhatsApp".
- "message": The marketing message copy. Keep it short, engaging, and appropriate for the channel. You can include "{{name}}" placeholder for personalization.
- "reasoning": A professional explanation of why this channel, audience, and copy were chosen.

Output JSON example format:
{
  "campaignName": "...",
  "audience": "...",
  "channel": "...",
  "message": "...",
  "reasoning": "..."
}
`;

    // Gemini ko prompt bhej rahe hain
    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      console.error("[AI CAMPAIGN] Error: Empty response object received");
      throw new ApiError(502, "Gemini API se koi response nahi mila.");
    }

    const textResponse = result.response.text();
    console.log("[AI CAMPAIGN] Campaign generated");

    // Gemini response ko JSON me parse kar rahe hain
    let campaignData;
    try {
      campaignData = JSON.parse(textResponse);
    } catch (e) {
      console.error("[AI CAMPAIGN] Error: Failed to parse Gemini response text as JSON:", textResponse);
      throw new ApiError(502, "Gemini dwara returned text valid JSON nahi tha.");
    }

    // Response structure aur properties validation check kar rahe hain
    const requiredKeys = ["campaignName", "audience", "channel", "message", "reasoning"];
    for (const key of requiredKeys) {
      if (!campaignData[key] || typeof campaignData[key] !== "string" || campaignData[key].trim() === "") {
        console.error(`[AI CAMPAIGN] Error: Required field "${key}" is missing or empty in Gemini output.`);
        throw new ApiError(502, `Gemini response schema validation fail ho gayi. Field "${key}" invalid hai.`);
      }
    }

    // Campaign recommendation return kar rahe hain
    return {
      campaignName: campaignData.campaignName.trim(),
      audience: campaignData.audience.trim(),
      channel: campaignData.channel.trim(),
      message: campaignData.message.trim(),
      reasoning: campaignData.reasoning.trim(),
    };

  } catch (error) {
    console.error(`[AI CAMPAIGN] Error: ${error.message}`);
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(502, `AI Campaign generation me failure: ${error.message}`);
  }
};

module.exports = {
  generateCampaign,
};
