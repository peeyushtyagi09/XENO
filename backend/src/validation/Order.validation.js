const Joi = require('joi');

// Order creation validation schema
// Yeh schema banate hai naye order ke liye
const orderCreateSchema = Joi.object({
  customerId: Joi.string()
    .length(24) // Mongoose ObjectId ki length fix hoti hai
    .required()
    .messages({
      'any.required': 'Customer ID zaroori hai',
      'string.length': 'Customer ID galat hai (24-char ObjectId chahiye)',
      'string.empty': 'Customer ID nahi diya',
    }),
  amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Order amount zaroori hai',
      'number.base': 'Order amount sahi number hona chahiye',
      'number.min': 'Amount negative nahi ho sakta',
    }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .length(24)
          .required()
          .messages({
            'any.required': 'Har item ka Product ID zaroori hai',
            'string.length': 'Product ID galat hai (24-char ObjectId chahiye)',
            'string.empty': 'Product ID nahi diya',
          }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'any.required': 'Quantity zaroori hai',
            'number.base': 'Quantity ek number honi chahiye',
            'number.min': 'Quantity kam se kam 1 honi chahiye',
            'number.integer': 'Quantity pura number hona chahiye',
          }),
        price: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Item ka price zaroori hai',
            'number.base': 'Price ek number hona chahiye',
            'number.min': 'Price negative nahi ho sakta',
          }),
        name: Joi.string()
          .trim()
          .max(100)
          .allow('', null)
          .messages({
            'string.max': 'Product name 100 characters se bada nahi ho sakta',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'Kam se kam ek item jaruri hai',
      'array.min': 'Kam se kam ek item order me hona chahiye',
      'array.base': 'Items ek array hai of products',
    }),
  status: Joi.string()
    .valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')
    .default('pending')
    .messages({
      'any.only': 'Status allowed: pending, confirmed, shipped, delivered, cancelled, returned',
      'string.empty': 'Order status nahi diya',
    }),
  orderDate: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.base': 'Order date galat format me hai',
      'date.max': 'Order date future ki nahi ho sakti',
    }),
  notes: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Notes 500 characters se zyada nahi ho sakte',
    }),
  shippingAddress: Joi.object({
    street: Joi.string().max(200).allow('', null)
      .messages({ 'string.max': 'Street 200 char se zyada nahi ho sakta' }),
    city: Joi.string().max(100).allow('', null)
      .messages({ 'string.max': 'City 100 char se zyada nahi ho sakta' }),
    state: Joi.string().max(100).allow('', null)
      .messages({ 'string.max': 'State 100 char se zyada nahi ho sakta' }),
    postalCode: Joi.string().max(20).allow('', null)
      .messages({ 'string.max': 'Postal Code 20 char se zyada nahi ho sakta' }),
    country: Joi.string().max(100).allow('', null)
      .messages({ 'string.max': 'Country 100 char se zyada nahi ho sakta' }),
  }).optional(),
  paymentMethod: Joi.string()
    .valid('card', 'cash', 'upi', 'wallet', 'other')
    .default('other')
    .messages({
      'any.only': 'Payment method allowed: card, cash, upi, wallet, other'
    }),
  transactionId: Joi.string()
    .max(100)
    .allow('', null)
    .messages({
      'string.max': 'Transaction ID 100 char se zyada nahi ho sakta',
    }),
}).options({ abortEarly: false });

// Order update validation schema
// Existing order update ke liye, kam se kam ek field required hai
const orderUpdateSchema = Joi.object({
  amount: Joi.number()
    .min(0)
    .messages({
      'number.base': 'Order amount sahi number hona chahiye',
      'number.min': 'Amount negative nahi ho sakta',
    }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .length(24)
          .required()
          .messages({
            'any.required': 'Har item ka Product ID zaroori hai',
            'string.length': 'Product ID galat hai (24-char ObjectId chahiye)',
            'string.empty': 'Product ID nahi diya',
          }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'any.required': 'Quantity zaroori hai',
            'number.base': 'Quantity ek number honi chahiye',
            'number.min': 'Quantity kam se kam 1 honi chahiye',
            'number.integer': 'Quantity pura number hona chahiye',
          }),
        price: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Item ka price zaroori hai',
            'number.base': 'Price ek number hona chahiye',
            'number.min': 'Price negative nahi ho sakta',
          }),
        name: Joi.string()
          .trim()
          .max(100)
          .allow('', null)
          .messages({
            'string.max': 'Product name 100 characters se bada nahi ho sakta',
          }),
      })
    )
    .min(1)
    .messages({
      'array.min': 'Kam se kam ek item order me hona chahiye',
      'array.base': 'Items ek array hai of products',
    }),
  status: Joi.string()
    .valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')
    .messages({
      'any.only': 'Status allowed: pending, confirmed, shipped, delivered, cancelled, returned',
      'string.empty': 'Order status nahi diya',
    }),
  notes: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Notes 500 characters se zyada nahi ho sakte',
    }),
  shippingAddress: Joi.object({
    street: Joi.string().max(200).allow('', null)
      .messages({ 'string.max': 'Street 200 char se zyada nahi ho sakta' }),
    city: Joi.string().max(100).allow('', null)
      .messages({ 'string.max': 'City 100 char se zyada nahi ho sakta' }),
    state: Joi.string().max(100).allow('', null)
      .messages({ 'string.max': 'State 100 char se zyada nahi ho sakta' }),
    postalCode: Joi.string().max(20).allow('', null)
      .messages({ 'string.max': 'Postal Code 20 char se zyada nahi ho sakta' }),
    country: Joi.string().max(100).allow('', null)
      .messages({ 'string.max': 'Country 100 char se zyada nahi ho sakta' }),
  }),
  paymentMethod: Joi.string()
    .valid('card', 'cash', 'upi', 'wallet', 'other')
    .messages({
      'any.only': 'Payment method allowed: card, cash, upi, wallet, other'
    }),
  transactionId: Joi.string()
    .max(100)
    .allow('', null)
    .messages({
      'string.max': 'Transaction ID 100 char se zyada nahi ho sakta',
    }),
}).min(1)
.options({ abortEarly: false });

module.exports = {
  orderCreateSchema,
  orderUpdateSchema,
};