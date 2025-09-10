const express = require("express");
const router = express.Router();
const chatService = require("../services/admin_student_chat_service");
const { authenticateToken } = require("../middlewares/auth");

// Send a message
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const message = await chatService.sendMessage(req.body);
    res
      .status(201)
      .json({ message: "Message sent successfully", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation between a student and an admin
router.get(
  "/conversation/:studentId/:adminId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId, adminId } = req.params;
      const conversation = await chatService.getConversation(
        studentId,
        adminId
      );
      res
        .status(200)
        .json({ message: "Conversation retrieved", data: conversation });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get messages related to specific topic content
router.get(
  "/topic-content/:topicContentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { topicContentId } = req.params;
      const { lessonInfoId } = req.query;

      const messages = await chatService.getTopicContentMessages(
        topicContentId,
        lessonInfoId || null
      );
      res
        .status(200)
        .json({ message: "Topic content messages retrieved", data: messages });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get conversations for admin (grouped by student)
router.get(
  "/admin-conversations/:adminId",
  authenticateToken,
  async (req, res) => {
    try {
      const { adminId } = req.params;
      const conversations = await chatService.getAdminConversations(adminId);
      res
        .status(200)
        .json({
          message: "Admin conversations retrieved",
          data: conversations,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get conversations for student (grouped by admin)
router.get(
  "/student-conversations/:studentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const conversations = await chatService.getStudentConversations(
        studentId
      );
      res
        .status(200)
        .json({
          message: "Student conversations retrieved",
          data: conversations,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Mark messages as viewed between two users
router.put(
  "/mark-viewed/:userId/:conversationPartnerId",
  authenticateToken,
  async (req, res) => {
    try {
      const { userId, conversationPartnerId } = req.params;
      const result = await chatService.markMessagesAsViewed(
        userId,
        conversationPartnerId
      );
      res
        .status(200)
        .json({ message: "Messages marked as viewed", data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Mark a specific message as viewed
router.put(
  "/mark-message-viewed/:messageId",
  authenticateToken,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const result = await chatService.markMessageAsViewed(messageId);
      res
        .status(200)
        .json({ message: "Message marked as viewed", data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get unread message count for a user
router.get("/unread-count/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await chatService.getUnreadCount(userId);
    res
      .status(200)
      .json({ message: "Unread count retrieved", data: { count } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a whole conversation
router.delete(
  "/conversation/:studentId/:adminId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId, adminId } = req.params;
      const result = await chatService.deleteConversation(studentId, adminId);
      res.status(200).json({ message: "Conversation deleted", data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete a single message
router.delete("/message/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const result = await chatService.deleteMessage(messageId);
    if (!result) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
