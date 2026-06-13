const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Order amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",   // In case you implement a Product model
          required: [true, "Product ID is required for each item"],
        },
        quantity: {
          type: Number,
          required: [true, "Item quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Product price at order time is required"],
          min: [0, "Price cannot be negative"],
        },
        name: {
          type: String,
          trim: true,
          required: false,
          maxlength: [100, "Product name cannot exceed 100 characters"],
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    shippingAddress: {
      street: { type: String, trim: true, maxlength: 200, default: "" },
      city: { type: String, trim: true, maxlength: 100, default: "" },
      state: { type: String, trim: true, maxlength: 100, default: "" },
      postalCode: { type: String, trim: true, maxlength: 20, default: "" },
      country: { type: String, trim: true, maxlength: 100, default: "" },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "upi", "wallet", "other"],
      default: "other",
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Transaction ID cannot exceed 100 characters"],
      sparse: true,
      unique: false,
    },
  },
  {
    timestamps: true,
    collection: "orders",
    versionKey: false,
  }
);

OrderSchema.index({ customerId: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;