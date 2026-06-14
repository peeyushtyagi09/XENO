const campaignService = require("../services/Campaign.service");

/**
 * POST /api/campaigns
 * Naya campaign create — segment validate + audienceCount auto-compute
 */
const createCampaign = async (req, res) => {
  const campaign = await campaignService.createCampaign(req.body);

  res.status(201).json({
    success: true,
    data: campaign,
  });
};

/**
 * GET /api/campaigns
 * Saare active campaigns — pagination + status filter
 */
const getCampaigns = async (req, res) => {
  const { page, limit, status, sortOrder } = req.query;

  const { campaigns, pagination } = await campaignService.getCampaigns({
    page,
    limit,
    status,
    sortOrder,
  });

  res.status(200).json({
    success: true,
    data: campaigns,
    pagination,
  });
};

/**
 * GET /api/campaigns/:id
 * Single campaign with populated segment
 */
const getCampaignById = async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id);

  res.status(200).json({
    success: true,
    data: campaign,
  });
};

/**
 * PUT /api/campaigns/:id
 * Campaign update — sirf allowed fields (validation middleware ne filter kar diye)
 */
const updateCampaign = async (req, res) => {
  const campaign = await campaignService.updateCampaign(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: campaign,
  });
};

/**
 * DELETE /api/campaigns/:id
 * Soft delete — record DB me rehta hai
 */
const deleteCampaign = async (req, res) => {
  await campaignService.deleteCampaign(req.params.id);

  res.status(200).json({
    success: true,
    message: "Campaign deleted successfully",
  });
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
