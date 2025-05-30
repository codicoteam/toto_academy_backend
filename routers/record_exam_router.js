const express = require("express");
const router = express.Router();
const recordExamService = require("../services/record_exam");
const { authenticateToken } = require("../middlewares/auth");

// Create new record exam
router.post("/", authenticateToken, async (req, res) => {
  try {
    const newRecordExam = await recordExamService.createRecordExam(req.body);
    res.status(201).json({ 
      message: "Record exam created successfully", 
      data: newRecordExam 
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Failed to create record exam", 
      error: error.message 
    });
  }
});

// Get all record exams
router.get("/", authenticateToken, async (req, res) => {
  try {
    const recordExams = await recordExamService.getAllRecordExams();
    res.status(200).json({ 
      message: "Record exams retrieved successfully", 
      data: recordExams 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to retrieve record exams", 
      error: error.message 
    });
  }
});

// Get record exam by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const recordExam = await recordExamService.getRecordExamById(req.params.id);
    res.status(200).json({ 
      message: "Record exam retrieved successfully", 
      data: recordExam 
    });
  } catch (error) {
    res.status(404).json({ 
      message: "Record exam not found", 
      error: error.message 
    });
  }
});

// Update record exam by ID
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedRecordExam = await recordExamService.updateRecordExam(
      req.params.id, 
      req.body
    );
    res.status(200).json({ 
      message: "Record exam updated successfully", 
      data: updatedRecordExam 
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Failed to update record exam", 
      error: error.message 
    });
  }
});

// Delete record exam by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await recordExamService.deleteRecordExam(req.params.id);
    res.status(200).json({ 
      message: "Record exam deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete record exam", 
      error: error.message 
    });
  }
});

// Get record exams by student ID
router.get("/student/:studentId", authenticateToken, async (req, res) => {
  try {
    const recordExams = await recordExamService.getRecordExamsByStudentId(
      req.params.studentId
    );
    res.status(200).json({ 
      message: "Record exams retrieved successfully", 
      data: recordExams 
    });
  } catch (error) {
    res.status(404).json({ 
      message: error.message.includes("found") ? error.message : "Failed to retrieve record exams",
      error: error.message 
    });
  }
});

// Delete record exams by student ID
router.delete("/student/:studentId", authenticateToken, async (req, res) => {
  try {
    const result = await recordExamService.deleteRecordExamsByStudentId(
      req.params.studentId
    );
    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} record exams for student`,
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete record exams", 
      error: error.message 
    });
  }
});

// Get record exams by exam ID
router.get("/exam/:examId", authenticateToken, async (req, res) => {
  try {
    const recordExams = await recordExamService.getRecordExamsByExamId(
      req.params.examId
    );
    res.status(200).json({ 
      message: "Record exams retrieved successfully", 
      data: recordExams 
    });
  } catch (error) {
    res.status(404).json({ 
      message: error.message.includes("found") ? error.message : "Failed to retrieve record exams",
      error: error.message 
    });
  }
});

// Delete record exams by exam ID
router.delete("/exam/:examId", authenticateToken, async (req, res) => {
  try {
    const result = await recordExamService.deleteRecordExamsByExamId(
      req.params.examId
    );
    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} record exams for exam`,
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete record exams", 
      error: error.message 
    });
  }
});


router.get("/last/:studentId/:examId", authenticateToken, async (req, res) => {
  try {
    const recordExam = await recordExamService.findOneLastByStudentIdAndExamId(
      req.params.studentId,
      req.params.examId
    );
    res.status(200).json({ 
      message: "Last record exam retrieved successfully", 
      data: recordExam 
    });
  } catch (error) {
    res.status(404).json({ 
      message: error.message.includes("found") ? error.message : "Failed to retrieve record exam",
      error: error.message 
    });
  }
});

module.exports = router;