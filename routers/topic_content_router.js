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

const { Types } = require("mongoose");

// e.g. GET /api/v1/topic_content/lessonInfo/68529df98ba2617c3640aae2/68cb2c3d0e5717f9f19d8b55
router.get(
  "/lessonInfo/:contentId/:lessonId",
  authenticateToken,
  async (req, res) => {
    try {
      const { contentId, lessonId } = req.params;

      // Validate params
      if (!Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({
          message: "Failed to retrieve lesson info",
          error: "Invalid contentId",
        });
      }
      if (!Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({
          message: "Failed to retrieve lesson info",
          error: "Invalid lessonId",
        });
      }

      const lesson = await topicContentService.getLessonInfo(
        contentId,
        lessonId
      );
      if (!lesson) {
        return res.status(404).json({
          message: "Failed to retrieve lesson info",
          error: "Lesson not found",
        });
      }

      res.status(200).json({
        message: "Lesson info retrieved successfully",
        data: lesson,
      });
    } catch (error) {
      const notFound = /Topic content not found|Lesson not found/i.test(
        error.message
      );
      res.status(notFound ? 404 : 400).json({
        message: "Failed to retrieve lesson info",
        error: error.message,
      });
    }
  }
);

// GET /topic-contents/lean
router.get("/topic-contents/lean", async (req, res) => {
  try {
    const data = await topicContentService.getAllTopicContentsLeanLessons();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /topic-contents/topic/:topicId/lean
router.get("/topic-contents/topic/:topicId/lean", async (req, res) => {
  try {
    const { topicId } = req.params;
    const data = await topicContentService.getTopicContentsByTopicIdLeanLessons(
      topicId
    );
    res.status(200).json(data);
  } catch (err) {
    const msg = err.message || "Server error";
    const code = /No content found/.test(msg) ? 404 : 500;
    res.status(code).json({ message: msg });
  }
});

router.get("/topic-contents/:id/lean", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await topicContentService.getTopicContentLeanLessonsById(id);
    return res.status(200).json(doc);
  } catch (err) {
    const msg = err.message || "Server error";
    if (msg === "Invalid topic content ID") {
      return res.status(400).json({ message: msg });
    }
    if (msg === "Topic content not found") {
      return res.status(404).json({ message: msg });
    }
    return res.status(500).json({ message: msg });
  }
});

// Consistent error mapping
function mapServiceErrorToHttpStatus(message) {
  switch (message) {
    case "Invalid id":
    case "Provide either `order:[ids...]` or `{from,to}`":
    case "from/to out of bounds":
    case "Order does not match existing lessons":
    case "Order does not match existing subHeadings":
      return 400;
    case "Topic content not found":
    case "Lesson not found":
      return 404;
    case "Topic content is deleted":
      return 409;
    default:
      return 500;
  }
}

router.patch(
  "/topic-contents/:contentId/lessons/:lessonId",
  async (req, res) => {
    try {
      const { contentId, lessonId } = req.params;

      // Optional: reject empty body early
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message:
            "Request body cannot be empty. Allowed fields: text, audio, video, subHeading",
        });
      }

      const updatedLesson = await topicContentService.updateLessonContent(
        contentId,
        lessonId,
        req.body
      );

      // Success: return the updated lesson object
      return res.status(200).json(updatedLesson);
    } catch (err) {
      const msg = err?.message || "Server error";
      const status = mapServiceErrorToHttpStatus(msg);
      return res.status(status).json({ message: msg });
    }
  }
);
router.put("/topic-contents/:id/lessons/reorder", async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    const result = await topicContentService.reorderLessons(id, order);
    res.status(200).json({
      message: "Lessons reordered successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Failed to reorder lessons",
    });
  }
});

router.post("/topic-contents/:id/lessons", async (req, res) => {
  try {
    const topicContentId = req.params.id;

    // Expect lesson data in body: { text, subHeading, audio, video }
    const lessonPayload = {
      text: req.body?.text,
      subHeading: req.body?.subHeading, // array of addSubheading subdocs
      audio: req.body?.audio,
      video: req.body?.video,
      // comments/reactions are intentionally not allowed on create
    };

    const { topicContent, lesson } = await topicContentService.addLessonInfo(
      topicContentId,
      lessonPayload
    );

    return res.status(201).json({
      message: "Lesson added successfully",
      topicContent,
      lesson,
    });
  } catch (err) {
    // Common Mongoose error guard
    if (err?.name === "CastError") {
      return res.status(400).json({ error: "Invalid id format" });
    }
    return res
      .status(400)
      .json({ error: err.message || "Failed to add lesson" });
  }
});

// DELETE /api/topic-contents/:id/lessons/:lessonId
router.delete("/topic-contents/:id/lessons/:lessonId", async (req, res) => {
  try {
    const { id: topicContentId, lessonId } = req.params;

    const result = await topicContentService.deleteLessonInfo(topicContentId, lessonId);

    return res.status(200).json({
      message: "Lesson deleted successfully",
      deletedLesson: result.deletedLesson,
      topicContent: result.topicContent, // updated doc (lessons array now without the deleted one)
    });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ error: "Invalid id format" });
    }
    return res.status(400).json({ error: err.message || "Failed to delete lesson" });
  }
});


module.exports = router;
