const sendReceipt = require("../utils/sendReceipt");

const VALID_CHANNELS = ["WhatsApp", "SMS", "Email", "RCS"];

// Delivery simulation probabilities
const DELIVERY_SUCCESS_RATE = 0.9;
const OPENED_RATE = 0.7;
const CLICKED_RATE = 0.4;

/**
 * POST /send body validate karo — microservice level pe lightweight check
 */
const validateSendPayload = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["Request body must be a JSON object"];
  }

  if (!payload.customerId || String(payload.customerId).trim() === "") {
    errors.push("customerId is required");
  }

  if (!payload.campaignId || String(payload.campaignId).trim() === "") {
    errors.push("campaignId is required");
  }

  if (!payload.channel || !VALID_CHANNELS.includes(payload.channel)) {
    errors.push(`channel must be one of: ${VALID_CHANNELS.join(", ")}`);
  }

  if (!payload.message || String(payload.message).trim() === "") {
    errors.push("message is required");
  }

  return errors;
};

/**
 * Communication lifecycle simulate karo — setTimeout se async events
 *
 * Timeline (request ke baad):
 * - 2s  → DELIVERED (90%) ya FAILED (10%)
 * - 5s  → OPENED (random, sirf delivered case me)
 * - 8s  → CLICKED (random, sirf delivered case me)
 */
const simulateCommunicationLifecycle = ({ campaignId, customerId, channel, message }) => {
  const state = { failed: false };

  console.log("[CHANNEL SERVICE]");
  console.log("Received communication request");
  console.log(`  campaignId: ${campaignId}, customerId: ${customerId}, channel: ${channel}`);
  console.log(`  message: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`);

  // 2 seconds — delivery attempt
  setTimeout(async () => {
    const isDelivered = Math.random() < DELIVERY_SUCCESS_RATE;

    if (!isDelivered) {
      state.failed = true;
      await sendReceipt(campaignId, customerId, "FAILED");
      console.log("[CHANNEL SERVICE] Communication failed — lifecycle stopped");
      return;
    }

    await sendReceipt(campaignId, customerId, "DELIVERED");
  }, 2000);

  // 5 seconds — opened event (skip if failed at 2s)
  setTimeout(async () => {
    if (state.failed) return;

    if (Math.random() < OPENED_RATE) {
      await sendReceipt(campaignId, customerId, "OPENED");
    } else {
      console.log("[CHANNEL SERVICE] OPENED event skipped (random probability)");
    }
  }, 5000);

  // 8 seconds — clicked event (skip if failed at 2s)
  setTimeout(async () => {
    if (state.failed) return;

    if (Math.random() < CLICKED_RATE) {
      await sendReceipt(campaignId, customerId, "CLICKED");
    } else {
      console.log("[CHANNEL SERVICE] CLICKED event skipped (random probability)");
    }
  }, 8000);
};

/**
 * Request accept karo aur background me lifecycle start karo
 * Client ko turant 202-style acceptance response milta hai
 */
const processCommunication = (payload) => {
  const errors = validateSendPayload(payload);

  if (errors.length > 0) {
    return { accepted: false, errors };
  }

  simulateCommunicationLifecycle(payload);

  return { accepted: true };
};

module.exports = {
  processCommunication,
  validateSendPayload,
};
