const Joi = require('joi');

// Communication Log create validation schema
// Naya communication log create karte waqt yeh schema use hoga
const communicationLogCreateSchema = Joi.object({
  campaignId: Joi.string()
    .length(24)
    .required()
    .messages({
      'any.required': 'Campaign ID zaroori hai',
      'string.length': 'Campaign ID galat hai (24-char ObjectId chahiye)',
      'string.empty': 'Campaign ID nahi diya',
    }),

  customerId: Joi.string()
    .length(24)
    .required()
    .messages({
      'any.required': 'Customer ID zaroori hai',
      'string.length': 'Customer ID galat hai (24-char ObjectId chahiye)',
      'string.empty': 'Customer ID nahi diya',
    }),

  status: Joi.string()
    .valid('pending', 'sent', 'failed', 'delivered', 'opened', 'clicked', 'converted')
    .default('pending')
    .messages({
      'any.only': 'Status allowed: pending, sent, failed, delivered, opened, clicked, converted',
      'string.empty': 'Status nahi diya',
    }),

  channel: Joi.string()
    .valid('email', 'sms', 'push', 'whatsapp', 'other')
    .default('email')
    .messages({
      'any.only': 'Channel allowed: email, sms, push, whatsapp, other',
      'string.empty': 'Channel nahi diya',
    }),

  sentAt: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'SentAt sahi date honi chahiye',
    }),

  deliveredAt: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'DeliveredAt sahi date honi chahiye',
    }),

  openedAt: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'OpenedAt sahi date honi chahiye',
    }),

  failureReason: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Failure reason 500 characters se zyada nahi ho sakta',
    }),

  meta: Joi.object()
    .unknown(true)
    .default({})
    .messages({
      'object.base': 'Meta ek object hona chahiye',
    }),
});

// Communication Log update validation schema
// Update ke liye kam se kam ek field hona chahiye
const communicationLogUpdateSchema = Joi.object({
  campaignId: Joi.string()
    .length(24)
    .messages({
      'string.length': 'Campaign ID galat hai (24-char ObjectId chahiye)',
    }),

  customerId: Joi.string()
    .length(24)
    .messages({
      'string.length': 'Customer ID galat hai (24-char ObjectId chahiye)',
    }),

  status: Joi.string()
    .valid('pending', 'sent', 'failed', 'delivered', 'opened', 'clicked', 'converted')
    .messages({
      'any.only': 'Status allowed: pending, sent, failed, delivered, opened, clicked, converted',
    }),

  channel: Joi.string()
    .valid('email', 'sms', 'push', 'whatsapp', 'other')
    .messages({
      'any.only': 'Channel allowed: email, sms, push, whatsapp, other',
    }),

  sentAt: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'SentAt sahi date honi chahiye',
    }),

  deliveredAt: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'DeliveredAt sahi date honi chahiye',
    }),

  openedAt: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'OpenedAt sahi date honi chahiye',
    }),

  failureReason: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Failure reason 500 characters se zyada nahi ho sakta',
    }),

  meta: Joi.object()
    .unknown(true)
    .messages({
      'object.base': 'Meta ek object hona chahiye',
    }),
}).min(1)
  .options({ abortEarly: false });

module.exports = {
  communicationLogCreateSchema,
  communicationLogUpdateSchema,
};