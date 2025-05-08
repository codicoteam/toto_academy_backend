const ContentTopicComment = require("../models/comment_topic_content"); // Adjust path as necessary

// Create a new comment
const createComment = async (commentData) => {
  try {
    const newComment = new ContentTopicComment(commentData);
    await newComment.save();
    return newComment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all comments
const getAllComments = async () => {
  try {
    return await ContentTopicComment.find()
      .populate("student_id", "firstName lastName email")
      .populate("topic_content_id", "title file_type");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get comments by topic_content_id
const getCommentsByTopicContentId = async (topicContentId) => {
  try {
    return await ContentTopicComment.find({
      topic_content_id: topicContentId,
    })
      .populate("student_id", "firstName lastName email")
      .populate("topic_content_id", "title file_type");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get a single comment by ID
const getCommentById = async (id) => {
  try {
    const comment = await ContentTopicComment.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update a comment
const updateComment = async (id, updateData) => {
  try {
    const updatedComment = await ContentTopicComment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedComment) {
      throw new Error("Comment not found");
    }
    return updatedComment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a comment
const deleteComment = async (id) => {
  try {
    const deletedComment = await ContentTopicComment.findByIdAndDelete(id);
    if (!deletedComment) {
      throw new Error("Comment not found");
    }
    return deletedComment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete all comments by topic_content_id
const deleteCommentsByTopicContentId = async (topicContentId) => {
  try {
    const result = await ContentTopicComment.deleteMany({ topic_content_id: topicContentId });
    if (result.deletedCount === 0) {
      throw new Error("No comments found for the specified topic_content_id");
    }
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createComment,
  getAllComments,
  getCommentsByTopicContentId,
  getCommentById,
  updateComment,
  deleteComment,
  deleteCommentsByTopicContentId,
};
