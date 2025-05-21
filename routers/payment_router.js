const express = require("express");
const router = express.Router();
const PaymentService = require("../services/payment_services");

// Create a new payment
router.post("/", async (req, res) => {
  try {
    const payment = await PaymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all payments
router.get("/", async (req, res) => {
  try {
    const payments = await PaymentService.getAllPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific payment
router.get("/:id", async (req, res) => {
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

// Update payment status
router.patch("/:id/status", async (req, res) => {
  try {
    const updatedPayment = await PaymentService.updatePaymentStatus(
      req.params.id,
      req.body.status
    );
    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a payment
router.delete("/:id", async (req, res) => {
  try {
    const deletedPayment = await PaymentService.deletePayment(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Additional routes can be added here
// Example: Get payments by status
router.get("/status/:status", async (req, res) => {
  try {
    const payments = await PaymentService.getPaymentsByStatus(req.params.status);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;