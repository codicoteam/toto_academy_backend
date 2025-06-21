const PayCourse = require("../models/payment_model");
const { Paynow } = require("paynow");

// Initialize Paynow
const paynow = new Paynow("21043", "2bf0dd63-0c72-42c4-a601-0fa85e63c587");

// Create a new payment
const makePayment = async (paymentData) => {
  try {
    // Validate input
    if (!paymentData.customerEmail || !paymentData.price) {
      throw new Error("Invalid payment data provided");
    }

    // Create a new payment instance
    const newPayment = new PayCourse(paymentData);
    await newPayment.save();

    // Create Paynow transaction
    let payment = paynow.createPayment(
      newPayment.title,
      newPayment.customerEmail
    );
    payment.add(newPayment.title, newPayment.price);

    // Send to Paynow
    let response = await paynow.send(payment);
    if (response.success) {
      newPayment.pollUrl = response.pollUrl;
      await newPayment.save();
      return { message: "Payment initiated", pollUrl: response.pollUrl };
    } else {
      throw new Error("Failed to initiate payment with Paynow");
    }
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to process payment");
  }
};

// Edit an existing payment
const editPayment = async (paymentId, updateData) => {
  try {
    const payment = await PayCourse.findById(paymentId);
    if (!payment) throw new Error(`Payment with ID ${paymentId} not found`);

    // Update fields
    Object.assign(payment, updateData);
    await payment.save();

    return { message: "Payment updated successfully", payment };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to update payment");
  }
};

// Delete a payment
const deletePayment = async (paymentId) => {
  try {
    const payment = await PayCourse.findById(paymentId);
    if (!payment) throw new Error(`Payment with ID ${paymentId} not found`);

    await PayCourse.findByIdAndDelete(paymentId);
    return { message: `Payment with ID ${paymentId} deleted successfully` };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to delete payment");
  }
};

// Get all payments
const getAllPayments = async () => {
  try {
    return await PayCourse.find();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch payments");
  }
};

// Get payments by customer email
const getPaymentsByCustomerEmail = async (customerEmail) => {
  try {
    if (!customerEmail) throw new Error("Invalid customer email provided");

    return await PayCourse.find({ customerEmail });
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch payments by email");
  }
};

// Find by pollUrl and update
const findByPollUrlAndUpdate = async (pollUrl) => {
  try {
    const payment = await PayCourse.findOne({ pollUrl });
    if (!payment) throw new Error(`Payment with pollUrl ${pollUrl} not found`);

    payment.isPaid = true;
    await payment.save();

    return { message: "Payment status updated successfully", payment };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to update payment status");
  }
};

module.exports = {
  makePayment,
  editPayment,
  deletePayment,
  getAllPayments,
  getPaymentsByCustomerEmail,
  findByPollUrlAndUpdate,
};