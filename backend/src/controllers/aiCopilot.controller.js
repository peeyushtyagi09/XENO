const aiCopilotService = require("../services/aiCopilot.service");
const ApiError = require("../utils/ApiError");

/**
 * POST /api/ai/copilot
 * User marketer message accept karke intent determine karta hai aur tool execute karta hai
 */
const handleCopilotChat = async (req, res) => {
  const { message } = req.body;

  // input validation (fallback check)
  if (!message || typeof message !== "string") {
    throw new ApiError(400, "Sahi message parameters body me hona zaroori hai");
  }

  // Hinglish comment: Copilot ke through correct tool execute kar rahe hain
  const copilotResponse = await aiCopilotService.processCopilotMessage(message);

  // Success response shape standard layout me send kar rahe hain
  res.status(200).json({
    success: true,
    data: copilotResponse,
  });
};

module.exports = {
  handleCopilotChat,
};
