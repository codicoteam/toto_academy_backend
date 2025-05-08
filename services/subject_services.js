const Subject = require("../models/subjects_model"); // Adjust the path as needed

// Create new subject
const createSubject = async (subjectData) => {
  try {
    const newSubject = new Subject(subjectData);
    await newSubject.save();
    return newSubject;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all subjects
const getAllSubjects = async () => {
  try {
    return await Subject.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get subject by ID
const getSubjectById = async (id) => {
  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      throw new Error("Subject not found");
    }
    return subject;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update subject by ID
const updateSubject = async (id, updateData) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedSubject) {
      throw new Error("Subject not found");
    }
    return updatedSubject;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete subject by ID
const deleteSubject = async (id) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      throw new Error("Subject not found");
    }
    return deletedSubject;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
