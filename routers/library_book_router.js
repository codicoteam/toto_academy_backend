const express = require("express");
const router = express.Router();
const bookService = require("../services/library_book_service");
const { authenticateToken } = require("../middlewares/auth");

// Create new book
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newBook = await bookService.createBook(req.body);
    res
      .status(201)
      .json({ message: "Book created successfully", data: newBook });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create book", error: error.message });
  }
});

// Get all books
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const books = await bookService.getAllBooksWithLikes(); // Changed from getAllBooks
    res.status(200).json({
      message: "Books retrieved successfully",
      data: books
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve books",
      error: error.message
    });
  }
});

// Get book by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res
      .status(200)
      .json({ message: "Book retrieved successfully", data: book });
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});

// Get book by subject ID
router.get("/get-by-subject/:subjectId", authenticateToken, async (req, res) => {
  try {
    const book = await bookService.getBookBySubjectId(req.params.subjectId);
    res
      .status(200)
      .json({ message: "Book retrieved by subject ID", data: book });
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});

// Update book by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedBook = await bookService.updateBook(req.params.id, req.body);
    res
      .status(200)
      .json({ message: "Book updated successfully", data: updatedBook });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update book", error: error.message });
  }
});

// Delete book by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete book", error: error.message });
  }
});


// Toggle like on content
// Toggle like on content
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;  // <-- now reading from body
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const content = await bookService.toggleLike(req.params.id, studentId);
    
    res.status(200).json({
      message: "Like toggled successfully",
      data: content,
      liked: content.likes.some(like => like.student.toString() === studentId)
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to toggle like",
      error: error.message
    });
  }
});

// Get content with likes
router.get("/with-likes/:id", authenticateToken, async (req, res) => {
  try {
    const book = await bookService.getBookWithLikes(req.params.id);
    res.status(200).json({
      message: "Book retrieved with likes",
      data: book
    });
  } catch (error) {
    res.status(404).json({
      message: "Book not found",
      error: error.message
    });
  }
});

// Get all books with likes
router.get("/with-likes", authenticateToken, async (req, res) => {
  try {
    const books = await bookService.getAllBooksWithLikes();
    res.status(200).json({
      message: "Books retrieved with likes",
      data: books
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve books",
      error: error.message
    });
  }
});

// Check if student has liked content
router.get("/:id/has-liked", authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const hasLiked = await bookService.hasStudentLiked(req.params.id, studentId);
    
    res.status(200).json({
      message: "Like status checked",
      data: { hasLiked }
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to check like status",
      error: error.message
    });
  }
});

// Get popular books
// Get popular books
router.get("/popular", authenticateToken, async (req, res) => {
  try {
    // Use query parameter instead of optional path param
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const books = await bookService.getPopularBooks(limit);

    res.status(200).json({
      message: "Popular books retrieved",
      data: books
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve popular books",
      error: error.message
    });
  }
});


module.exports = router;
