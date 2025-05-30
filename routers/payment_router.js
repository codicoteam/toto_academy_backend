const express = require("express");
const router = express.Router();
const PaymentService = require("../services/payment_service");

// Create a new payment
router.post("/payments", async (req, res) => {
  try {
    const result = await PaymentService.makePayment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment by ID
router.get("/payments/:id", async (req, res) => {
  try {
    const payment = await PaymentService.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments by student ID
router.get("/students/:studentId/payments", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await PaymentService.getPaymentsByStudentId(
      req.params.studentId,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments by status
router.get("/payments/status/:status", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await PaymentService.getPaymentsByStatus(
      req.params.status,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent payments
router.get("/payments/recent", async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const payments = await PaymentService.getRecentPayments(parseInt(limit));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment statistics
router.get("/payments/stats", async (req, res) => {
  try {
    const stats = await PaymentService.getPaymentStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update payment status
router.patch("/payments/:id/status", async (req, res) => {
  try {
    const result = await PaymentService.updatePaymentStatus(
      req.params.id,
      req.body.status
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Handle Paynow webhook
router.post("/payments/webhook", async (req, res) => {
  try {
    const { pollUrl, status } = req.body;
    const result = await PaymentService.findByPollUrlAndUpdate(pollUrl, status);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;