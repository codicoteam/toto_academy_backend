const PayCourse = require("../models/payment_model");
const Paynow = require("paynow");

// Initialize Paynow
const paynow = new Paynow("20035", "57832f6f-bd15-4877-81be-c8e30e390a88");

// Create a new payment
const makePayment = async (paymentData) => {
  try {
    // Validate input
    if (!paymentData.student_id || !paymentData.amount || !paymentData.method) {
      throw new Error("Student ID, amount, and payment method are required");
    }

    // Create a new payment instance
    const newPayment = new PayCourse(paymentData);
    await newPayment.save();

    // Create Paynow transaction if needed (for online payments)
    if (paymentData.method === 'ecocash' || paymentData.method === 'inn bucks') {
      let payment = paynow.createPayment(
        newPayment.description || "Course Payment",
        newPayment.student_id.email // Assuming student has email
      );
      payment.add(newPayment.description || "Item", newPayment.amount);

      // Send to Paynow
      let response = await paynow.send(payment);
      if (response.success) {
        newPayment.pollUrl = response.pollUrl;
        newPayment.paymentStatus = "processing";
        await newPayment.save();
        return { 
          message: "Payment initiated", 
          payment: await getPaymentById(newPayment._id) 
        };
      } else {
        throw new Error("Failed to initiate payment with Paynow");
      }
    }

    return { 
      message: "Payment created", 
      payment: await getPaymentById(newPayment._id) 
    };
  } catch (error) {
    console.error("Payment error:", error);
    throw new Error(error.message || "Failed to process payment");
  }
};

// Get payment by ID with student details populated
const getPaymentById = async (paymentId) => {
  try {
    const payment = await PayCourse.findById(paymentId)
      .populate('student_id', 'name email phone')
      .exec();
      
    if (!payment) throw new Error(`Payment with ID ${paymentId} not found`);
    return payment;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch payment");
  }
};

// Get payments by student ID with pagination
const getPaymentsByStudentId = async (studentId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const payments = await PayCourse.find({ student_id: studentId })
      .populate('student_id', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await PayCourse.countDocuments({ student_id: studentId });

    return {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch student payments");
  }
};

// Get payments by status
const getPaymentsByStatus = async (status, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const payments = await PayCourse.find({ status })
      .populate('student_id', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await PayCourse.countDocuments({ status });

    return {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to fetch payments by status");
  }
};

// Get recent payments with student details
const getRecentPayments = async (limit = 5) => {
  try {
    return await PayCourse.find()
      .populate('student_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch recent payments");
  }
};

// Get payment statistics
const getPaymentStats = async () => {
  try {
    const stats = await PayCourse.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          completedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalPayments: 1,
          totalAmount: 1,
          completedPayments: 1,
          pendingPayments: 1
        }
      }
    ]);

    return stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      completedPayments: 0,
      pendingPayments: 0
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch payment statistics");
  }
};

// Update payment status
const updatePaymentStatus = async (paymentId, status) => {
  try {
    const validStatuses = ["pending", "completed", "failed"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status value");
    }

    const payment = await PayCourse.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    ).populate('student_id', 'name email');

    if (!payment) throw new Error(`Payment with ID ${paymentId} not found`);

    return { 
      message: "Payment status updated successfully", 
      payment 
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to update payment status");
  }
};

// Find by pollUrl and update
const findByPollUrlAndUpdate = async (pollUrl, status) => {
  try {
    const payment = await PayCourse.findOneAndUpdate(
      { pollUrl },
      { 
        status: status === 'paid' ? 'completed' : 'failed',
        paymentStatus: status 
      },
      { new: true }
    ).populate('student_id', 'name email');

    if (!payment) throw new Error(`Payment with pollUrl ${pollUrl} not found`);

    return { 
      message: "Payment status updated successfully", 
      payment 
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to update payment status");
  }
};

module.exports = {
  makePayment,
  getPaymentById,
  getPaymentsByStudentId,
  getPaymentsByStatus,
  getRecentPayments,
  getPaymentStats,
  updatePaymentStatus,
  findByPollUrlAndUpdate,
};