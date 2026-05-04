const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
