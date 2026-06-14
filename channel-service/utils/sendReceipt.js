const axios = require("axios");

/**
 * CRM ko async delivery receipt bhejta hai
 * Channel service real messages nahi bhejta — sirf lifecycle simulate karta hai
 *
 * @param {string} campaignId
 * @param {string} customerId
 * @param {string} status - DELIVERED | OPENED | CLICKED | FAILED
 */
const sendReceipt = async (campaignId, customerId, status) => {
  const callbackUrl = process.env.CRM_CALLBACK_URL;

  if (!callbackUrl) {
    console.error("[CHANNEL SERVICE] CRM_CALLBACK_URL is not configured");
    return { success: false, error: "CRM_CALLBACK_URL missing" };
  }

  const payload = {
    campaignId,
    customerId,
    status,
    timestamp: new Date().toISOString(),
  };

  console.log("[CHANNEL SERVICE]");
  console.log(`Sending ${status} callback → ${callbackUrl}`);

  try {
    const response = await axios.post(callbackUrl, payload, {
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
    });

    console.log(`[CHANNEL SERVICE] ${status} callback accepted (${response.status})`);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || error.message;

    console.error("[CHANNEL SERVICE]");
    console.error(`Callback failed for ${status}: ${message}`);

    return { success: false, error: message };
  }
};

module.exports = sendReceipt;
