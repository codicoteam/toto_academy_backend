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
            { expiresIn: "8h" }
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
            { expiresIn: "8h" }
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
        const newStudent = await studentService.createStudent(studentData);

        const token = jwt.sign(
            { id: newStudent._id, email: newStudent.email },
            "toto_academy_2025",
            { expiresIn: "8h" }
        );

        res.status(201).json({
            message: "Student registered successfully",
            data: newStudent,
            token,
        });
    } catch (error) {
        if (error.message === "Email already exists") {
            return res.status(409).json({ message: "Email already exists" });
        }
        res.status(400).json({ message: "Error registering student", error: error.message });
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




//EMAIL SERVICE FOR STUDENTS

const emailService = require("../services/email_service");

//sending bulk email route
router.post("/send-bulk-email", authenticateToken, async (req, res) => {
    try {
      const students = await studentService.getAllStudents();
      
      if (!students.length) {
        return res.status(404).json({ message: "Oops No students found" });
      }
  
      const emails = students.map(s => s.email);
      const { subject, htmlContent } = req.body;
  
      const result = await emailService.sendBulkEmail(emails, subject, htmlContent);
      
      res.status(200).json({
        message: result.success ? "Emails processed" : "Some emails Not sent",
        details: result
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Email processing failed",
        error: error.message
      });
    }
  });

module.exports = router;
