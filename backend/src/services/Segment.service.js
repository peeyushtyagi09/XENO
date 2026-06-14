const Customer = require("../models/Customer.model");

/**
 * Segment Service — Segmentation Engine ka core logic
 *
 * Kyon alag service layer?
 * - Filter-building logic complex ho sakti hai (AND/OR, date math, range queries)
 * - Controller sirf HTTP request/response handle kare — Single Responsibility Principle
 * - Baad me saved Segment.criteria se bhi yahi function reuse ho sakta hai
 * - Unit testing me service ko directly test karna easy hai (HTTP mock ki zaroorat nahi)
 */

/**
 * Regex special chars escape karo — user input se injection avoid karne ke liye
 * Example: city "Delhi (NCR)" safe regex ban jaye
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * MongoDB filter object banata hai segment criteria se
 * Saare filters AND logic se combine hote hain (intersection)
 *
 * @param {Object} criteria - { minSpent, maxSpent, inactiveDays, city }
 * @returns {Object} Mongoose-compatible filter
 */
const buildSegmentFilter = ({ minSpent, maxSpent, inactiveDays, city }) => {
  const filter = {};

  // Range filter: totalSpent pe $gte aur $lte ek hi object me merge karte hain
  // MongoDB ek field pe multiple operators allow karta hai — efficient single-field scan
  if (minSpent != null || maxSpent != null) {
    filter.totalSpent = {};
    if (minSpent != null) filter.totalSpent.$gte = minSpent;
    if (maxSpent != null) filter.totalSpent.$lte = maxSpent;
  }

  // City filter: case-insensitive exact match
  // Partial match (Customer list API jaisa) segmentation me galat results deta hai
  // "Delhi" sirf Delhi wale customers, "Delhi NCR" alag segment hoga
  if (city) {
    filter.city = { $regex: new RegExp(`^${escapeRegex(city.trim())}$`, "i") };
  }

  // Inactive customers: last order N days se pehle ya kabhi order nahi kiya (null)
  // $and use karte hain taaki baaki filters ke saath sahi AND ho — top-level $or conflict na kare
  if (inactiveDays != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactiveDays);
    cutoff.setHours(0, 0, 0, 0);

    filter.$and = [
      {
        $or: [
          { lastOrderDate: { $lt: cutoff } },
          { lastOrderDate: null },
        ],
      },
    ];
  }

  return filter;
};

/**
 * lastOrderDate ko API response ke liye YYYY-MM-DD string me convert karo
 * ISO full timestamp client ke liye zyada verbose hota — spec me date-only format hai
 */
const formatLastOrderDate = (date) => {
  if (!date) return null;
  return date.toISOString().split("T")[0];
};

/**
 * Segment preview — criteria match karne wale customers fetch karo
 * .lean() plain JS objects deta hai (Mongoose document overhead nahi) — read-only query ke liye best
 * .select() sirf zaroori fields — network payload aur memory dono kam
 *
 * @param {Object} criteria - validated segment filters
 * @returns {Promise<{ customers: Array, count: number }>}
 */
const previewSegmentCustomers = async (criteria) => {
  const filter = buildSegmentFilter(criteria);

  const [customers, count] = await Promise.all([
    Customer.find(filter)
      .select("name email city totalSpent lastOrderDate")
      .sort({ totalSpent: -1 })
      .lean(),
    Customer.countDocuments(filter),
  ]);

  // Response shape spec ke mutabiq — date formatting yahan karte hain
  const formattedCustomers = customers.map((customer) => ({
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    city: customer.city,
    totalSpent: customer.totalSpent,
    lastOrderDate: formatLastOrderDate(customer.lastOrderDate),
  }));

  return { customers: formattedCustomers, count };
};

module.exports = {
  buildSegmentFilter,
  previewSegmentCustomers,
};
