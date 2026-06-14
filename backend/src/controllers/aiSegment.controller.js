const aiSegmentService = require("../services/aiSegment.service");
const ApiError = require("../utils/ApiError");

/**
 * POST /api/ai/create-segment
 * Natural language segmentation query handle karne ka controller handler
 */
const createAISegment = async (req, res) => {
  const { query } = req.body;

  // input validation (fallback checking)
  if (!query || typeof query !== "string") {
    throw new ApiError(400, "Sahi query string parameters bhejna zaroori hai");
  }

  // Hinglish comment: Natural language prompt parsing aur segment creation initiate kar rahe hain
  const segmentData = await aiSegmentService.createSegmentFromQuery(query);

  // structured JSON response output de rahe hain
  res.status(201).json({
    success: true,
    data: segmentData,
  });
};

module.exports = {
  createAISegment,
};
