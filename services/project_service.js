const Project = require("../models/project_model");
const Student = require("../models/student_model");
const Subject = require("../models/subjects_model");
const Admin = require("../models/admin_model");

// Create a new project (admin only)
const createProject = async (projectData) => {
  try {
    // Validate that the referenced admin and subject exist
    const admin = await Admin.findById(projectData.createdBy);
    if (!admin) throw new Error("Admin not found");
    const subject = await Subject.findById(projectData.subject);
    if (!subject) throw new Error("Subject not found");

    const newProject = new Project(projectData);
    await newProject.save();
    return newProject;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all non‑deleted projects
const getAllProjects = async () => {
  try {
    return await Project.find({ isDeleted: false })
      .populate("subject")
      .populate("createdBy", "firstName lastName email")
      .populate("purchasedBy", "firstName lastName email school");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get a single project by ID
const getProjectById = async (id) => {
  try {
    const project = await Project.findOne({ _id: id, isDeleted: false })
      .populate("subject")
      .populate("createdBy", "firstName lastName email")
      .populate("purchasedBy", "firstName lastName email school");
    if (!project) throw new Error("Project not found");
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all projects for a given subject
const getProjectsBySubjectId = async (subjectId) => {
  try {
    return await Project.find({ subject: subjectId, isDeleted: false })
      .populate("subject")
      .populate("createdBy", "firstName lastName email")
      .populate("purchasedBy", "firstName lastName email school");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update a project (admin only)
const updateProject = async (id, updateData) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("subject")
      .populate("createdBy")
      .populate("purchasedBy");
    if (!updatedProject) throw new Error("Project not found");
    return updatedProject;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Soft delete a project (admin only)
const deleteProject = async (id) => {
  try {
    const project = await Project.findById(id);
    if (!project) throw new Error("Project not found");
    project.isDeleted = true;
    project.deletedAt = new Date();
    await project.save();
    return { message: "Project deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Purchase a project (student only) – enforces one‑per‑school rule
const purchaseProject = async (projectId, studentId) => {
  try {
    // Fetch project and student
    const project = await Project.findOne({ _id: projectId, isDeleted: false });
    if (!project) throw new Error("Project not found");

    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    // Check if this student already purchased
    if (project.purchasedBy.includes(studentId)) {
      throw new Error("You have already purchased this project");
    }

    // Get schools of all students who have already purchased this project
    const purchasedStudents = await Student.find({
      _id: { $in: project.purchasedBy },
    }).select("school");

    const schools = purchasedStudents.map((s) => s.school);
    if (schools.includes(student.school)) {
      throw new Error(
        "A student from your school has already purchased this project",
      );
    }

    // Add student to purchasedBy array and set payment status
    project.purchasedBy.push(studentId);
    project.paymentStatus = true;
    await project.save();

    // Return updated project with populated fields
    return await Project.findById(projectId)
      .populate("subject")
      .populate("createdBy", "firstName lastName email")
      .populate("purchasedBy", "firstName lastName email school");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get purchased projects for a specific student
const getPurchasedProjectsByStudent = async (studentId) => {
  try {
    return await Project.find({ purchasedBy: studentId, isDeleted: false })
      .populate("subject")
      .populate("createdBy", "firstName lastName email")
      .populate("purchasedBy", "firstName lastName email school");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Optional: get projects by level
const getProjectsByLevel = async (level) => {
  try {
    return await Project.find({ level, isDeleted: false })
      .populate("subject")
      .populate("createdBy", "firstName lastName email")
      .populate("purchasedBy", "firstName lastName email school");
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getProjectsBySubjectId,
  updateProject,
  deleteProject,
  purchaseProject,
  getPurchasedProjectsByStudent,
  getProjectsByLevel,
};
