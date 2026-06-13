const Joi = require('joi');

// Segment create validation schema
// Yeh schema segment banate waqt use karenge
const segmentCreateSchema = Joi.object({
  segmentName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Segment name zaroori hai',
      'string.empty': 'Segment name zaroori hai',
      'string.min': 'Segment name kam se kam 2 characters ka hona chahiye',
      'string.max': 'Segment name 100 characters se zyada nahi ho sakta',
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Description 500 characters se zyada nahi ho sakta',
    }),

  criteria: Joi.object()
    .required()
    .messages({
      'any.required': 'Segment criteria zaroori hai',
      'object.base': 'Criteria ek object hona chahiye',
    }),

  isActive: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'isActive true ya false hona chahiye',
    }),

  createdBy: Joi.string()
    .length(24)
    .allow(null)
    .messages({
      'string.length': 'createdBy sahi User ObjectId hona chahiye (24-char)',
    }),
});

// Segment update validation schema
// Segment update karte waqt kam se kam 1 field honi chahiye
const segmentUpdateSchema = Joi.object({
  segmentName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Segment name kam se kam 2 characters ka hona chahiye',
      'string.max': 'Segment name 100 characters se zyada nahi ho sakta',
      'string.empty': 'Segment name khali nahi ho sakta',
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Description 500 characters se zyada nahi ho sakta',
    }),

  criteria: Joi.object()
    .messages({
      'object.base': 'Criteria ek object hona chahiye',
    }),

  isActive: Joi.boolean()
    .messages({
      'boolean.base': 'isActive true ya false hona chahiye',
    }),

  createdBy: Joi.string()
    .length(24)
    .allow(null)
    .messages({
      'string.length': 'createdBy sahi User ObjectId hona chahiye (24-char)',
    }),
}).min(1)
.options({ abortEarly: false });

module.exports = {
  segmentCreateSchema,
  segmentUpdateSchema,
};