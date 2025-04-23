const Student = require('../models/student_model'); // Adjust the path as per your project structure

// Service to create a new student
const createStudent = async (studentData) => {
    try {
        // Check if email already exists
        const existingStudent = await Student.findOne({ email: studentData.email });
        if (existingStudent) {
            throw new Error('Email already exists');
        }

        // Create and save the new student
        const newStudent = new Student(studentData);
        await newStudent.save();
        return newStudent;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to get all students
const getAllStudents = async () => {
    try {
        return await Student.find();
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to get student by email
const getStudentByEmail = async (email) => {
    try {
        return await Student.findOne({ email });
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to get student by phone number
const getStudentByPhoneNumber = async (phone_number) => {
    try {
        return await Student.findOne({ phone_number });
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to update a student
const updateStudent = async (id, updateData) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedStudent) {
            throw new Error('Student not found');
        }
        return updatedStudent;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to delete a student
const deleteStudent = async (id) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            throw new Error('Student not found');
        }
        return deletedStudent;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentByEmail,
    getStudentByPhoneNumber,
    updateStudent,
    deleteStudent,
};
