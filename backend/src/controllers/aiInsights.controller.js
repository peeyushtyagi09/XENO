const aiInsightsService = require("../services/aiInsights.service");
const ApiError = require("../utils/ApiError");

/**
 * POST /api/ai/analyze-campaign
 * CampaignId accept karke campaign key analytics analyze karne ka controller
 */
const analyzeCampaignPerformance = async (req, res) => {
  const { campaignId } = req.body;

  // input validation (fallback check)
  if (!campaignId) {
    throw new ApiError(400, "campaignId path/body parameters me hona zaroori hai");
  }

  // Hinglish comment: Campaign analytics fetch aur analyze karne ke liye service call kar rahe hain
  const insights = await aiInsightsService.generateCampaignInsights(campaignId);

  // Success response send kar rahe hain
  res.status(200).json({
    success: true,
    data: insights,
  });
};

module.exports = {
  analyzeCampaignPerformance,
};
