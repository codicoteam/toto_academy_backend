const express = require("express");
const router = express.Router();
const topicContentService = require("../services/topic_content_services"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new topic content
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newContent = await topicContentService.createTopicContent(req.body);
    res.status(201).json({
      message: "Topic content created successfully",
      data: newContent,
    });
  } catch (error) {
    res
      .status(400) // ✅ Export the new service
      .json({
        message: "Failed to create topic content",
        error: error.message,
      });
  }
});

// Get all topic contents
// Get all topic contents (non-deleted only)
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const contentList = await topicContentService.getAllTopicContents();
    res.status(200).json({
      message: "Topic contents retrieved successfully",
      data: contentList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve topic contents",
      error: error.message,
    });
  }
});

// Get topic contents by Topic ID (non-deleted only)
router.get("/by-topic/:topicId", authenticateToken, async (req, res) => {
  try {
    // You'll need to update the getTopicContentByTopicId service function
    // to filter out deleted items
    const contents = await topicContentService.getTopicContentByTopicId(
      req.params.topicId
    );
    res.status(200).json({
      message: "Topic contents retrieved successfully",
      data: contents,
    });
  } catch (error) {
    res.status(404).json({
      message: "No content found for this Topic ID",
      error: error.message,
    });
  }
});

// Get topic content by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const content = await topicContentService.getTopicContentById(
      req.params.id
    );
    res.status(200).json({
      message: "Topic content retrieved successfully",
      data: content,
    });
  } catch (error) {
    res.status(404).json({
      message: "Topic content not found",
      error: error.message,
    });
  }
});

// Update topic content by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedContent = await topicContentService.updateTopicContent(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Topic content updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update topic content",
      error: error.message,
    });
  }
});

// Delete topic content by ID

// Delete topic content by ID (now moves to trash)
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await topicContentService.deleteTopicContent(req.params.id);
    res
      .status(200)
      .json({ message: "Topic content moved to trash successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to move topic content to trash",
      error: error.message,
    });
  }
});
// Get topic contents by Topic ID
router.get("/by-topic/:topicId", authenticateToken, async (req, res) => {
  try {
    const contents = await topicContentService.getTopicContentByTopicId(
      req.params.topicId
    );
    res.status(200).json({
      message: "Topic contents retrieved successfully",
      data: contents,
    });
  } catch (error) {
    res.status(404).json({
      message: "No content found for this Topic ID",
      error: error.message,
    });
  }
});

// Add a comment to a lesson
router.post(
  "/:contentId/lesson/:lessonIndex/comment",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex } = req.params;
      const comments = await topicContentService.addComment(
        contentId,
        parseInt(lessonIndex),
        req.body
      );
      res.status(201).json({
        message: "Comment added successfully",
        data: comments,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to add comment",
        error: error.message,
      });
    }
  }
);

// Add a reply to a comment
router.post(
  "/:contentId/lesson/:lessonIndex/comment/:commentIndex/reply",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex, commentIndex } = req.params;
      const replies = await topicContentService.addReplyToComment(
        contentId,
        parseInt(lessonIndex),
        parseInt(commentIndex),
        req.body
      );
      res.status(201).json({
        message: "Reply added successfully",
        data: replies,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to add reply",
        error: error.message,
      });
    }
  }
);

// Add or update a reaction
router.post(
  "/:contentId/lesson/:lessonIndex/reaction",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex } = req.params;
      const reactions = await topicContentService.addReaction(
        contentId,
        parseInt(lessonIndex),
        req.body
      );
      res.status(201).json({
        message: "Reaction added successfully",
        data: reactions,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to add reaction",
        error: error.message,
      });
    }
  }
);

// Get comments for a lesson
router.get(
  "/:contentId/lesson/:lessonIndex/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex } = req.params;
      const comments = await topicContentService.getComments(
        contentId,
        parseInt(lessonIndex)
      );
      res.status(200).json({
        message: "Comments retrieved successfully",
        data: comments,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve comments",
        error: error.message,
      });
    }
  }
);

// Get reactions for a lesson
router.get(
  "/:contentId/lesson/:lessonIndex/reactions",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex } = req.params;
      const reactions = await topicContentService.getReactions(
        contentId,
        parseInt(lessonIndex)
      );
      res.status(200).json({
        message: "Reactions retrieved successfully",
        data: reactions,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve reactions",
        error: error.message,
      });
    }
  }
);

// Move to trash
router.put("/trash/:id", authenticateToken, async (req, res) => {
  try {
    const trashedContent = await topicContentService.moveToTrash(req.params.id);
    res.status(200).json({
      message: "Topic content moved to trash successfully",
      data: trashedContent,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to move topic content to trash",
      error: error.message,
    });
  }
});

// Restore from trash
router.put("/restore/:id", authenticateToken, async (req, res) => {
  try {
    const restoredContent = await topicContentService.restoreFromTrash(
      req.params.id
    );
    res.status(200).json({
      message: "Topic content restored successfully",
      data: restoredContent,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to restore topic content",
      error: error.message,
    });
  }
});

// Get all trashed items
router.get("/trash/all", authenticateToken, async (req, res) => {
  try {
    const trashedContents = await topicContentService.getTrashedContents();
    res.status(200).json({
      message: "Trashed contents retrieved successfully",
      data: trashedContents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve trashed contents",
      error: error.message,
    });
  }
});

// Permanent deletion
router.delete("/permanent-delete/:id", authenticateToken, async (req, res) => {
  try {
    await topicContentService.deletePermanently(req.params.id);
    res
      .status(200)
      .json({ message: "Topic content permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to permanently delete topic content",
      error: error.message,
    });
  }
});

// Delete a comment from a lesson
router.delete(
  "/:contentId/lesson/:lessonIndex/comment/:commentIndex",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex, commentIndex } = req.params;
      const updatedComments = await topicContentService.deleteComment(
        contentId,
        parseInt(lessonIndex),
        parseInt(commentIndex)
      );
      res.status(200).json({
        message: "Comment deleted successfully",
        data: updatedComments,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to delete comment",
        error: error.message,
      });
    }
  }
);

// Delete a reaction from a lesson
router.delete(
  "/:contentId/lesson/:lessonIndex/reaction/:reactionIndex",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonIndex, reactionIndex } = req.params;
      const updatedReactions = await topicContentService.deleteReaction(
        contentId,
        parseInt(lessonIndex),
        parseInt(reactionIndex)
      );
      res.status(200).json({
        message: "Reaction deleted successfully",
        data: updatedReactions,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to delete reaction",
        error: error.message,
      });
    }
  }
);

router.get("/lesson-info", authenticateToken, async (req, res) => {
  try {
    const { contentId, lessonId } = req.query;
    const lesson = await topicContentService.getLessonInfoById(
      contentId,
      lessonId
    );
    res.status(200).json({
      message: "Lesson info retrieved successfully",
      data: lesson,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve lesson info",
      error: error.message,
    });
  }
});

module.exports = router;
