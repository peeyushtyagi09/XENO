const Customer = require("../models/Customer.model");
const ApiError = require("../utils/ApiError");

/**
 * GET /customers
 * Saare customers list karo — pagination, search, city filter support
 */
const getCustomers = async (req, res) => {
  const { page, limit, city, search, sortBy, sortOrder } = req.query;

  // MongoDB filter object banate hain
  const filter = {};

  // City se filter — case-insensitive partial match
  if (city) {
    filter.city = { $regex: city, $options: "i" };
  }

  // Name ya email me search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Parallel me data + total count — performance ke liye accha
  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Customers mil gaye",
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * GET /customers/:id
 * Ek customer ki poori detail by ID
 */
const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id).select("-__v").lean();

  if (!customer) {
    throw new ApiError(404, "Customer nahi mila — shayad delete ho gaya ya galat ID hai");
  }

  res.status(200).json({
    success: true,
    message: "Customer mil gaya",
    data: customer,
  });
};

/**
 * POST /customers
 * Naya customer create karo
 */
const createCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);

  res.status(201).json({
    success: true,
    message: "Customer successfully ban gaya",
    data: customer,
  });
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
};
