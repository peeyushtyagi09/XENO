const express = require("express");
const { generateAICampaign } = require("../controllers/aiCampaign.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { aiCampaignSchema } = require("../validation/aiCampaign.validation");

const router = express.Router();

/**
 * POST /api/ai/generate-campaign
 * Goal input accept karke campaign structured recommendation generate karta hai
 * 
 * Middleware chain:
 * 1. validate(aiCampaignSchema) - Goal input valid hai ya nahi check karta hai (Joi logic)
 * 2. asyncHandler(generateAICampaign) - Controller invoke karta hai aur exception handle karta hai
 */
router.post(
  "/generate-campaign",
  validate(aiCampaignSchema, "body"),
  asyncHandler(generateAICampaign)
);

module.exports = router;
