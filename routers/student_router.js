const express = require("express");
const router = express.Router();
const studentService = require("../services/student_service.js");
const { authenticateToken } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Student login by email
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await studentService.getStudentByEmail(email);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: student._id, email: student.email },
            "toto_academy_2025",
            { expiresIn: "96h" }
        );

        res.status(200).json({ message: "Login successful", token, data: student });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Student login by phone number
router.post("/loginbyphone", async (req, res) => {
    try {
        const { phone_number, password } = req.body;
        const student = await studentService.getStudentByPhoneNumber(phone_number);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: student._id, phone: student.phone_number },
            "toto_academy_2025",
            { expiresIn: "96h" }
        );

        res.status(200).json({ message: "Login successful", token, data: student });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Student signup
router.post("/signup", async (req, res) => {
    try {
        console.log("Received data:", req.body);
        const studentData = req.body;
        
        // Create the new student
        const newStudent = await studentService.createStudent(studentData);

        // Generate and send OTP
        try {
            const otpResult = await studentService.generateAndSendOTP(newStudent.phone_number);
            
            // Generate JWT token
            const token = jwt.sign(
                { id: newStudent._id, email: newStudent.email },
                "toto_academy_2025",
                { expiresIn: "96h" }
            );

            res.status(201).json({
                message: "Student registered successfully. OTP sent to your phone number. Please verify.",
                data: newStudent,
                token,
                otpInfo: {
                    success: otpResult.success,
                    message: otpResult.message
                }
            });
        } catch (otpError) {
            // If OTP sending fails, still return success but with a warning
            const token = jwt.sign(
                { id: newStudent._id, email: newStudent.email },
                "toto_academy_2025",
                { expiresIn: "96h" }
            );

            res.status(201).json({
                message: "Student registered successfully but OTP could not be sent",
                data: newStudent,
                token,
                otpInfo: {
                    success: false,
                    message: otpError.message
                },
                warning: "Please request OP manually later for phone verification"
            });
        }
    } catch (error) {
        if (error.message === "Email already exists") {
            return res.status(409).json({ message: "Email already exists" });
        }
        res.status(400).json({ 
            message: "Error registering student", 
            error: error.message 
        });
    }
});

// Get all students
router.get("/getallstudents", authenticateToken, async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        res.status(200).json({ message: "Students retrieved successfully", data: students });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving students", error: error.message });
    }
});

// Get student by email
router.get("/getstudent/:email", authenticateToken, async (req, res) => {
    try {
        const student = await studentService.getStudentByEmail(req.params.email);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student retrieved successfully", data: student });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving student", error: error.message });
    }
});

// Update student
router.put("/updatestudent/:id", authenticateToken, async (req, res) => {
    try {
        const updatedStudent = await studentService.updateStudent(req.params.id, req.body);
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student updated successfully", data: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: "Error updating student", error: error.message });
    }
});

// Delete student
router.delete("/deletestudent/:id", authenticateToken, async (req, res) => {
    try {
        await studentService.deleteStudent(req.params.id);
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting student", error: error.message });
    }
});

// Send OTP to student's phone number
router.post("/send-otp", async (req, res) => {
    try {
        const { phone_number } = req.body;
        const result = await studentService.generateAndSendOTP(phone_number);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone_number, otpCode } = req.body;
        const result = await studentService.verifyOTP(phone_number, otpCode);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Forgot password - Request OTP
router.post("/forgot_password", async (req, res) => {
    try {
        const { email } = req.body;
        const result = await studentService.generateAndSendPasswordResetOTP(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Verify password reset OTP
router.post("/verify-reset-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await studentService.verifyPasswordResetOTP(email, otp);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Reset password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await studentService.resetPassword(email, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Dashboard stats
router.get("/dashboard", authenticateToken, async (req, res) => {
    try {
        const dashboardStats = await studentService.getDashboardStats();
        res.status(200).json({
            message: "Dashboard data retrieved successfully",
            data: dashboardStats
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve dashboard stats",
            error: error.message
        });
    }
});


// Get students with pending profile pictures (admin only)
router.get("/pending-profile-pictures", authenticateToken, async (req, res) => {
  try {
    const students = await studentService.getStudentsWithPendingProfilePictures();
    res.status(200).json({
      message: "Students with pending profile pictures retrieved successfully",
      data: students
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving students with pending profile pictures",
      error: error.message
    });
  }
});

// Approve profile picture (admin only)
router.put("/approve-profile-picture/:id", authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedStudent = await studentService.approveProfilePicture(studentId);
    
    res.status(200).json({
      message: "Profile picture approved successfully",
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({
      message: "Error approving profile picture",
      error: error.message
    });
  }
});

// Reject profile picture with reason (admin only)
router.put("/reject-profile-picture/:id", authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({
        message: "Rejection reason is required"
      });
    }
    
    const updatedStudent = await studentService.rejectProfilePicture(studentId, rejection_reason);
    
    res.status(200).json({
      message: "Profile picture rejected successfully",
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({
      message: "Error rejecting profile picture",
      error: error.message
    });
  }
});

// Update profile picture (student use)
router.put("/update-profile-picture/:id", authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { profile_picture_url } = req.body;
    
    if (!profile_picture_url) {
      return res.status(400).json({
        message: "Profile picture URL is required"
      });
    }
    
    const updatedStudent = await studentService.updateProfilePicture(studentId, profile_picture_url);
    
    res.status(200).json({
      message: "Profile picture updated successfully and submitted for approval",
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating profile picture",
      error: error.message
    });
  }
});


module.exports = router;