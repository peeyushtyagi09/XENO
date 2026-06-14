const express = require("express");
const { processCommunication } = require("../services/communication.service");

const router = express.Router();

/**
 * POST /send
 * Messaging provider simulate karta hai — turant accept, baad me callbacks
 */
router.post("/send", (req, res) => {
  const result = processCommunication(req.body);

  if (!result.accepted) {
    return res.status(400).json({
      success: false,
      message: "Invalid communication payload",
      errors: result.errors,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Communication accepted for processing",
  });
});

module.exports = router;
