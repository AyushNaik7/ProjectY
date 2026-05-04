const express = require("express");
const { sendMessage, getMessagesByCampaign } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:campaignId", protect, getMessagesByCampaign);

module.exports = router;
