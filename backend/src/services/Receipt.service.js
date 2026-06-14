const CommunicationLog = require("../models/Communication_Log.model");
const Campaign = require("../models/Campaign.model");
const ApiError = require("../utils/ApiError");

const mapReceiptStatus = (status) => {
  const map = {
    DELIVERED: "delivered",
    OPENED: "opened",
    CLICKED: "clicked",
    FAILED: "failed",
  };
  return map[status];
};

const mapChannel = (channel) => {
  const map = {
    WhatsApp: "whatsapp",
    SMS: "sms",
    Email: "email",
    RCS: "other",
  };
  return map[channel] || "other";
};

/**
 * Channel Service callback process karo — communication log create/update
 */
const processReceipt = async ({ campaignId, customerId, status, timestamp }) => {
  const eventTime = timestamp ? new Date(timestamp) : new Date();
  const dbStatus = mapReceiptStatus(status);

  const campaign = await Campaign.findOne({ _id: campaignId, isDeleted: false }).lean();
  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  let log = await CommunicationLog.findOne({ campaignId, customerId }).select("+meta");

  if (!log) {
    log = new CommunicationLog({
      campaignId,
      customerId,
      channel: mapChannel(campaign.channel),
      status: "pending",
      sentAt: eventTime,
    });
  }

  log.status = dbStatus;
  log.channel = mapChannel(campaign.channel);

  if (status === "DELIVERED") {
    log.deliveredAt = eventTime;
    log.sentAt = log.sentAt || eventTime;
  }

  if (status === "OPENED") {
    log.openedAt = eventTime;
    log.deliveredAt = log.deliveredAt || eventTime;
  }

  if (status === "CLICKED") {
    log.openedAt = log.openedAt || eventTime;
    log.deliveredAt = log.deliveredAt || eventTime;
    log.meta = { ...(log.meta || {}), clickedAt: eventTime };
  }

  if (status === "FAILED") {
    log.failureReason = "Delivery failed at channel provider";
  }

  await log.save();

  const result = log.toJSON();
  return result;
};

module.exports = {
  processReceipt,
};
