const express = require("express");
const {
  getCampaigns,
  applyToCampaign,
  updateCampaignStatus,
} = require("../controllers/campaignController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getCampaigns);
router.post("/apply", protect, applyToCampaign);
router.patch("/:id", protect, updateCampaignStatus);

module.exports = router;
