const PaymentModel = require("../models/payment_model");

class PaymentService {
  // Create a new payment
  static async createPayment(paymentData) {
    try {
      const payment = new PaymentModel(paymentData);
      return await payment.save();
    } catch (error) {
      throw error;
    }
  }

  // Get all payments
  static async getAllPayments() {
    try {
      return await PaymentModel.find({});
    } catch (error) {
      throw error;
    }
  }

  // Get payment by ID
  static async getPaymentById(paymentId) {
    try {
      return await PaymentModel.findById(paymentId);
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, newStatus) {
    try {
      return await PaymentModel.findByIdAndUpdate(
        paymentId,
        { status: newStatus },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete payment
  static async deletePayment(paymentId) {
    try {
      return await PaymentModel.findByIdAndDelete(paymentId);
    } catch (error) {
      throw error;
    }
  }

  // Additional business logic methods can be added here
  // Example: Get payments by status
  static async getPaymentsByStatus(status) {
    try {
      return await PaymentModel.find({ status });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentService;