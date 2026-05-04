const express = require("express");
const instagramController = require("../controllers/instagramController");

const router = express.Router();

router.get("/profile", instagramController.getProfile);
router.get("/posts", instagramController.getPosts);
router.get("/insights", instagramController.getInsights);

module.exports = router;