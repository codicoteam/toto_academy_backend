const RecordExam = require("../models/record_exam"); // Adjust the path as needed

// Create new record exam
const createRecordExam = async (recordExamData) => {
  try {
    const newRecordExam = new RecordExam(recordExamData);
    await newRecordExam.save();
    return newRecordExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all record exams
const getAllRecordExams = async () => {
  try {
    return await RecordExam.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get record exam by ID
const getRecordExamById = async (id) => {
  try {
    const recordExam = await RecordExam.findById(id);
    if (!recordExam) {
      throw new Error("Record exam not found");
    }
    return recordExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update record exam by ID
const updateRecordExam = async (id, updateData) => {
  try {
    const updatedRecordExam = await RecordExam.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    
    if (!updatedRecordExam) {
      throw new Error("Record exam not found");
    }
    return updatedRecordExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete record exam by ID
const deleteRecordExam = async (id) => {
  try {
    const deletedRecordExam = await RecordExam.findByIdAndDelete(id);
    if (!deletedRecordExam) {
      throw new Error("Record exam not found");
    }
    return deletedRecordExam;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get record exams by student ID
const getRecordExamsByStudentId = async (studentId) => {
  try {
    const recordExams = await RecordExam.find({ studentId });
    
    if (!recordExams || recordExams.length === 0) {
      throw new Error("No record exams found for this student");
    }
    return recordExams;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete record exams by student ID
const deleteRecordExamsByStudentId = async (studentId) => {
  try {
    const result = await RecordExam.deleteMany({ studentId });
    if (result.deletedCount === 0) {
      throw new Error("No record exams found for this student");
    }
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get record exams by exam ID
const getRecordExamsByExamId = async (examId) => {
  try {
    const recordExams = await RecordExam.find({ ExamId: examId });
    
    if (!recordExams || recordExams.length === 0) {
      throw new Error("No record exams found for this exam");
    }
    return recordExams;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete record exams by exam ID
const deleteRecordExamsByExamId = async (examId) => {
  try {
    const result = await RecordExam.deleteMany({ ExamId: examId });
    if (result.deletedCount === 0) {
      throw new Error("No record exams found for this exam");
    }
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findOneLastByStudentIdAndExamId = async (studentId, examId) => {
  try {
    const recordExam = await RecordExam.findOne({ 
      studentId, 
      ExamId: examId 
    }).sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the most recent
    
    if (!recordExam) {
      throw new Error("No record exam found for this student and exam combination");
    }
    return recordExam;
  } catch (error) {
    throw new Error(error.message);
  }
};


// Get top 10 students by percentage for a specific exam
const getTopStudentsByExamId = async (examId) => {
  try {
    const recordExams = await RecordExam.find({ ExamId: examId })
      .populate('studentId') // Include student details

    if (!recordExams || recordExams.length === 0) {
      throw new Error("No record exams found for this exam");
    }

    // Process the results to ensure consistent percentage format
    const processedResults = recordExams.map(exam => ({
      ...exam.toObject(),
      percentange: exam.percentange.endsWith('%') 
        ? exam.percentange 
        : `${exam.percentange}%`
    }));

    return processedResults;
  } catch (error) {
    throw new Error(error.message);
  }
};



module.exports = {
  createRecordExam,
  getAllRecordExams,
  getRecordExamById,
  updateRecordExam,
  deleteRecordExam,
  getRecordExamsByStudentId,
  deleteRecordExamsByStudentId,
  getRecordExamsByExamId,
  deleteRecordExamsByExamId,
  findOneLastByStudentIdAndExamId,
  getTopStudentsByExamId
};