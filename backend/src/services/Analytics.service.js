const mongoose = require("mongoose");
const Campaign = require("../models/Campaign.model");
const CommunicationLog = require("../models/Communication_Log.model");
const ApiError = require("../utils/ApiError");
const { buildConversionRates } = require("../utils/analyticsHelpers");

/**
 * Campaign Analytics Service
 *
 * Har customer-campaign pair ke liye ek CommunicationLog document hai.
 * Status overwrite hota hai receipts se — isliye funnel counts timestamp
 * aur status fields se nikalte hain, na ki event rows count karke.
 */

/**
 * MongoDB aggregation — ek campaign ke saare communication logs aggregate karo
 *
 * Pipeline steps:
 * 1. $match  — sirf is campaign ke logs
 * 2. $group  — har funnel stage ke liye count (sentAt, deliveredAt, etc.)
 *
 * Kyon $cond use karte hain?
 * - Har document ek customer journey represent karta hai
 * - deliveredAt != null matlab message deliver hua (chahe baad me open/click bhi hua ho)
 * - Failed alag count — status === 'failed'
 */
const aggregateCampaignStats = async (campaignId) => {
  const objectId = new mongoose.Types.ObjectId(campaignId);

  const [result] = await CommunicationLog.aggregate([
    { $match: { campaignId: objectId } },
    {
      $group: {
        _id: null,
        // Har log ek send attempt hai — campaign audience ko message bheja gaya
        sent: { $sum: 1 },
        delivered: {
          $sum: {
            $cond: [{ $ifNull: ["$deliveredAt", false] }, 1, 0],
          },
        },
        opened: {
          $sum: {
            $cond: [{ $ifNull: ["$openedAt", false] }, 1, 0],
          },
        },
        clicked: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "clicked"] },
                  { $ifNull: ["$meta.clickedAt", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
          },
        },
        converted: {
          $sum: {
            $cond: [{ $eq: ["$status", "converted"] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (!result) {
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
      converted: 0,
    };
  }

  const { _id, ...counts } = result;
  return counts;
};

/**
 * GET /api/campaigns/:id/stats — full analytics response
 */
const getCampaignStats = async (campaignId) => {
  const campaign = await Campaign.findOne({
    _id: campaignId,
    isDeleted: false,
  }).lean();

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const counts = await aggregateCampaignStats(campaignId);

  const rates = buildConversionRates(counts);

  return {
    campaignId,
    ...counts,
    ...rates,
  };
};

module.exports = {
  getCampaignStats,
  aggregateCampaignStats,
};
