const express = require("express");
const { previewSegment } = require("../controllers/Segment.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { segmentPreviewSchema } = require("../validation/Segment.validation");

const router = express.Router();

/**
 * POST /preview
 * Segment criteria ka live preview — saved segment create nahi hota
 *
 * Middleware chain (order matters):
 * validate → asyncHandler → controller
 * - validate: Joi se body check, invalid input 400 pe reject
 * - asyncHandler: async errors ko global errorHandler tak forward karta hai
 */
router.post(
  "/preview",
  validate(segmentPreviewSchema, "body"),
  asyncHandler(previewSegment)
);

module.exports = router;
