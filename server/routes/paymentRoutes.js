const express = require("express");
const { getPayments, withdraw } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getPayments);
router.post("/withdraw", protect, withdraw);

module.exports = router;
