const Joi = require("joi");

const VALID_CHANNELS = ["WhatsApp", "SMS", "Email", "RCS"];
const VALID_STATUSES = ["Draft", "Scheduled", "Running", "Completed"];

/**
 * POST /api/campaigns — create validation
 * audienceCount backend compute karta hai — client se accept nahi karte
 */
const campaignCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "any.required": "Campaign name is required",
      "string.min": "Campaign name must be at least 2 characters",
      "string.max": "Campaign name cannot exceed 100 characters",
      "string.empty": "Campaign name is required",
    }),

  segmentId: Joi.string()
    .length(24)
    .required()
    .messages({
      "any.required": "Segment ID is required",
      "string.length": "Segment ID must be a valid ObjectId",
      "string.empty": "Segment ID is required",
    }),

  channel: Joi.string()
    .valid(...VALID_CHANNELS)
    .required()
    .messages({
      "any.only": `Channel must be one of: ${VALID_CHANNELS.join(", ")}`,
      "any.required": "Channel is required",
      "string.empty": "Channel is required",
    }),

  message: Joi.string()
    .trim()
    .max(2000)
    .required()
    .messages({
      "string.max": "Message cannot exceed 2000 characters",
      "any.required": "Message is required",
      "string.empty": "Message is required",
    }),

  status: Joi.string()
    .valid(...VALID_STATUSES)
    .default("Draft")
    .messages({
      "any.only": `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    }),
}).options({ abortEarly: false });

/**
 * PUT /api/campaigns/:id — spec ke mutabiq sirf yeh fields update ho sakti hain
 */
const campaignUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      "string.min": "Campaign name must be at least 2 characters",
      "string.max": "Campaign name cannot exceed 100 characters",
      "string.empty": "Campaign name cannot be empty",
    }),

  channel: Joi.string()
    .valid(...VALID_CHANNELS)
    .messages({
      "any.only": `Channel must be one of: ${VALID_CHANNELS.join(", ")}`,
      "string.empty": "Channel cannot be empty",
    }),

  message: Joi.string()
    .trim()
    .max(2000)
    .messages({
      "string.max": "Message cannot exceed 2000 characters",
      "string.empty": "Message cannot be empty",
    }),

  status: Joi.string()
    .valid(...VALID_STATUSES)
    .messages({
      "any.only": `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      "string.empty": "Status cannot be empty",
    }),
})
  .min(1)
  .messages({
    "object.min": "Update ke liye kam se kam ek field bhejo",
  })
  .options({ abortEarly: false });

/** GET/PUT/DELETE /api/campaigns/:id — param validation */
const campaignIdParamSchema = Joi.object({
  id: Joi.string()
    .length(24)
    .required()
    .messages({
      "any.required": "Campaign ID is required",
      "string.length": "Campaign ID must be a valid ObjectId",
      "string.empty": "Campaign ID is required",
    }),
});

/** GET /api/campaigns — pagination + status filter */
const campaignListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.min": "Page must be at least 1",
      "number.base": "Page must be a number",
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
      "number.base": "Limit must be a number",
    }),

  status: Joi.string()
    .valid(...VALID_STATUSES)
    .messages({
      "any.only": `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    }),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc")
    .messages({
      "any.only": "sortOrder must be asc or desc",
    }),
}).options({ abortEarly: false });

module.exports = {
  campaignCreateSchema,
  campaignUpdateSchema,
  campaignIdParamSchema,
  campaignListQuerySchema,
};
