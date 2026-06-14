const analyticsService = require("../services/Analytics.service");

/**
 * GET /api/campaigns/:id/stats
 *
 * Campaign funnel analytics — sent → delivered → opened → clicked → converted
 * MongoDB aggregation se counts, helper se conversion rates
 */
const getCampaignStats = async (req, res) => {
  const stats = await analyticsService.getCampaignStats(req.params.id);

  res.status(200).json({
    success: true,
    data: stats,
  });
};

module.exports = {
  getCampaignStats,
};
