const express = require("express");
const router = express.Router();
const subjectService = require("../services/subject_services"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new subject
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newSubject = await subjectService.createSubject(req.body);
    res
      .status(201)
      .json({ message: "Subject created successfully", data: newSubject });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create subject", error: error.message });
  }
});

// Get all subjects
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const subjectList = await subjectService.getAllSubjects();
    res
      .status(200)
      .json({ message: "Subjects retrieved successfully", data: subjectList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve subjects", error: error.message });
  }
});

router.get("/getallsubjects", async (req, res) => {
  try {
    const subjectList = await subjectService.getSubjectsForLandingPage();
    res
      .status(200)
      .json({ message: "Subjects retrieved successfully", data: subjectList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve subjects", error: error.message });
  }
});
// Get subject by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    res
      .status(200)
      .json({ message: "Subject retrieved successfully", data: subject });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Subject not found", error: error.message });
  }
});

// Update subject by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedSubject = await subjectService.updateSubject(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Subject updated successfully", data: updatedSubject });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update subject", error: error.message });
  }
});

// Delete subject by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await subjectService.deleteSubject(req.params.id);
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete subject", error: error.message });
  }
});

// Increment topicRequests by 1
router.post("/:id/topic-request", async (req, res) => {
  try {
    const subject = await subjectService.incrementTopicRequests(req.params.id);
    res.status(200).json(subject);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
