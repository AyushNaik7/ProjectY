const User = require("../models/User");

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const allowed = [
      "name",
      "niche",
      "followers",
      "avgViews",
      "engagementRate",
      "totalEarnings",
      "isOnline",
    ];

    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.sub, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getMe, updateMe };
