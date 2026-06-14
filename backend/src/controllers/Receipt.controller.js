const receiptService = require("../services/Receipt.service");

/**
 * POST /api/receipt
 * Channel Service se async delivery callbacks receive karta hai
 */
const handleReceipt = async (req, res) => {
  const log = await receiptService.processReceipt(req.body);

  res.status(200).json({
    success: true,
    message: "Receipt processed",
    data: log,
  });
};

module.exports = {
  handleReceipt,
};
