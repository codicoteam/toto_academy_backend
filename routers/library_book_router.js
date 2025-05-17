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
    const books = await bookService.getAllBooks();
    res
      .status(200)
      .json({ message: "Books retrieved successfully", data: books });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve books", error: error.message });
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

module.exports = router;
