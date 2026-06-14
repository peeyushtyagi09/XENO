const express = require("express");
const { handleCopilotChat } = require("../controllers/aiCopilot.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { aiCopilotSchema } = require("../validation/aiCopilot.validation");

const router = express.Router();

/**
 * POST /api/ai/copilot
 * Marketer natural language query mapping route
 * 
 * Middleware chain:
 * 1. validate(aiCopilotSchema) - check validation of 'message' request parameter
 * 2. asyncHandler(handleCopilotChat) - trigger controller logic
 */
router.post(
  "/copilot",
  validate(aiCopilotSchema, "body"),
  asyncHandler(handleCopilotChat)
);

module.exports = router;
