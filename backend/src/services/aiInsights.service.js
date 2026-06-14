const Campaign = require("../models/Campaign.model");
const { getCampaignStats } = require("./Analytics.service");
const { genAI } = require("./gemini.service");
const ApiError = require("../utils/ApiError");

/**
 * Campaign performance analytics ko analyze karke AI-generated feedback returns karta hai
 * @param {string} campaignId - database campaign object ID
 * @returns {Promise<object>} - generated strategic feedback and recommendations
 */
const generateCampaignInsights = async (campaignId) => {
  try {
    console.log("[AI INSIGHTS] Request received");

    // Campaign check karo ki exist karta hai aur deleted nahi hai
    const campaign = await Campaign.findOne({ _id: campaignId, isDeleted: false }).lean();
    if (!campaign) {
      console.error("[AI INSIGHTS] Error: Campaign not found");
      throw new ApiError(404, "Campaign nahi mila ya soft-delete ho chuka hai");
    }

    // Campaign analytics fetch kar rahe hain
    const stats = await getCampaignStats(campaignId);
    console.log("[AI INSIGHTS] Analytics fetched");

    if (!stats) {
      console.error("[AI INSIGHTS] Error: Analytics stats missing");
      throw new ApiError(404, "Campaign ke liye stats data fetch nahi kiya ja saka");
    }

    // Bonus: Calculate additional metrics before sending to Gemini
    const sent = stats.sent || 0;
    const delivered = stats.delivered || 0;
    const opened = stats.opened || 0;
    const clicked = stats.clicked || 0;
    const failed = stats.failed || 0;
    const converted = stats.converted || 0;

    const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(2) + "%" : "0%";
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(2) + "%" : "0%";
    const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(2) + "%" : "0%";
    const conversionRate = clicked > 0 ? ((converted / clicked) * 100).toFixed(2) + "%" : "0%";

    console.log("[AI INSIGHTS] Calling Gemini");

    if (!genAI) {
      console.error("[AI INSIGHTS] Error: Gemini client is not initialized");
      throw new ApiError(500, "Gemini client server par correctly load nahi hua.");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Strategy role design
    const prompt = `
You are a senior CRM marketing consultant working at a customer engagement platform.
Your task is to analyze the performance of a marketing campaign and provide strategic insights.

Campaign Configuration:
- Campaign Name: "${campaign.name}"
- Channel Chosen: "${campaign.channel}"
- Message Template Copy: "${campaign.message}"

Campaign Performance Statistics (Raw counts):
- Total Sent attempts: ${sent}
- Successfully Delivered: ${delivered}
- Opened messages: ${opened}
- Clicked links: ${clicked}
- Converted/purchased: ${converted}
- Failed sends: ${failed}

Calculated Conversion Rates:
- Delivery Rate: ${deliveryRate}
- Open Rate: ${openRate}
- Click Rate: ${clickRate}
- Conversion Rate: ${conversionRate}

You MUST analyze the funnel and suggest concrete actions. Provide a structured analysis in JSON. The JSON MUST strictly follow this schema (do not wrap in markdown or write additional explanations):
{
  "summary": "An executive summary explaining overall campaign performance.",
  "strengths": [
    "A list of strength points identified from the rates or copy (e.g., 'Strong delivery rate')"
  ],
  "issues": [
    "A list of issue points/bottlenecks identified (e.g., 'Low open rate', 'Low click-through')"
  ],
  "recommendations": [
    "Actionable recommendations to improve performance in the future (e.g., 'Target active segment', 'Boost discount offer')"
  ],
  "nextCampaignIdea": "A concrete proposal for the next follow-up campaign to launch (e.g., 'Win-back campaign with 15% discount')"
}
`;

    // Gemini ko campaign performance data bhej rahe hain
    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      console.error("[AI INSIGHTS] Error: Empty response from Gemini");
      throw new ApiError(502, "Gemini API response load fail ho gaya.");
    }

    const textResponse = result.response.text();
    console.log("[AI INSIGHTS] Insights generated");

    // AI recommendations parse kar rahe hain
    let insightsData;
    try {
      insightsData = JSON.parse(textResponse);
    } catch (e) {
      console.error("[AI INSIGHTS] Error: Invalid JSON response format:", textResponse);
      throw new ApiError(502, "Gemini dwara generated output valid JSON format me nahi tha.");
    }

    // JSON structure validation check kar rahe hain
    const requiredKeys = ["summary", "strengths", "issues", "recommendations", "nextCampaignIdea"];
    for (const key of requiredKeys) {
      if (key === "strengths" || key === "issues" || key === "recommendations") {
        if (!Array.isArray(insightsData[key])) {
          console.error(`[AI INSIGHTS] Error: Key "${key}" must be an array.`);
          throw new ApiError(502, `Gemini response schema check fail: "${key}" should be an array.`);
        }
      } else {
        if (!insightsData[key] || typeof insightsData[key] !== "string" || insightsData[key].trim() === "") {
          console.error(`[AI INSIGHTS] Error: Key "${key}" is missing or not a string.`);
          throw new ApiError(502, `Gemini response schema check fail: "${key}" missing ya empty string hai.`);
        }
      }
    }

    return {
      summary: insightsData.summary.trim(),
      strengths: insightsData.strengths,
      issues: insightsData.issues,
      recommendations: insightsData.recommendations,
      nextCampaignIdea: insightsData.nextCampaignIdea.trim(),
    };

  } catch (error) {
    console.error(`[AI INSIGHTS] Error: ${error.message}`);
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(502, `Campaign performance analyze karne me failure: ${error.message}`);
  }
};

module.exports = {
  generateCampaignInsights,
};
