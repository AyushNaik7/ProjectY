const Payment = require("../models/Payment");

async function getPayments(req, res, next) {
  try {
    const payments = await Payment.find({ userId: req.user.sub }).sort({ createdAt: -1 });
    return res.status(200).json({ payments });
  } catch (error) {
    return next(error);
  }
}

async function withdraw(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid withdrawal amount is required" });
    }

    const payment = await Payment.create({
      userId: req.user.sub,
      amount,
      type: "withdrawal",
      status: "pending",
      reference: `wd-${Date.now()}`,
    });

    return res.status(201).json({ success: true, payment });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getPayments, withdraw };
