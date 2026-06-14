const Joi = require("joi");

/**
 * POST /api/receipt — Channel Service callback validation
 * Status uppercase me aata hai (DELIVERED, OPENED, CLICKED, FAILED)
 */
const receiptSchema = Joi.object({
  campaignId: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required": "campaignId is required",
      "string.empty": "campaignId is required",
    }),

  customerId: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required": "customerId is required",
      "string.empty": "customerId is required",
    }),

  status: Joi.string()
    .valid("DELIVERED", "OPENED", "CLICKED", "FAILED")
    .required()
    .messages({
      "any.required": "status is required",
      "any.only": "status must be DELIVERED, OPENED, CLICKED, or FAILED",
    }),

  timestamp: Joi.date()
    .iso()
    .default(() => new Date())
    .messages({
      "date.format": "timestamp must be a valid ISO date",
    }),
}).options({ abortEarly: false });

module.exports = {
  receiptSchema,
};
