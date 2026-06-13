const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^(\+?\d{1,3}[- ]?)?\d{10}$/,
        "Please provide a valid phone number",
      ],
      maxlength: [20, "Phone number can't exceed 20 characters"],
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
      maxlength: [50, "City name too long"],
    },
    totalSpent: {
      type: Number,
      min: [0, "Total spent cannot be negative"],
      default: 0,
    },
    lastOrderDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
    collection: "customers",
    versionKey: false,
  }
);
 
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
 
CustomerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;