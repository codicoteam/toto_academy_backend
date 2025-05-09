const express = require("express");
const router = express.Router();
const walletService = require("../services/wallet_service");
const { authenticateToken } = require("../middlewares/auth");

// Create wallet
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json({ message: "Wallet created", data: wallet });
  } catch (error) {
    const code = error.message.includes("exists") ? 409 : 400;
    res.status(code).json({ message: error.message });
  }
});

// Get all wallets
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const wallets = await walletService.getAllWallets();
    res.status(200).json({ message: "Wallets retrieved", data: wallets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get wallet by student ID
router.get("/student/:studentId", authenticateToken, async (req, res) => {
  try {
    const wallet = await walletService.getWalletByStudentId(req.params.studentId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.status(200).json({ message: "Wallet retrieved", data: wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update wallet
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedWallet = await walletService.updateWallet(req.params.id, req.body);
    res.status(200).json({ message: "Wallet updated", data: updatedWallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete wallet
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await walletService.deleteWallet(req.params.id);
    res.status(200).json({ message: "Wallet deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
