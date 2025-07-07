const express = require('express');
const router = express.Router();
const { Paynow } = require("paynow");
const PaymentModel = require('../models/payment_model'); // updated model import
const WalletModel = require('../models/wallet_model'); // Import your wallet model

const paynow = new Paynow("21043", "2bf0dd63-0c72-42c4-a601-0fa85e63c587");
paynow.resultUrl = "http://example.com/gateways/paynow/update";
paynow.returnUrl = "http://example.com/return?gateway=paynow&merchantReference=1234";

// 🧾 Helper to generate random reference
const generateReference = () => `REF-${Math.floor(100000 + Math.random() * 900000)}`;

// 💻 Web Payment
router.post('/web-paynow-me', async (req, res) => {
    try {
        const { student_id, amount, description, method } = req.body;

        const reference = generateReference();
        const receiptId = `RECEIPT-${Math.floor(100000 + Math.random() * 900000)}`;

        const payment = paynow.createPayment(reference, "test@example.com");
        payment.add(description || "Payment for Course", amount);

        paynow.send(payment).then(async (response) => {
            if (response.success) {
                const newPayment = new PaymentModel({
                    student_id,
                    amount,
                    method,
                    reference,
                    receiptId,
                    status: "pending",
                    paymentStatus: "initiated",
                    pollUrl: response.pollUrl,
                    description,
                });

                await newPayment.save();
                res.json({ redirectURL: response.redirectUrl, pollUrl: response.pollUrl });
            } else {
                res.status(500).json({ error: response.errors });
            }
        }).catch(error => {
            res.status(500).json({ error: error.message });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 📱 Mobile Payment
const processMobilePayment = async (req, res, method) => {
    try {
        const { student_id, amount, description, customerPhoneNumber } = req.body;

        // 🔍 Basic input validation
        if (!student_id || !amount || !customerPhoneNumber || !method) {
            console.error("❌ Missing required fields:", req.body);
            return res.status(400).json({ 
                error: "Missing required fields: student_id, amount, customerPhoneNumber, or method." 
            });
        }

        const reference = generateReference();
        const receiptId = `RECEIPT-${Math.floor(100000 + Math.random() * 900000)}`;

        const payment = paynow.createPayment(reference, "totoacademyonline@gmail.com");
        payment.add(description || "Mobile Payment", amount);

        let response;
        try {
            // ⏳ Attempt mobile payment via Paynow API
            response = await paynow.sendMobile(payment, customerPhoneNumber, method);
            console.log("📨 Paynow response:", response);
        } catch (apiError) {
            console.error("❌ Paynow API error:", apiError);
            return res.status(502).json({ error: "Failed to initiate payment with Paynow", details: apiError.message });
        }

        if (response.success) {
            const newPayment = new PaymentModel({
                student_id,
                amount,
                method,
                reference,
                receiptId,
                status: "pending",
                paymentStatus: "initiated",
                pollUrl: response.pollUrl,
                description,
            });

            await newPayment.save();
            console.log("✅ Payment saved successfully:", newPayment);

            res.json({ pollUrl: response.pollUrl, reference });
        } else {
            console.error("❌ Paynow responded with error:", response.errors);
            res.status(500).json({ error: "Paynow rejected the request", details: response.errors });
        }
    } catch (error) {
        console.error("❌ Unexpected server error:", error);
        res.status(500).json({ error: "Server encountered an unexpected error", details: error.message });
    }
};

router.post('/mobile-ecocash-paynow-me', (req, res) => processMobilePayment(req, res, 'ecocash'));
router.post('/mobile-netone-paynow-me', (req, res) => processMobilePayment(req, res, Paynow.Methods.ONEMONEY));
router.post('/mobile-telone-paynow-me', (req, res) => processMobilePayment(req, res, Paynow.Methods.TELECASH));

// 📦 Check Payment Status (Updated)
router.post('/check-status', async (req, res) => {
    try {
        const { pollUrl } = req.body;
        const status = await paynow.pollTransaction(pollUrl);

        // Find payment first to get student ID
        const payment = await PaymentModel.findOne({ pollUrl });
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        if (status.status === "paid") {
            // 1. Update payment status
            await PaymentModel.findOneAndUpdate(
                { pollUrl },
                { paymentStatus: "paid", status: "completed" }
            );

            // 2. Update wallet
            const wallet = await WalletModel.findOne({ student: payment.student_id });
            if (!wallet) {
                return res.status(404).json({ message: "Wallet not found for student" });
            }

            // Find the deposit transaction
            const depositIndex = wallet.deposits.findIndex(
                deposit => deposit.pollUrl === pollUrl && deposit.status === "pending"
            );

            if (depositIndex === -1) {
                return res.status(404).json({ message: "Pending deposit transaction not found" });
            }

            // Update transaction status and balance
            wallet.deposits[depositIndex].status = "completed";
            wallet.balance += wallet.deposits[depositIndex].amount;
            wallet.lastUpdated = new Date();

            await wallet.save();

            return res.status(200).json({ 
                status: "paid", 
                message: "Payment successful. Wallet updated",
                newBalance: wallet.balance
            });

        } else if (status.status === "created") {
            return res.status(202).json({ status: "created", message: "Transaction created, no payment yet." });
        
        } else if (status.status === "cancelled") {
            await PaymentModel.findOneAndUpdate(
                { pollUrl }, 
                { paymentStatus: "cancelled", status: "failed" }
            );
            return res.status(202).json({ status: "cancelled", message: "Transaction cancelled." });
        
        } else if (status.status === "sent") {
            return res.status(202).json({ status: "sent", message: "Awaiting client action." });
        
        } else {
            await PaymentModel.findOneAndUpdate(
                { pollUrl }, 
                { paymentStatus: "failed", status: "failed" }
            );
            return res.status(400).json({ status: status.status, message: "Unknown or failed transaction." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔍 Get All Payments by student_id (Remains unchanged)
router.get('/payments/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const payments = await PaymentModel.find({ student_id: studentId });

        if (payments.length === 0) {
            return res.status(404).json({ message: "No payment history found for this student." });
        }

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving payment history.", details: error.message });
    }
});

module.exports = router;
