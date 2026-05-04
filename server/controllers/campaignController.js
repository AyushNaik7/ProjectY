const Campaign = require("../models/Campaign");

async function getCampaigns(req, res, next) {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.status(200).json({ campaigns });
  } catch (error) {
    return next(error);
  }
}

async function applyToCampaign(req, res, next) {
  try {
    const { campaignId } = req.body;
    if (!campaignId) return res.status(400).json({ error: "campaignId is required" });

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const already = campaign.applicants.some((a) => a.userId.toString() === req.user.sub);
    if (!already) {
      campaign.applicants.push({ userId: req.user.sub, status: "applied" });
      await campaign.save();
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
}

async function updateCampaignStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    const campaign = await Campaign.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getCampaigns, applyToCampaign, updateCampaignStatus };
