const Joi = require("joi");

/**
 * AI request ko validate karne ke liye Joi schema
 * prompt zaroori hai, string hona chahiye, aur limits ke andar hona chahiye
 */
const aiTestSchema = Joi.object({
  prompt: Joi.string()
    .trim()
    .min(2)
    .max(5000)
    .required()
    .messages({
      "any.required": "Prompt bhejna zaroori hai (required field)",
      "string.empty": "Prompt khali nahi ho sakta",
      "string.base": "Prompt ek string hona chahiye",
      "string.min": "Prompt kam se kam {#limit} characters ka hona chahiye",
      "string.max": "Prompt {#limit} characters se bada nahi ho sakta",
    }),
});

module.exports = {
  aiTestSchema,
};
