const Joi = require('joi');

/**
 * Campaign Create Validation Schema
 * Naya campaign banane ke liye yeh schema ka use karo. Sare fields aur constraints @Campaign.model.js ke hisaab se hain.
 */
const campaignCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Campaign name is required',
      'string.min': 'Campaign name must be at least 2 characters',
      'string.max': 'Campaign name cannot exceed 100 characters',
      'string.empty': 'Campaign name is required',
    }),

  segmentId: Joi.string()
    .length(24) // MongoDB ObjectId
    .required()
    .messages({
      'any.required': 'Segment ID is required',
      'string.length': 'Segment ID must be a valid ObjectId',
      'string.empty': 'Segment ID is required',
    }),

  channel: Joi.string()
    .valid('email', 'sms', 'push', 'whatsapp', 'other')
    .required()
    .messages({
      'any.only': 'Channel must be one of: email, sms, push, whatsapp, other',
      'any.required': 'Channel is required',
      'string.empty': 'Channel is required',
    }),

  message: Joi.string()
    .trim()
    .max(2000)
    .required()
    .messages({
      'string.max': 'Message cannot exceed 2000 characters',
      'any.required': 'Message is required',
      'string.empty': 'Message is required',
    }),

  status: Joi.string()
    .valid('draft', 'scheduled', 'sent', 'failed', 'paused', 'archived')
    .default('draft')
    .messages({
      'any.only': 'Status must be one of: draft, scheduled, sent, failed, paused, archived',
    }),

  scheduledAt: Joi.date()
    .allow(null)
    // Niche waala custom check scheduled samay ko sirf abhi ya future ke liye allow karta hai
    .custom((value, helpers) => {
      if (value === null) return value;
      if (value < new Date()) {
        return helpers.error('date.future');
      }
      return value;
    })
    .messages({
      'date.base': 'Scheduled time must be a valid date',
      'date.future': 'Scheduled time must be now or a future date',
    }),

  createdBy: Joi.string()
    .length(24)
    .allow(null)
    .messages({
      'string.length': 'createdBy must be a valid User ObjectId',
    }),

  // Meta backend manage karta hai, user se na lo
})
.options({ abortEarly: false });

/**
 * Campaign Update Validation Schema
 * Update ke liye kam se kam ek field required hai. Sare rules create jaise hi hain, par required nahi hain.
 */
const campaignUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Campaign name must be at least 2 characters',
      'string.max': 'Campaign name cannot exceed 100 characters',
      'string.empty': 'Campaign name cannot be empty',
    }),

  segmentId: Joi.string()
    .length(24)
    .messages({
      'string.length': 'Segment ID must be a valid ObjectId',
      'string.empty': 'Segment ID cannot be empty',
    }),

  channel: Joi.string()
    .valid('email', 'sms', 'push', 'whatsapp', 'other')
    .messages({
      'any.only': 'Channel must be one of: email, sms, push, whatsapp, other',
      'string.empty': 'Channel cannot be empty',
    }),

  message: Joi.string()
    .trim()
    .max(2000)
    .messages({
      'string.max': 'Message cannot exceed 2000 characters',
      'string.empty': 'Message cannot be empty',
    }),

  status: Joi.string()
    .valid('draft', 'scheduled', 'sent', 'failed', 'paused', 'archived')
    .messages({
      'any.only': 'Status must be one of: draft, scheduled, sent, failed, paused, archived',
      'string.empty': 'Status cannot be empty',
    }),

  scheduledAt: Joi.date()
    .allow(null)
    .custom((value, helpers) => {
      if (value === null) return value;
      if (value < new Date()) {
        return helpers.error('date.future');
      }
      return value;
    })
    .messages({
      'date.base': 'Scheduled time must be a valid date',
      'date.future': 'Scheduled time must be now or a future date',
    }),

  createdBy: Joi.string()
    .length(24)
    .allow(null)
    .messages({
      'string.length': 'createdBy must be a valid User ObjectId',
    }),
}).min(1)
.options({ abortEarly: false });

module.exports = {
  campaignCreateSchema,
  campaignUpdateSchema,
};