const TopicContent = require("../models/topic_content_model"); // Adjust the path as needed

// Create new topic content
const createTopicContent = async (data) => {
  try {
    const newContent = new TopicContent(data);
    await newContent.save();
    return newContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all topic contents
const getAllTopicContents = async () => {
  try {
    return await TopicContent.find({ deleted: false }).populate("Topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get topic content by ID
const getTopicContentById = async (id) => {
  try {
    const content = await TopicContent.findById(id).populate("Topic");
    if (!content) {
      throw new Error("Topic content not found");
    }
    return content;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ✅ Get topic contents by Topic ID
// ✅ Get topic contents by Topic ID (non-deleted only)
const getTopicContentByTopicId = async (topicId) => {
  try {
    const contents = await TopicContent.find({
      Topic: topicId,
      deleted: false,
    }).populate("Topic");

    if (!contents || contents.length === 0) {
      throw new Error("No content found for the specified Topic ID");
    }
    return contents;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update topic content by ID
const updateTopicContent = async (id, updateData) => {
  try {
    const updatedContent = await TopicContent.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    ).populate("Topic");
    if (!updatedContent) {
      throw new Error("Topic content not found");
    }
    return updatedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete t

// Add a comment to a lesson
const addComment = async (contentId, lessonIndex, commentData) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) {
      throw new Error("Topic content not found");
    }

    if (!content.lesson[lessonIndex]) {
      throw new Error("Lesson not found");
    }

    // Add the comment to the lesson
    content.lesson[lessonIndex].comments.push(commentData);
    await content.save();

    return content.lesson[lessonIndex].comments;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add a reply to a comment
const addReplyToComment = async (
  contentId,
  lessonIndex,
  commentIndex,
  replyData
) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) {
      throw new Error("Topic content not found");
    }

    if (!content.lesson[lessonIndex]) {
      throw new Error("Lesson not found");
    }

    if (!content.lesson[lessonIndex].comments[commentIndex]) {
      throw new Error("Comment not found");
    }

    // Add the reply to the comment
    content.lesson[lessonIndex].comments[commentIndex].replies.push(replyData);
    await content.save();

    return content.lesson[lessonIndex].comments[commentIndex].replies;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add or update a reaction
const addReaction = async (contentId, lessonIndex, reactionData) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) {
      throw new Error("Topic content not found");
    }

    if (!content.lesson[lessonIndex]) {
      throw new Error("Lesson not found");
    }

    const lesson = content.lesson[lessonIndex];
    const existingReactionIndex = lesson.reactions.findIndex(
      (r) =>
        r.userId.toString() === reactionData.userId.toString() &&
        r.userType === reactionData.userType
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      lesson.reactions[existingReactionIndex].emoji = reactionData.emoji;
    } else {
      // Add new reaction
      lesson.reactions.push(reactionData);
    }

    await content.save();
    return lesson.reactions;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get comments for a lesson
const getComments = async (contentId, lessonIndex) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) {
      throw new Error("Topic content not found");
    }

    if (!content.lesson[lessonIndex]) {
      throw new Error("Lesson not found");
    }

    return content.lesson[lessonIndex].comments;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get reactions for a lesson
const getReactions = async (contentId, lessonIndex) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) {
      throw new Error("Topic content not found");
    }

    if (!content.lesson[lessonIndex]) {
      throw new Error("Lesson not found");
    }

    return content.lesson[lessonIndex].reactions;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Move to trash (soft delete)
const moveToTrash = async (id) => {
  try {
    const deletedContent = await TopicContent.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: Date.now() },
      { new: true }
    ).populate("Topic");

    if (!deletedContent) {
      throw new Error("Topic content not found");
    }
    return deletedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Restore from trash
const restoreFromTrash = async (id) => {
  try {
    const restoredContent = await TopicContent.findByIdAndUpdate(
      id,
      { deleted: false, deletedAt: null },
      { new: true }
    ).populate("Topic");

    if (!restoredContent) {
      throw new Error("Topic content not found");
    }
    return restoredContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all trashed items
const getTrashedContents = async () => {
  try {
    return await TopicContent.find({ deleted: true }).populate("Topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Permanent deletion
const deletePermanently = async (id) => {
  try {
    const deletedContent = await TopicContent.findByIdAndDelete(id);
    if (!deletedContent) {
      throw new Error("Topic content not found");
    }
    return deletedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update the existing delete function to use soft delete
const deleteTopicContent = async (id) => {
  return await moveToTrash(id);
};




// Delete a comment from a lesson
const deleteComment = async (contentId, lessonIndex, commentIndex) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) throw new Error("Topic content not found");
    if (!content.lesson[lessonIndex]) throw new Error("Lesson not found");
    if (!content.lesson[lessonIndex].comments[commentIndex])
      throw new Error("Comment not found");

    // Remove the comment
    content.lesson[lessonIndex].comments.splice(commentIndex, 1);
    await content.save();

    return content.lesson[lessonIndex].comments;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a reaction from a lesson
const deleteReaction = async (contentId, lessonIndex, reactionIndex) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) throw new Error("Topic content not found");
    if (!content.lesson[lessonIndex]) throw new Error("Lesson not found");
    if (!content.lesson[lessonIndex].reactions[reactionIndex])
      throw new Error("Reaction not found");

    // Remove the reaction
    content.lesson[lessonIndex].reactions.splice(reactionIndex, 1);
    await content.save();

    return content.lesson[lessonIndex].reactions;
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = {
  createTopicContent,
  getAllTopicContents,
  getTopicContentById,
  getTopicContentByTopicId,
  updateTopicContent,
  deleteTopicContent,
  addComment,
  addReplyToComment,
  addReaction,
  getComments,
  getReactions,
  deletePermanently,
  moveToTrash,
  restoreFromTrash,
  getTrashedContents,
  deleteComment,     // <-- newly added
  deleteReaction     // <-- newly added
};
