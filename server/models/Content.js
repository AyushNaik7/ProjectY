const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["uploaded", "approved", "rejected"], default: "uploaded" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Content || mongoose.model("Content", contentSchema);
