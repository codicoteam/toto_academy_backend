// routes/admin_router.js
const express = require("express");
const router = express.Router();
const adminService = require("../services/admin_service.js");
const communityService = require("../services/community_service.js"); // <-- you referenced it
const { authenticateToken } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_fallback_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "96h";

// Login route to authenticate admin and return JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminService.getAdminForAuth(email);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _pw, __v, ...adminWithoutPassword } = admin.toObject();
    res.status(200).json({ message: "Login successful", token, admin: adminWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Signup (don’t return password)
router.post("/signup", async (req, res) => {
  try {
    const newAdmin = await adminService.createAdmin(req.body);

    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ message: "Admin registered successfully", data: newAdmin, token });
  } catch (error) {
    if (error.message === "Email already exists") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: "Error registering admin", error: error.message });
  }
});

// Secured: get all
router.get("/getalladmins", authenticateToken, async (_req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.status(200).json({ message: "Admins retrieved successfully", data: admins });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admins", error: error.message });
  }
});

// Secured: get by email (don’t leak password)
router.get("/getadmin/:email", authenticateToken, async (req, res) => {
  try {
    const admin = await adminService.getAdminByEmail(req.params.email);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json({ message: "Admin retrieved successfully", data: admin });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admin", error: error.message });
  }
});

// Update (hash handled in service when needed)
router.put("/updateadmin/:id", authenticateToken, async (req, res) => {
  try {
    const updatedAdmin = await adminService.updateAdmin(req.params.id, req.body);
    res.status(200).json({ message: "Admin updated successfully", data: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
});

// Delete
router.delete("/deleteadmin/:id", authenticateToken, async (req, res) => {
  try {
    await adminService.deleteAdmin(req.params.id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
});

// Get one by ID
router.get("/admins/:id", authenticateToken, async (req, res) => {
  try {
    const admin = await adminService.getAdminById(req.params.id);
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin", error: error.message });
  }
});

// Forgot password - Request OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await adminService.generateAndSendPasswordResetOTP(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Verify password reset OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await adminService.verifyPasswordResetOTP(email, otp);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Reset password (after OTP verification)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const result = await adminService.resetPassword(email, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Role-gated: create admin (ensure token includes role)
router.post("/create-admin", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "main admin") {
      return res.status(403).json({ message: "Access denied: Not authorized" });
    }
    const newAdmin = await adminService.createAdmin(req.body);
    res.status(201).json({ message: "New admin created successfully", data: newAdmin });
  } catch (error) {
    if (error.message === "Email already exists") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: "Error creating admin", error: error.message });
  }
});

// Community admin management (requires imported communityService)
router.post("/add-admin/:communityId", authenticateToken, async (req, res) => {
  try {
    const { adminId } = req.body;
    const updatedCommunity = await communityService.addAdminToCommunity(
      req.params.communityId,
      adminId
    );
    res.status(200).json({ message: "Admin added to community successfully", data: updatedCommunity });
  } catch (error) {
    res.status(400).json({ message: "Failed to add admin to community", error: error.message });
  }
});

router.post("/remove-admin/:communityId", authenticateToken, async (req, res) => {
  try {
    const { adminId } = req.body;
    const updatedCommunity = await communityService.removeAdminFromCommunity(
      req.params.communityId,
      adminId
    );
    res.status(200).json({ message: "Admin removed from community successfully", data: updatedCommunity });
  } catch (error) {
    res.status(400).json({ message: "Failed to remove admin from community", error: error.message });
  }
});

router.post("/remove-student/:communityId", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;
    const updatedCommunity = await communityService.removeStudentFromCommunity(
      req.params.communityId,
      studentId
    );
    res.status(200).json({ message: "Student removed from community successfully", data: updatedCommunity });
  } catch (error) {
    res.status(400).json({ message: "Failed to remove student from community", error: error.message });
  }
});

module.exports = router;
