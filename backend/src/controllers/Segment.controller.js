const segmentService = require("../services/Segment.service");

/**
 * POST /api/segments/preview
 *
 * Segmentation Engine — marketers ko bina segment save kiye
 * filtering rules ka live preview deta hai
 *
 * Controller ka kaam:
 * 1. Validated body se criteria nikalna (validation middleware pehle ho chuki hoti hai)
 * 2. Service ko business logic delegate karna
 * 3. HTTP response shape karna — yahan koi DB query nahi honi chahiye
 */
const previewSegment = async (req, res) => {
  const { minSpent, maxSpent, inactiveDays, city } = req.body;

  const { customers, count } = await segmentService.previewSegmentCustomers({
    minSpent,
    maxSpent,
    inactiveDays,
    city,
  });

  // Spec ke mutabiq response — count + customers top-level pe
  // Preview endpoint hai, isliye message field optional rakha (list APIs se thoda alag)
  res.status(200).json({
    success: true,
    count,
    customers,
  });
};

module.exports = {
  previewSegment,
};
