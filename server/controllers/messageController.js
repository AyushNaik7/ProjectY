const Message = require("../models/Message");

async function sendMessage(req, res, next) {
  try {
    const { campaignId, receiverId, content } = req.body;
    if (!campaignId || !receiverId || !content) {
      return res.status(400).json({ error: "campaignId, receiverId and content are required" });
    }

    const message = await Message.create({
      campaignId,
      senderId: req.user.sub,
      receiverId,
      content,
    });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    return next(error);
  }
}

async function getMessagesByCampaign(req, res, next) {
  try {
    const { campaignId } = req.params;
    const messages = await Message.find({ campaignId }).sort({ createdAt: 1 });
    return res.status(200).json({ messages });
  } catch (error) {
    return next(error);
  }
}

module.exports = { sendMessage, getMessagesByCampaign };
