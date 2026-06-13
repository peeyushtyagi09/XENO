const Joi = require("joi");

// Customer create validation schema
// Naya customer banate waqt POST /customers body isse validate hogi
const customerCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "any.required": "Customer name zaroori hai",
      "string.min": "Name kam se kam 2 characters ka hona chahiye",
      "string.max": "Name 100 characters se zyada nahi ho sakta",
      "string.empty": "Customer name khali nahi ho sakta",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .required()
    .messages({
      "any.required": "Email address zaroori hai",
      "string.pattern.base": "Sahi email address do bhai",
      "string.empty": "Email address khali nahi ho sakta",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)
    .max(20)
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone number sahi format me do (10 digits)",
      "string.max": "Phone number 20 characters se zyada nahi ho sakta",
    }),

  city: Joi.string()
    .trim()
    .max(50)
    .allow("", null)
    .messages({
      "string.max": "City name 50 characters se zyada nahi ho sakta",
    }),

  totalSpent: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.min": "Total spent negative nahi ho sakta",
      "number.base": "Total spent ek number hona chahiye",
    }),

  lastOrderDate: Joi.date()
    .allow(null)
    .messages({
      "date.base": "lastOrderDate ka format galat hai",
    }),
}).options({ abortEarly: false });

// Customer update validation schema (future PUT/PATCH ke liye ready)
const customerUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      "string.min": "Name kam se kam 2 characters ka hona chahiye",
      "string.max": "Name 100 characters se zyada nahi ho sakta",
      "string.empty": "Customer name khali nahi ho sakta",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .messages({
      "string.pattern.base": "Sahi email address do bhai",
      "string.empty": "Email address khali nahi ho sakta",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)
    .max(20)
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone number sahi format me do",
      "string.max": "Phone number 20 characters se zyada nahi ho sakta",
    }),

  city: Joi.string()
    .trim()
    .max(50)
    .allow("", null)
    .messages({
      "string.max": "City name 50 characters se zyada nahi ho sakta",
    }),

  totalSpent: Joi.number()
    .min(0)
    .messages({
      "number.min": "Total spent negative nahi ho sakta",
      "number.base": "Total spent ek number hona chahiye",
    }),

  lastOrderDate: Joi.date()
    .allow(null)
    .messages({
      "date.base": "lastOrderDate ka format galat hai",
    }),
})
  .min(1) // kam se kam ek field update honi chahiye
  .messages({
    "object.min": "Update ke liye kam se kam ek field bhejo",
  })
  .options({ abortEarly: false });

// GET /customers/:id — URL param validate
const customerIdParamSchema = Joi.object({
  id: Joi.string()
    .length(24)
    .required()
    .messages({
      "any.required": "Customer ID zaroori hai",
      "string.length": "Customer ID galat hai (24-char ObjectId chahiye)",
      "string.empty": "Customer ID nahi diya",
    }),
});

// GET /customers — query params (pagination, filter, search)
const customerListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.min": "Page 1 se kam nahi ho sakta",
      "number.base": "Page ek number hona chahiye",
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      "number.min": "Limit kam se kam 1 honi chahiye",
      "number.max": "Ek baar me 100 se zyada customers nahi de sakte",
      "number.base": "Limit ek number honi chahiye",
    }),

  city: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": "City filter string hona chahiye",
    }),

  search: Joi.string()
    .trim()
    .allow("")
    .max(100)
    .messages({
      "string.max": "Search term 100 characters se zyada nahi ho sakta",
    }),

  sortBy: Joi.string()
    .valid("name", "email", "totalSpent", "createdAt", "lastOrderDate")
    .default("createdAt")
    .messages({
      "any.only":
        "sortBy sirf name, email, totalSpent, createdAt ya lastOrderDate ho sakta hai",
    }),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc")
    .messages({
      "any.only": "sortOrder sirf asc ya desc ho sakta hai",
    }),
}).options({ abortEarly: false });

module.exports = {
  customerCreateSchema,
  customerUpdateSchema,
  customerIdParamSchema,
  customerListQuerySchema,
};
