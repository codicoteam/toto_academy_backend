const express = require("express");
const router = express.Router();
const commentService = require("../services/comment_topic_content_service"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new comment
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newComment = await commentService.createComment(req.body);
    res.status(201).json({
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create comment",
      error: error.message,
    });
  }
});

// Get all comments
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const comments = await commentService.getAllComments();
    res.status(200).json({
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve comments",
      error: error.message,
    });
  }
});

// Get comments by topic_content_id
router.get("/bytopic/:topicContentId", authenticateToken, async (req, res) => {
  try {
    const comments = await commentService.getCommentsByTopicContentId(
      req.params.topicContentId
    );
    res.status(200).json({
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve comments by topic_content_id",
      error: error.message,
    });
  }
});

// Get comment by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const comment = await commentService.getCommentById(req.params.id);
    res.status(200).json({
      message: "Comment retrieved successfully",
      data: comment,
    });
  } catch (error) {
    res.status(404).json({
      message: "Comment not found",
      error: error.message,
    });
  }
});

// Update comment by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedComment = await commentService.updateComment(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update comment",
      error: error.message,
    });
  }
});

// Delete comment by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await commentService.deleteComment(req.params.id);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
});

// Delete all comments by topic_content_id
router.delete(
  "/delete/bytopic/:topicContentId",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await commentService.deleteCommentsByTopicContentId(
        req.params.topicContentId
      );
      res.status(200).json({
        message: "Comments deleted successfully",
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete comments",
        error: error.message,
      });
    }
  }
);

module.exports = router;
