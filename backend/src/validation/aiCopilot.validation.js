const Joi = require("joi");

/**
 * AI Copilot validation schema
 * message parameter: required, non-empty string
 */
const aiCopilotSchema = Joi.object({
  message: Joi.string()
    .trim()
    .min(2)
    .max(1000)
    .required()
    .messages({
      "any.required": "Message field zaroori hai (required field)",
      "string.empty": "Message empty nahi ho sakta",
      "string.base": "Message ek string hona chahiye",
      "string.min": "Message kam se kam {#limit} characters ka hona chahiye",
      "string.max": "Message {#limit} characters se bada nahi ho sakta",
    }),
});

module.exports = {
  aiCopilotSchema,
};
