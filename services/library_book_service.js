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

// Like or unlike content
const toggleLike = async (contentId, studentId) => {
  try {
    const content = await Book.findById(contentId);
    if (!content) {
      throw new Error("Content not found");
    }

    // Check if student already liked this content
    const existingLikeIndex = content.likes.findIndex(
      (like) => like.student.toString() === studentId.toString()
    );

    if (existingLikeIndex !== -1) {
      // Remove like (unlike)
      content.likes.splice(existingLikeIndex, 1);
      content.likesCount = Math.max(0, content.likesCount - 1);
    } else {
      // Add like
      content.likes.push({ student: studentId });
      content.likesCount += 1;
    }

    await content.save();
    return content;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get content with likes populated
const getBookWithLikes = async (id) => {
  try {
    const book = await Book.findById(id)
      .populate("subject")
      .populate("likes.student", "name email"); // Populate student info

    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all books with like information
const getAllBooksWithLikes = async () => {
  try {
    return await Book.find()
      .populate("subject")
      .populate("likes.student", "name email"); // Populate student info
  } catch (error) {
    throw new Error(error.message);
  }
};

// Check if a student has liked specific content
const hasStudentLiked = async (contentId, studentId) => {
  try {
    const content = await Book.findOne({
      _id: contentId,
      "likes.student": studentId,
    });

    return !!content;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get popular content (most liked)
const getPopularBooks = async (limit = 10) => {
  try {
    return await Book.find()
      .sort({ likesCount: -1 })
      .limit(limit)
      .populate("subject")
      .populate("likes.student", "name email");
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
  toggleLike,
  getBookWithLikes,
  getAllBooksWithLikes,
  hasStudentLiked,
  getPopularBooks,
};
