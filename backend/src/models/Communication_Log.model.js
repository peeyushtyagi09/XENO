const mongoose = require("mongoose");

const VALID_CHANNELS = ["email", "sms", "push", "whatsapp", "other"];
const VALID_STATUSES = [
  "pending",
  "sent",
  "failed",
  "delivered",
  "opened",
  "clicked",
  "converted",
];

const CommunicationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: [true, "Campaign ID is required"],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
      index: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: VALID_STATUSES,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`
      },
      default: "pending",
      index: true,
    },
    channel: {
      type: String,
      required: [true, "Channel is required"],
      enum: {
        values: VALID_CHANNELS,
        message: `Channel must be one of: ${VALID_CHANNELS.join(", ")}`
      },
      default: "email",
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    openedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [500, "Failure reason cannot exceed 500 characters"],
      default: "",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "communication_logs",
    versionKey: false,
  }
);
 
CommunicationSchema.index({ campaignId: 1 });
CommunicationSchema.index({ customerId: 1 });
CommunicationSchema.index({ channel: 1 });
CommunicationSchema.index({ status: 1, sentAt: 1 });
 
CommunicationSchema.methods.toJSON = function () {
  const obj = this.toObject({ getters: true });
  delete obj.__v;
  delete obj.meta; 
  return obj;
};

const CommunicationLog = mongoose.model("Communication_Log", CommunicationSchema);

module.exports = CommunicationLog;