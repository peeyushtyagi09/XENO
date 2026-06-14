const mongoose = require("mongoose");

// Assignment spec ke mutabiq channel aur status enums
// PascalCase rakha — API request/response me same format dikhega
const VALID_CHANNELS = ["WhatsApp", "SMS", "Email", "RCS"];
const VALID_STATUSES = ["Draft", "Scheduled", "Running", "Completed"];

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
      minlength: [2, "Campaign name must be at least 2 characters"],
      maxlength: [100, "Campaign name cannot exceed 100 characters"],
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: [true, "Segment ID is required"],
    },
    channel: {
      type: String,
      required: [true, "Channel is required"],
      trim: true,
      enum: {
        values: VALID_CHANNELS,
        message: `Channel must be one of: ${VALID_CHANNELS.join(", ")}`,
      },
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      },
      default: "Draft",
    },
    // Segment criteria se match hone wale customers ki count — create time pe compute hoti hai
    audienceCount: {
      type: Number,
      min: [0, "Audience count cannot be negative"],
      default: 0,
    },
    // Soft delete — record DB me rehta hai, list/detail queries me hide hota hai
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "campaigns",
    versionKey: false,
  }
);

CampaignSchema.index({ name: 1 });
CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ segmentId: 1 });
CampaignSchema.index({ channel: 1 });
CampaignSchema.index({ isDeleted: 1, createdAt: -1 });

CampaignSchema.methods.toJSON = function () {
  const obj = this.toObject({ getters: true });
  delete obj.__v;
  delete obj.isDeleted;
  delete obj.deletedAt;
  return obj;
};

const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = Campaign;
