const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} = require("../controllers/Campaign.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const {
  campaignCreateSchema,
  campaignUpdateSchema,
  campaignIdParamSchema,
  campaignListQuerySchema,
} = require("../validation/Campaign.validation");
const { getCampaignStats } = require("../controllers/Analytics.controller");

const router = express.Router();

/**
 * Campaign routes — middleware chain: validate → asyncHandler → controller
 * asyncHandler try/catch ki jagah — rejected promises global errorHandler tak jati hain
 */

router.post(
  "/",
  validate(campaignCreateSchema, "body"),
  asyncHandler(createCampaign)
);

router.get(
  "/",
  validate(campaignListQuerySchema, "query"),
  asyncHandler(getCampaigns)
);

// Analytics — /:id se pehle register karo (route conflict avoid)
router.get(
  "/:id/stats",
  validate(campaignIdParamSchema, "params"),
  asyncHandler(getCampaignStats)
);

router.get(
  "/:id",
  validate(campaignIdParamSchema, "params"),
  asyncHandler(getCampaignById)
);

router.put(
  "/:id",
  validate(campaignIdParamSchema, "params"),
  validate(campaignUpdateSchema, "body"),
  asyncHandler(updateCampaign)
);

router.delete(
  "/:id",
  validate(campaignIdParamSchema, "params"),
  asyncHandler(deleteCampaign)
);

module.exports = router;
