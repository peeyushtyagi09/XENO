const Campaign = require("../models/Campaign.model");
const aiSegmentService = require("./aiSegment.service");
const aiCampaignService = require("./aiCampaign.service");
const aiInsightsService = require("./aiInsights.service");
const { genAI } = require("./gemini.service");
const ApiError = require("../utils/ApiError");

/**
 * Marketer ke natural language message ko interpret karke correct CRM task execute karta hai
 * @param {string} message - marketer chat message
 * @returns {Promise<object>} - orchestration result (intent, toolUsed, confidence, result)
 */
const processCopilotMessage = async (message) => {
  if (!genAI) {
    console.error("[AI COPILOT] Error: Gemini client is not initialized");
    throw new ApiError(500, "Gemini client server par configured nahi hai.");
  }

  try {
    console.log("[AI COPILOT] Request received");
    console.log("[AI COPILOT] Detecting intent");

    // JSON response forced configuration set ki hai
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const classificationPrompt = `
You are an AI Marketing Copilot for a CRM platform.
Your job is to understand the marketer's message, classify their intent into one of the allowed intents, compute a confidence score, and extract the parameters needed for that intent.

Allowed intents and their required parameters:
1. "create_segment"
   - Use when the user wants to search, filter, segment, or find a list of customers based on criteria.
   - Example requests: "Find customers who spent more than ₹5000", "Find high-value customers from Delhi", "Segment users with 5+ orders".
   - Parameter: "query" (the description of the segment criteria they want).
2. "create_campaign"
   - Use when the user wants to launch, generate, run, or write a marketing campaign copy or promotion.
   - Example requests: "Bring back inactive customers", "Create a campaign for high-value customers", "Promote a summer sale".
   - Parameter: "goal" (the marketing goal description).
3. "analyze_campaign"
   - Use when the user wants to analyze, review, evaluate, or check performance analytics of an existing campaign.
   - Example requests: "Analyze Winter Sale campaign", "Show me insights for summer promo", "How did the repeat customer push perform?".
   - Parameter: "campaignName" (the name of the campaign they want to analyze).

Your response MUST be a single JSON object with the exact structure (do not wrap in markdown, do not write extra text):
{
  "intent": "create_segment" | "create_campaign" | "analyze_campaign",
  "confidence": 0.0 to 1.0,
  "parameters": {
    "query": "segment criteria description or null",
    "goal": "campaign goal description or null",
    "campaignName": "campaign name to search or null"
  }
}

User Message: "${message}"
`;

    // Gemini se user intent detect kar rahe hain
    const result = await model.generateContent(classificationPrompt);

    if (!result || !result.response) {
      console.error("[AI COPILOT] Error: Empty classification response from Gemini");
      throw new ApiError(502, "Gemini classification se response nahi mila.");
    }

    const textResponse = result.response.text();
    let classification;
    try {
      classification = JSON.parse(textResponse);
    } catch (e) {
      console.error("[AI COPILOT] Error: Invalid classification JSON response");
      throw new ApiError(502, "Gemini se classification response valid JSON format me nahi tha.");
    }

    const { intent, confidence, parameters } = classification;
    console.log(`[AI COPILOT] Intent detected: ${intent} (Confidence: ${confidence})`);

    // Intent selection aur execution routing
    let toolUsed = "";
    let toolResult = null;

    console.log("[AI COPILOT] Executing tool");

    if (intent === "create_segment") {
      toolUsed = "createSegment";
      if (!parameters || !parameters.query) {
        throw new ApiError(400, "Segment criteria ('query') extract nahi ho paayi.");
      }
      // Segment builder trigger kar rahe hain
      toolResult = await aiSegmentService.createSegmentFromQuery(parameters.query);

    } else if (intent === "create_campaign") {
      toolUsed = "generateCampaign";
      if (!parameters || !parameters.goal) {
        throw new ApiError(400, "Campaign goal extract nahi ho paayi.");
      }
      // Campaign generator service trigger kar rahe hain
      toolResult = await aiCampaignService.generateCampaign(parameters.goal);

    } else if (intent === "analyze_campaign") {
      toolUsed = "analyzeCampaign";
      if (!parameters || !parameters.campaignName) {
        throw new ApiError(400, "Analyze karne ke liye campaignName parameters nahi mil paye.");
      }

      // MongoDB check: Campaign name case-insensitively query karke resolved targetId fetch kar rahe hain
      const campaign = await Campaign.findOne({
        name: { $regex: new RegExp(parameters.campaignName.trim(), "i") },
        isDeleted: false
      }).sort({ createdAt: -1 }).lean();

      if (!campaign) {
        console.error(`[AI COPILOT] Error: Campaign with name "${parameters.campaignName}" not found`);
        throw new ApiError(404, `Campaign "${parameters.campaignName}" database me nahi mila.`);
      }

      // Campaign analytics insights generator run kar rahe hain
      toolResult = await aiInsightsService.generateCampaignInsights(campaign._id.toString());

    } else {
      console.error(`[AI COPILOT] Error: Invalid intent "${intent}"`);
      throw new ApiError(400, `Gemini dwara detected intent "${intent}" invalid/unsupported hai.`);
    }

    console.log("[AI COPILOT] Response generated");

    return {
      intent,
      confidence: confidence || 1.0,
      toolUsed,
      result: toolResult,
    };

  } catch (error) {
    console.error(`[AI COPILOT] Error: ${error.message}`);
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(502, `Copilot message execution me problem aayi: ${error.message}`);
  }
};

module.exports = {
  processCopilotMessage,
};
