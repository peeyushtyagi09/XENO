const mongoose = require("mongoose");



const VALID_CHANNELS = ["email", "sms", "push", "whatsapp", "other"];
const VALID_STATUSES = [
  "draft",
  "scheduled",
  "sent",
  "failed",
  "paused",
  "archived",
];

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
      minlength: [2, "Campaign name must be at least 2 characters"],
      maxlength: [100, "Campaign name cannot exceed 100 characters"],
      unique: true,
      index: true,
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: [true, "Segment ID is required"],
      index: true,
    },
    channel: {
      type: String,
      required: [true, "Channel is required"],
      trim: true,
      enum: {
        values: VALID_CHANNELS,
        message: `Channel must be one of: ${VALID_CHANNELS.join(", ")}`
      },
      default: "email",
      index: true,
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
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`
      },
      default: "draft",
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // Allow null (unscheduled), or time in the present/future
          return value === null || value >= new Date();
        },
        message: "Scheduled time must be now or a future date"
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    }, 
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false,
    }
  },
  {
    timestamps: true,
    collection: "campaigns",
    versionKey: false,
  }
);

CampaignSchema.index({ name: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ segmentId: 1 });
CampaignSchema.index({ channel: 1, scheduledAt: 1 });

CampaignSchema.methods.toJSON = function () {
  const obj = this.toObject({ getters: true });
  delete obj.__v;
  delete obj.meta; 
  return obj;
};


const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = Campaign;