const mongoose = require("mongoose");

const SegmentSchema = new mongoose.Schema(
  {
    segmentName: {
      type: String,
      required: [true, "Segment name is required"],
      trim: true,
      minlength: [2, "Segment name must be at least 2 characters"],
      maxlength: [100, "Segment name cannot exceed 100 characters"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    criteria: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Segment criteria is required"],
      // Can be used to store rules for segmenting customers/orders (e.g., { minTotalSpent: 1000 })
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: "segments",
    versionKey: false,
  }
);

// Index for fast segment lookups
SegmentSchema.index({ segmentName: 1 });

SegmentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Segment = mongoose.model("Segment", SegmentSchema);

module.exports = Segment;