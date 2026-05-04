const instagramService = require("../services/instagramService");

async function getProfile(req, res, next) {
  try {
    const data = await instagramService.getInstagramProfile();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function getPosts(req, res, next) {
  try {
    const data = await instagramService.getInstagramPosts();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function getInsights(req, res, next) {
  try {
    const data = await instagramService.getInstagramInsights();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  getPosts,
  getInsights,
};