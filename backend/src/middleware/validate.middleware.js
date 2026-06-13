const ApiError = require("../utils/ApiError");

/**
 * Joi schema se request validate karta hai
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body' | 'query' | 'params'} property - kya validate karna hai
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // saari errors ek saath dikhao
      stripUnknown: true, // extra fields hata do — security ke liye accha
      convert: true, // query strings ko number/date me convert karo
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ApiError(400, "Validation fail ho gayi", errors));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
