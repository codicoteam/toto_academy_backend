const Exam = require("../models/exam_model"); // Adjust the path as needed

// Create new exam
const createExam = async (examData) => {
  try {
    const newExam = new Exam(examData);
    await newExam.save();
    return newExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all exams
const getAllExams = async () => {
  try {
    return await Exam.find()
      .populate("subject")
      .populate("Topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get exam by ID
const getExamById = async (id) => {
  try {
    const exam = await Exam.findById(id)
      .populate("subject")
      .populate("Topic");
    if (!exam) {
      throw new Error("Exam not found");
    }
    return exam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update exam by ID
const updateExam = async (id, updateData) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedExam) {
      throw new Error("Exam not found");
    }
    return updatedExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete exam by ID
const deleteExam = async (id) => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam) {
      throw new Error("Exam not found");
    }
    return deletedExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
};
