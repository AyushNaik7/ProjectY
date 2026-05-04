const path = require("path");
const Content = require("../models/Content");

async function uploadContent(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "File is required" });

    const fileUrl = `/uploads/${path.basename(req.file.path)}`;

    const content = await Content.create({
      userId: req.user.sub,
      campaignId: req.body.campaignId || null,
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    return res.status(201).json({ success: true, content });
  } catch (error) {
    return next(error);
  }
}

module.exports = { uploadContent };
