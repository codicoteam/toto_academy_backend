const express = require("express");
const router = express.Router();
const {
  getDashboardInfo,
  getWalletAnalytics,
  getStudentInfoOnLevel,
} = require("../services/dashboard_services");

const { authenticateToken } = require("../middlewares/auth");

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const dashboardData = await getDashboardInfo();
    res.status(200).json({
      status: "success",
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// New route for wallet analytics
router.get("/wallet-analytics", authenticateToken, async (req, res) => {
  try {
    const walletData = await getWalletAnalytics();
    res.status(200).json({
      status: "success",
      data: walletData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// New route for student level information
router.get("/student-level-info", authenticateToken, async (req, res) => {
  try {
    const { level, studentId } = req.query;

    // Validate required parameters
    if (!level || !studentId) {
      return res.status(400).json({
        status: "error",
        message: "Level and studentId are required query parameters",
      });
    }

    const studentInfo = await getStudentInfoOnLevel(level, studentId);
    res.status(200).json({
      status: "success",
      data: studentInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
