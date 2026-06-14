const Campaign = require("../models/Campaign.model");
const Segment = require("../models/Segment.model");
const Customer = require("../models/Customer.model");
const ApiError = require("../utils/ApiError");
const segmentService = require("./Segment.service");

/**
 * Campaign Service — business logic layer
 *
 * Kyon service alag hai?
 * - Campaign create pe segment validate + audience count compute karna padta hai
 * - Controller HTTP handle kare, yahan DB orchestration ho
 * - Baad me scheduling / communication log trigger yahan add hoga
 */

/** Soft-deleted campaigns ko exclude karne wala base filter */
const activeFilter = { isDeleted: false };

/**
 * Segment exist karta hai ya nahi — create/update se pehle verify
 */
const getActiveSegment = async (segmentId) => {
  const segment = await Segment.findOne({ _id: segmentId, isActive: true }).lean();

  if (!segment) {
    throw new ApiError(404, "Segment not found or inactive");
  }

  return segment;
};

/**
 * Segment criteria se audience count nikalna
 * Segment.service ka buildSegmentFilter reuse — preview aur campaign dono same logic
 */
const computeAudienceCount = async (segment) => {
  const criteria = segment.criteria || {};
  const filter = segmentService.buildSegmentFilter(criteria);
  return Customer.countDocuments(filter);
};

/**
 * POST /api/campaigns
 */
const createCampaign = async (payload) => {
  const segment = await getActiveSegment(payload.segmentId);
  const audienceCount = await computeAudienceCount(segment);

  const campaign = await Campaign.create({
    ...payload,
    audienceCount,
    status: payload.status || "Draft",
  });

  return campaign;
};

/**
 * GET /api/campaigns — pagination + optional status filter
 */
const getCampaigns = async ({ page, limit, status, sortOrder }) => {
  const filter = { ...activeFilter };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const sort = { createdAt: sortOrder === "asc" ? 1 : -1 };

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .select("-__v -isDeleted -deletedAt")
      .populate("segmentId", "segmentName description criteria isActive")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Campaign.countDocuments(filter),
  ]);

  return {
    campaigns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * GET /api/campaigns/:id — segment populated
 */
const getCampaignById = async (id) => {
  const campaign = await Campaign.findOne({ _id: id, ...activeFilter })
    .select("-__v -isDeleted -deletedAt")
    .populate("segmentId", "segmentName description criteria isActive")
    .lean();

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  return campaign;
};

/**
 * PUT /api/campaigns/:id
 * Spec ke mutabiq sirf name, channel, message, status update allowed
 */
const updateCampaign = async (id, updates) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: id, ...activeFilter },
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select("-__v")
    .populate("segmentId", "segmentName description criteria isActive");

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  return campaign;
};

/**
 * DELETE /api/campaigns/:id — soft delete
 * Hard delete se communication logs / audit trail break ho sakti hai
 */
const deleteCampaign = async (id) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: id, ...activeFilter },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  ).select("-__v");

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  return campaign;
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
