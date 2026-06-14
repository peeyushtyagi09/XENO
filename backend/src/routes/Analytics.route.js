const express = require("express");
const { getCampaignStats } = require("../controllers/Analytics.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { campaignIdParamSchema } = require("../validation/Campaign.validation");

const router = express.Router();

/**
 * GET /:id/stats — campaign analytics
 * Campaign.route.js me /:id se PEHLE mount karna zaroori hai (route conflict avoid)
 */
router.get(
  "/:id/stats",
  validate(campaignIdParamSchema, "params"),
  asyncHandler(getCampaignStats)
);

module.exports = router;
