const Wallet = require('../models/wallet_model');

// Create wallet for a student
const createWallet = async (walletData) => {
  try {
    const existingWallet = await Wallet.findOne({ student: walletData.student });
    if (existingWallet) {
      throw new Error('Wallet already exists for this student');
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
    return await Wallet.find().populate('student');
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get wallet by student ID
const getWalletByStudentId = async (studentId) => {
  try {
    return await Wallet.findOne({ student: studentId }).populate('student');
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update wallet balance or transactions
const updateWallet = async (id, updateData) => {
  try {
    const updatedWallet = await Wallet.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedWallet) throw new Error('Wallet not found');
    return updatedWallet;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a wallet
const deleteWallet = async (id) => {
  try {
    const deletedWallet = await Wallet.findByIdAndDelete(id);
    if (!deletedWallet) throw new Error('Wallet not found');
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
  
      const transaction = {
        ...depositData,
        type: "deposit",
        status: depositData.status || "completed",
        date: new Date(),
      };
  
      wallet.deposits.push(transaction);
      wallet.balance += transaction.amount;
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
  
      const transaction = {
        ...withdrawalData,
        type: "withdrawal",
        status: withdrawalData.status || "completed",
        date: new Date(),
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

module.exports = {
  createWallet,
  getAllWallets,
  getWalletByStudentId,
  updateWallet,
  deleteWallet,
  depositToWallet,
  withdrawFromWallet,
};
