const mongoose = require("mongoose");

// Customer schema — XENO platform ka core entity
// Har customer ka profile, spend history aur last order track hota hai
const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true, // extra spaces hata do
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true, // duplicate email allow nahi — campaigns ke liye zaroori
      trim: true,
      lowercase: true, // email hamesha lowercase me store
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
      default: 0, // naya customer — abhi kuch spend nahi kiya
    },
    lastOrderDate: {
      type: Date,
      default: null, // jab tak order nahi, null rahega
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto manage
    collection: "customers",
    versionKey: false, // __v field nahi chahiye response me
  }
);

// Indexes — fast lookup ke liye (email unique se already indexed hai)
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ city: 1 }); // city filter queries fast karega
CustomerSchema.index({ createdAt: -1 }); // latest customers pehle

// Response se __v hata do (extra safety)
CustomerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
