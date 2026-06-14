const express = require("express");
const { createAISegment } = require("../controllers/aiSegment.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { aiSegmentSchema } = require("../validation/aiSegment.validation");

const router = express.Router();

/**
 * POST /api/ai/create-segment
 * Natural language segmentation prompt accept karke segment create karta hai
 * 
 * Middleware chain:
 * 1. validate(aiSegmentSchema) - Request body me 'query' validate karta hai
 * 2. asyncHandler(createAISegment) - Controller execute karta hai
 */
router.post(
  "/create-segment",
  validate(aiSegmentSchema, "body"),
  asyncHandler(createAISegment)
);

module.exports = router;
