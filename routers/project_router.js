const express = require("express");
const router = express.Router();
const projectService = require("../services/project_service");
const { authenticateToken } = require("../middlewares/auth");

// Helper role checks (adjust according to your token payload)
const isAdmin = (req) => req.user && req.user.role === "admin";
const isStudent = (req) => req.user && req.user.role === "student";

// Create project (admin only)
router.post("/create", authenticateToken, async (req, res) => {

  try {
    const newProject = await projectService.createProject(req.body);
    res
      .status(201)
      .json({ message: "Project created successfully", data: newProject });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create project", error: error.message });
  }
});

// Get all projects (authenticated users)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res
      .status(200)
      .json({ message: "Projects retrieved successfully", data: projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve projects", error: error.message });
  }
});

// Get project by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res
      .status(200)
      .json({ message: "Project retrieved successfully", data: project });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Project not found", error: error.message });
  }
});

// Get projects by subject ID
router.get("/subject/:subjectId", authenticateToken, async (req, res) => {
  try {
    const projects = await projectService.getProjectsBySubjectId(
      req.params.subjectId,
    );
    res
      .status(200)
      .json({ message: "Projects retrieved by subject", data: projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve projects", error: error.message });
  }
});

// Update project (admin only)
router.put("/:id", authenticateToken, async (req, res) => {

  try {
    const updatedProject = await projectService.updateProject(
      req.params.id,
      req.body,
    );
    res
      .status(200)
      .json({ message: "Project updated successfully", data: updatedProject });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update project", error: error.message });
  }
});

// Soft delete project (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {

  try {
    const result = await projectService.deleteProject(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete project", error: error.message });
  }
});

// Purchase project (student only) – enforces one‑per‑school rule
router.post("/:id/purchase", authenticateToken, async (req, res) => {

  try {
    const studentId = req.user.id; // assumes token contains student id
    const project = await projectService.purchaseProject(
      req.params.id,
      studentId,
    );
    res
      .status(200)
      .json({ message: "Project purchased successfully", data: project });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to purchase project", error: error.message });
  }
});

// Get purchased projects for the authenticated student
router.get("/purchased/me", authenticateToken, async (req, res) => {

  try {
    const studentId = req.user.id;
    const projects =
      await projectService.getPurchasedProjectsByStudent(studentId);
    res
      .status(200)
      .json({
        message: "Purchased projects retrieved successfully",
        data: projects,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to retrieve purchased projects",
        error: error.message,
      });
  }
});

// Optional: get projects by level
router.get("/level/:level", authenticateToken, async (req, res) => {
  try {
    const projects = await projectService.getProjectsByLevel(req.params.level);
    res
      .status(200)
      .json({ message: "Projects retrieved by level", data: projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve projects", error: error.message });
  }
});

module.exports = router;
