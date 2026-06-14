const aiCampaignService = require("../services/aiCampaign.service");
const ApiError = require("../utils/ApiError");

/**
 * POST /api/ai/generate-campaign
 * Marketer ke objective se marketing campaign generate karne ka handler
 */
const generateAICampaign = async (req, res) => {
  const { goal } = req.body;

  // input validation (in case validation middleware bypass ho jaye)
  if (!goal || typeof goal !== "string") {
    throw new ApiError(400, "Sahi goal message text bhejna zaroori hai");
  }

  // Hinglish comment: Campaign generation service ko trigger kar rahe hain
  const campaignData = await aiCampaignService.generateCampaign(goal);

  // Success response send kar rahe hain structure ke mutabiq
  res.status(200).json({
    success: true,
    data: campaignData,
  });
};

module.exports = {
  generateAICampaign,
};
