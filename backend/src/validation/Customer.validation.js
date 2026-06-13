const Joi = require('joi');

// Validation schema for creating a customer
const customerCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Customer name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'string.empty': 'Customer name is required',
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .required()
    .messages({
      'any.required': 'Email address is required',
      'string.pattern.base': 'Please provide a valid email address',
      'string.empty': 'Email address is required',
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)
    .max(20)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'string.max': "Phone number can't exceed 20 characters",
    }),

  city: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .messages({
      'string.max': 'City name too long',
    }),

  totalSpent: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Total spent cannot be negative',
      'number.base': 'Total spent must be a number',
    }),

  lastOrderDate: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'Invalid date format for lastOrderDate',
    }),
});
 
const customerUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'string.empty': 'Customer name cannot be empty',
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'string.empty': 'Email address cannot be empty',
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)
    .max(20)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'string.max': "Phone number can't exceed 20 characters",
    }),

  city: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .messages({
      'string.max': 'City name too long',
    }),

  totalSpent: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Total spent cannot be negative',
      'number.base': 'Total spent must be a number',
    }),

  lastOrderDate: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'Invalid date format for lastOrderDate',
    }),
}).min(1); 

module.exports = {
  customerCreateSchema,
  customerUpdateSchema,
};