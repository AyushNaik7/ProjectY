const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["earning", "withdrawal"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    reference: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
