const express = require("express");
const {
  getCustomers,
  getCustomerById,
  createCustomer,
} = require("../controllers/Customer.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const {
  customerCreateSchema,
  customerIdParamSchema,
  customerListQuerySchema,
} = require("../validation/Customer.validation");

const router = express.Router();

// GET /customers — list with pagination, search, filters
router.get(
  "/",
  validate(customerListQuerySchema, "query"),
  asyncHandler(getCustomers)
);

// GET /customers/:id — single customer by MongoDB ObjectId
router.get(
  "/:id",
  validate(customerIdParamSchema, "params"),
  asyncHandler(getCustomerById)
);

// POST /customers — naya customer create
router.post(
  "/",
  validate(customerCreateSchema, "body"),
  asyncHandler(createCustomer)
);

module.exports = router;
