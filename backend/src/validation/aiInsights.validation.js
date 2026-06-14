const Joi = require("joi");

/**
 * AI Insights endpoint validation schema
 * campaignId validation: required, 24-character hex MongoDB ObjectId
 */
const aiInsightsSchema = Joi.object({
  campaignId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "any.required": "campaignId zaroori hai (required field)",
      "string.empty": "campaignId empty nahi ho sakta",
      "string.length": "campaignId valid 24-char ObjectId hona chahiye",
      "string.hex": "campaignId valid hex string hona chahiye",
    }),
});

module.exports = {
  aiInsightsSchema,
};
