const Segment = require("../models/Segment.model");
const Customer = require("../models/Customer.model");
const { genAI } = require("./gemini.service");
const ApiError = require("../utils/ApiError");

/**
 * MongoDB pipeline se estimated matching audience count compute karta hai
 * (Lookup query aggregates orders collection for minOrders/maxOrders filtering)
 * @param {object} filters - calculated filters { minSpent, maxSpent, city, inactiveDays, minOrders, maxOrders }
 * @returns {Promise<number>} - matching customer count
 */
const estimateAudienceCount = async (filters) => {
  const pipeline = [];

  // Basic filters: totalSpent, city, lastOrderDate (inactiveDays)
  const customerMatch = {};
  if (filters.minSpent != null || filters.maxSpent != null) {
    customerMatch.totalSpent = {};
    if (filters.minSpent != null) customerMatch.totalSpent.$gte = Number(filters.minSpent);
    if (filters.maxSpent != null) customerMatch.totalSpent.$lte = Number(filters.maxSpent);
  }

  if (filters.city) {
    customerMatch.city = { $regex: new RegExp(`^${filters.city.trim()}$`, "i") };
  }

  if (filters.inactiveDays != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(filters.inactiveDays));
    cutoff.setHours(0, 0, 0, 0);

    customerMatch.$and = [
      {
        $or: [
          { lastOrderDate: { $lt: cutoff } },
          { lastOrderDate: null },
        ],
      },
    ];
  }

  if (Object.keys(customerMatch).length > 0) {
    pipeline.push({ $match: customerMatch });
  }

  // Lookup orders collection if minOrders/maxOrders is present
  if (filters.minOrders != null || filters.maxOrders != null) {
    pipeline.push({
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "customerId",
        as: "orders",
      },
    });

    pipeline.push({
      $addFields: {
        orderCount: { $size: "$orders" },
      },
    });

    const orderMatch = {};
    if (filters.minOrders != null) orderMatch.orderCount = { $gte: Number(filters.minOrders) };
    if (filters.maxOrders != null) {
      if (!orderMatch.orderCount) orderMatch.orderCount = {};
      orderMatch.orderCount.$lte = Number(filters.maxOrders);
    }

    pipeline.push({ $match: orderMatch });
  }

  // Count matches
  pipeline.push({
    $count: "total",
  });

  const result = await Customer.aggregate(pipeline);
  return result[0]?.total || 0;
};

/**
 * Natural language segmentation query ko Joi/JSON filters me convert karke DB save karta hai
 * @param {string} query - marketer query (e.g. "Find high-value customers from Delhi")
 * @returns {Promise<object>} - created segment object with audience count
 */
const createSegmentFromQuery = async (query) => {
  if (!genAI) {
    console.error("[AI SEGMENT] Error: Gemini client not ready");
    throw new ApiError(500, "Gemini client server par configured nahi hai.");
  }

  try {
    console.log(`[AI SEGMENT] Request received for query: "${query}"`);

    // Gemini client select karo with JSON mode forced
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are a Senior CRM Segmentation Expert.
Your task is to convert a marketer's request/query into a set of structured segment filters and generate a meaningful segment name.

Supported filters:
- "minSpent" (number): minimum total spent amount by the customer
- "maxSpent" (number): maximum total spent amount by the customer
- "city" (string): target city name
- "inactiveDays" (number): number of days of inactivity (customers whose lastOrderDate was more than inactiveDays ago or who have never ordered)
- "minOrders" (number): minimum total number of orders placed by the customer
- "maxOrders" (number): maximum total number of orders placed by the customer

Generate a short, professional, and descriptive name for this segment.
Only return keys that are explicitly or implicitly requested by the marketer's objective. Do not guess or add unrelated filters.

Your response MUST be a single JSON object matching this structure (do not wrap in markdown, do not write extra text):
{
  "segmentName": "A concise and professional segment name (e.g., 'High Value Inactive Customers')",
  "filters": {
    "minSpent": 5000 | null,
    "maxSpent": 10000 | null,
    "city": "Delhi" | null,
    "inactiveDays": 30 | null,
    "minOrders": 5 | null,
    "maxOrders": 10 | null
  }
}

Marketer Query: "${query}"
`;

    // Gemini se segment filters generate karwa rahe hain
    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      console.error("[AI SEGMENT] Error: Empty response from Gemini");
      throw new ApiError(502, "Gemini segmentation expert se response nahi mila.");
    }

    const textResponse = result.response.text();
    let segmentDetails;
    try {
      segmentDetails = JSON.parse(textResponse);
    } catch (e) {
      console.error("[AI SEGMENT] Error: Invalid JSON response format");
      throw new ApiError(502, "Gemini segmentation response standard JSON nahi tha.");
    }

    // Extracted keys check and sanitation
    if (!segmentDetails.segmentName || typeof segmentDetails.segmentName !== "string") {
      segmentDetails.segmentName = `AI Generated Segment - ${Date.now()}`;
    }

    const cleanFilters = {};
    if (segmentDetails.filters) {
      const allowed = ["minSpent", "maxSpent", "city", "inactiveDays", "minOrders", "maxOrders"];
      for (const key of allowed) {
        if (segmentDetails.filters[key] != null) {
          cleanFilters[key] = segmentDetails.filters[key];
        }
      }
    }

    console.log("[AI SEGMENT] Filters extracted:", cleanFilters);

    // Live estimated audience segment count compute kar rahe hain
    const estimatedAudience = await estimateAudienceCount(cleanFilters);
    console.log(`[AI SEGMENT] Estimated audience count: ${estimatedAudience}`);

    // Mongo DB check and unique name handle (if name already exists, add random string)
    let finalSegmentName = segmentDetails.segmentName.trim();
    const existingSegment = await Segment.findOne({ segmentName: finalSegmentName });
    if (existingSegment) {
      finalSegmentName = `${finalSegmentName} (${Date.now().toString().slice(-4)})`;
    }

    // Segment database me create kar rahe hain
    const segment = await Segment.create({
      segmentName: finalSegmentName,
      description: `AI generated segment from marketer query: "${query}"`,
      criteria: cleanFilters,
      isActive: true,
    });

    console.log(`[AI SEGMENT] Segment created successfully with ID: ${segment._id}`);

    return {
      segmentId: segment._id.toString(),
      segmentName: segment.segmentName,
      filters: cleanFilters,
      estimatedAudience,
    };

  } catch (error) {
    console.error(`[AI SEGMENT] Error: ${error.message}`);
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(502, `AI Segment build karne me error aayi: ${error.message}`);
  }
};

module.exports = {
  createSegmentFromQuery,
  estimateAudienceCount,
};
