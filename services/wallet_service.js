const Wallet = require("../models/wallet_model");

// Create wallet for a student
const createWallet = async (walletData) => {
  try {
    const existingWallet = await Wallet.findOne({
      student: walletData.student,
    });
    if (existingWallet) {
      throw new Error("Wallet already exists for this student");
    }

    const newWallet = new Wallet(walletData);
    await newWallet.save();
    return newWallet;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all wallets
const getAllWallets = async () => {
  try {
    return await Wallet.find().populate("student");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get wallet by student ID
const getWalletByStudentId = async (studentId) => {
  try {
    return await Wallet.findOne({ student: studentId }).populate("student");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update wallet balance or transactions
const updateWallet = async (id, updateData) => {
  try {
    const updatedWallet = await Wallet.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedWallet) throw new Error("Wallet not found");
    return updatedWallet;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a wallet
const deleteWallet = async (id) => {
  try {
    const deletedWallet = await Wallet.findByIdAndDelete(id);
    if (!deletedWallet) throw new Error("Wallet not found");
    return deletedWallet;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Deposit money into wallet
const depositToWallet = async (studentId, depositData) => {
  try {
    const wallet = await Wallet.findOne({ student: studentId });
    if (!wallet) throw new Error("Wallet not found");

    // Check for duplicate pollUrl if provided
    if (depositData.pollUrl) {
      const duplicate = wallet.deposits.find(
        (tx) => tx.pollUrl === depositData.pollUrl
      );
      if (duplicate) {
        throw new Error("Payment already exists");
      }
    }

    const transaction = {
      ...depositData,
      type: "deposit",
      status: depositData.status || "pending",
      date: new Date(),
    };

    // Always push the transaction
    wallet.deposits.push(transaction);

    // Only update balance if status is "completed"
    if (transaction.status === "completed") {
      wallet.balance += transaction.amount;
    }

    wallet.lastUpdated = new Date();
    await wallet.save();

    return wallet;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Withdraw money from wallet
const withdrawFromWallet = async (studentId, withdrawalData) => {
  try {
    const wallet = await Wallet.findOne({ student: studentId });
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.balance < withdrawalData.amount) {
      throw new Error("Insufficient balance");
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const transaction = {
      ...withdrawalData,
      type: "withdrawal",
      status: withdrawalData.status || "completed",
      date: new Date(),
      expiresAt: expiresAt,
      isExpired: false,
    };

    wallet.withdrawals.push(transaction);
    wallet.balance -= transaction.amount;
    wallet.lastUpdated = new Date();

    await wallet.save();
    return wallet;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Check and expire withdrawals
const checkExpiredWithdrawals = async () => {
  try {
    const now = new Date();

    const wallets = await Wallet.find({
      "withdrawals.expiresAt": { $lte: now },
      "withdrawals.isExpired": false,
    });

    for (const wallet of wallets) {
      let balanceToRestore = 0;

      for (const withdrawal of wallet.withdrawals) {
        if (withdrawal.expiresAt <= now && !withdrawal.isExpired) {
          withdrawal.isExpired = true;
          withdrawal.status = "expired";
          balanceToRestore += withdrawal.amount;
        }
      }

      if (balanceToRestore > 0) {
        wallet.balance += balanceToRestore;
        wallet.lastUpdated = new Date();
        await wallet.save();
      }
    }

    return { message: "Expired withdrawals processed successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get expired withdrawals for a student
const getExpiredWithdrawals = async (studentId) => {
  try {
    const wallet = await Wallet.findOne({ student: studentId });
    if (!wallet) throw new Error("Wallet not found");

    const expiredWithdrawals = wallet.withdrawals.filter(
      (withdrawal) => withdrawal.isExpired === true
    );

    return expiredWithdrawals;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get active (non-expired) withdrawals for a student
const getActiveWithdrawals = async (studentId) => {
  try {
    const wallet = await Wallet.findOne({ student: studentId });
    if (!wallet) throw new Error("Wallet not found");

    const activeWithdrawals = wallet.withdrawals.filter(
      (withdrawal) => withdrawal.isExpired === false
    );

    return activeWithdrawals;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get wallet dashboard data
const getWalletDashboardData = async () => {
  try {
    const wallets = await Wallet.find().populate("student");

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalExpiredWithdrawals = 0;
    let totalTransactions = 0;

    wallets.forEach((wallet) => {
      const depositSum = wallet.deposits.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      const withdrawalSum = wallet.withdrawals.reduce(
        (sum, tx) => sum + (tx.isExpired ? 0 : tx.amount),
        0
      );
      const expiredSum = wallet.withdrawals.reduce(
        (sum, tx) => sum + (tx.isExpired ? tx.amount : 0),
        0
      );

      totalDeposits += depositSum;
      totalWithdrawals += withdrawalSum;
      totalExpiredWithdrawals += expiredSum;
      totalTransactions += wallet.deposits.length + wallet.withdrawals.length;
    });

    const latestWallets = wallets
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 3);

    return {
      totalDeposits,
      totalWithdrawals,
      totalExpiredWithdrawals,
      totalTransactions,
      walletCount: wallets.length,
      latestWallets,
    };
  } catch (error) {
    throw new Error("Failed to get wallet dashboard data: " + error.message);
  }
};

module.exports = {
  createWallet,
  getAllWallets,
  getWalletByStudentId,
  updateWallet,
  deleteWallet,
  depositToWallet,
  withdrawFromWallet,
  checkExpiredWithdrawals,
  getExpiredWithdrawals,
  getActiveWithdrawals,
  getWalletDashboardData,
};
