const express = require("express");
const { generateResponse } = require("../controllers/ai.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { aiTestSchema } = require("../validation/ai.validation");

const router = express.Router();

/**
 * POST /api/ai/test
 * Gemini integration test endpoint
 * 
 * Middleware chain:
 * 1. validate(aiTestSchema) — Joi schema validate karta hai (prompt check, type checking, limits)
 * 2. asyncHandler(generateResponse) — Controller ko call karta hai, errors globally handle karta hai
 */
router.post(
  "/test",
  validate(aiTestSchema, "body"),
  asyncHandler(generateResponse)
);

module.exports = router;
