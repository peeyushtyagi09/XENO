const Joi = require("joi");

/**
 * AI Campaign Generator endpoint validation schema
 * goal key validation: required, string, min/max limits
 */
const aiCampaignSchema = Joi.object({
  goal: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      "any.required": "Goal field zaroori hai (required field)",
      "string.empty": "Goal khali nahi ho sakta",
      "string.base": "Goal ek string hona chahiye",
      "string.min": "Goal kam se kam {#limit} characters ka hona chahiye",
      "string.max": "Goal {#limit} characters se bada nahi ho sakta",
    }),
});

module.exports = {
  aiCampaignSchema,
};
