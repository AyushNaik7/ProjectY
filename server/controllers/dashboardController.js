const Campaign = require("../models/Campaign");
const Payment = require("../models/Payment");
const User = require("../models/User");

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.sub;

    const [user, activeCampaigns, earnings] = await Promise.all([
      User.findById(userId),
      Campaign.countDocuments({
        $or: [{ brandId: userId }, { "applicants.userId": userId }],
        status: "active",
      }),
      Payment.aggregate([
        { $match: { userId: userId, type: "earning", status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalEarnings = earnings[0]?.total || 0;

    return res.status(200).json({
      stats: {
        totalEarnings,
        activeCampaigns,
        newFollowers: user?.followers || 0,
        engagementRate: user?.engagementRate || 0,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDashboard };
