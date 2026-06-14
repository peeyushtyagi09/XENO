const express = require("express");
const { analyzeCampaignPerformance } = require("../controllers/aiInsights.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { aiInsightsSchema } = require("../validation/aiInsights.validation");

const router = express.Router();

/**
 * POST /api/ai/analyze-campaign
 * Campaign analytics ko evaluate karke performance insights generate karta hai
 * 
 * Middleware chain:
 * 1. validate(aiInsightsSchema) - check validation of campaignId format
 * 2. asyncHandler(analyzeCampaignPerformance) - controller invoke and handle global errors
 */
router.post(
  "/analyze-campaign",
  validate(aiInsightsSchema, "body"),
  asyncHandler(analyzeCampaignPerformance)
);

module.exports = router;
