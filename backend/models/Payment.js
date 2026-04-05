const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ tenant: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
