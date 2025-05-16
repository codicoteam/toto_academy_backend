const Book = require("../models/library_book_model");

// Create new book
const createBook = async (bookData) => {
  try {
    const newBook = new Book(bookData);
    await newBook.save();
    return newBook;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all books
const getAllBooks = async () => {
  try {
    return await Book.find().populate("subject");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get book by ID
const getBookById = async (id) => {
  try {
    const book = await Book.findById(id).populate("subject");
    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get book by subject ID
const getBookBySubjectId = async (subjectId) => {
  try {
    const book = await Book.findOne({ subject: subjectId }).populate("subject");
    if (!book) {
      throw new Error("Book not found for the given subject ID");
    }
    return book;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update book
const updateBook = async (id, updateData) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedBook) {
      throw new Error("Book not found");
    }
    return updatedBook;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete book
const deleteBook = async (id) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      throw new Error("Book not found");
    }
    return deletedBook;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  getBookBySubjectId,
  updateBook,
  deleteBook,
};
