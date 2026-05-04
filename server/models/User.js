const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["creator", "brand"], required: true },
    niche: { type: String, default: "" },
    followers: { type: Number, default: 0, min: 0 },
    avgViews: { type: Number, default: 0, min: 0 },
    engagementRate: { type: Number, default: 0, min: 0, max: 100 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    isOnline: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
