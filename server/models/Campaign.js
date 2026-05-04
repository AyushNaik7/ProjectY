const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["applied", "pending", "accepted", "rejected"], default: "applied" },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10 },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    budget: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, min: 0 },
    timeline: { type: String, default: "" },
    status: { type: String, enum: ["active", "pending", "closed", "draft"], default: "active" },
    platform: { type: String, default: "Instagram" },
    niche: { type: String, default: "" },
    applicants: [applicantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);
