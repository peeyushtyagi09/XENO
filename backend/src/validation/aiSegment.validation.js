const Joi = require("joi");

/**
 * AI Segment Builder validation schema
 * query parameter: required, non-empty string
 */
const aiSegmentSchema = Joi.object({
  query: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      "any.required": "Query zaroori hai (required field)",
      "string.empty": "Query empty nahi ho sakti",
      "string.base": "Query ek string hona chahiye",
      "string.min": "Query kam se kam {#limit} characters ka hona chahiye",
      "string.max": "Query {#limit} characters se bada nahi ho sakta",
    }),
});

module.exports = {
  aiSegmentSchema,
};
