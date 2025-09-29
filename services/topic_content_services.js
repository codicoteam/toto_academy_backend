const TopicContent = require("../models/topic_content_model"); // Adjust the path as needed
const Student = require("../models/student_model");
const Admin = require("../models/admin_model");

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
    // First, get the topic content with basic population
    const content = await TopicContent.findById(id).populate("Topic");
    
    if (!content) {
      throw new Error("Topic content not found");
    }

    // Process each lesson to populate user data
    for (const lesson of content.lesson) {
      // Populate comments
      for (const comment of lesson.comments) {
        const UserModel = comment.userType === "Admin" ? Admin : Student;
        const userData = await UserModel.findById(comment.userId)
          .select("firstName lastName profilePicture email profile_picture");
        comment.userId = userData;
      }

      // Populate replies in comments
      for (const comment of lesson.comments) {
        for (const reply of comment.replies) {
          const UserModel = reply.userType === "Admin" ? Admin : Student;
          const userData = await UserModel.findById(reply.userId)
            .select("firstName lastName profilePicture email profile_picture");
          reply.userId = userData;
        }
      }

      // Populate reactions
      for (const reaction of lesson.reactions) {
        const UserModel = reaction.userType === "Admin" ? Admin : Student;
        const userData = await UserModel.findById(reaction.userId)
          .select("firstName lastName profilePicture email profile_picture");
        reaction.userId = userData;
      }
    }

    return content;
  } catch (error) {
    throw new Error(error.message);
  }
};
// ✅ Get topic contents by Topic ID
// ✅ Get topic contents by Topic ID (non-deleted only)
// ✅ Get topic contents by Topic ID (with deep population)
const getTopicContentByTopicId = async (topicId) => {
  try {
    let contents = await TopicContent.find({
      Topic: topicId,
      deleted: false,
    }).populate("Topic");

    if (!contents || contents.length === 0) {
      throw new Error("No content found for the specified Topic ID");
    }

    // Process each content
    for (const content of contents) {
      // Process each lesson
      for (const lesson of content.lesson) {
        // Populate comments
        for (const comment of lesson.comments) {
          const UserModel = comment.userType === "Admin" ? Admin : Student;
          const userData = await UserModel.findById(comment.userId)
            .select("firstName lastName profilePicture email profile_picture");
          comment.userId = userData;
        }

        // Populate replies inside comments
        for (const comment of lesson.comments) {
          for (const reply of comment.replies) {
            const UserModel = reply.userType === "Admin" ? Admin : Student;
            const userData = await UserModel.findById(reply.userId)
              .select("firstName lastName profilePicture email profile_picture");
            reply.userId = userData;
          }
        }
        // Populate reactions
        for (const reaction of lesson.reactions) {
          const UserModel = reaction.userType === "Admin" ? Admin : Student;
          const userData = await UserModel.findById(reaction.userId)
            .select("firstName lastName profilePicture email profile_picture");
          reaction.userId = userData;
        }
      }
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
// Assumes you have these models imported already
// const TopicContent = require('...');
// const Admin = require('...');
// const Student = require('...');

const pickUserFields = "firstName lastName profilePicture email profile_picture";

const getModelForUserType = (userType) => (userType === "Admin" ? Admin : Student);

const populateUser = async (userType, userId) => {
  if (!userId) return null;
  const Model = getModelForUserType(userType);
  return Model.findById(userId).select(pickUserFields);
};

// Get comments for a lesson (with populated user fields on comments AND replies)
const getComments = async (contentId, lessonIndex) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) throw new Error("Topic content not found");

    const lesson = content.lesson?.[lessonIndex];
    if (!lesson) throw new Error("Lesson not found");

    // Build a fully-populated comments array without mutating Mongoose docs
    const populatedComments = await Promise.all(
      lesson.comments.map(async (commentDoc) => {
        const comment = commentDoc.toObject();

        // Populate comment author
        comment.userId = await populateUser(comment.userType, comment.userId);

        // Populate each reply author
        comment.replies = await Promise.all(
          (comment.replies || []).map(async (replyDoc) => {
            const reply = replyDoc; // already plain object from .toObject() above
            reply.userId = await populateUser(reply.userType, reply.userId);
            return reply;
          })
        );

        return comment;
      })
    );

    return populatedComments;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get reactions for a lesson (with populated user fields)
const getReactions = async (contentId, lessonIndex) => {
  try {
    const content = await TopicContent.findById(contentId);
    if (!content) throw new Error("Topic content not found");

    const lesson = content.lesson?.[lessonIndex];
    if (!lesson) throw new Error("Lesson not found");

    const populatedReactions = await Promise.all(
      lesson.reactions.map(async (reactionDoc) => {
        const reaction = reactionDoc.toObject();
        reaction.userId = await populateUser(reaction.userType, reaction.userId);
        return reaction;
      })
    );

    return populatedReactions;
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

const { Types } = require("mongoose");

const getLessonInfo = async (contentId, lessonId) => {
  if (!Types.ObjectId.isValid(contentId)) {
    throw new Error("Invalid contentId");
  }
  if (!Types.ObjectId.isValid(lessonId)) {
    throw new Error("Invalid lessonId");
  }

  const content = await TopicContent.findById(contentId).populate("Topic");
  if (!content) throw new Error("Topic content not found");

  const lesson = content.lesson.id(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  // ... the rest of your population logic
  return {
    ...lesson.toObject(),
    comments: await Promise.all(
      (lesson.comments || []).map(async (c) => {
        const comment = c.toObject();
        comment.userId = await populateUser(comment.userType, comment.userId);
        comment.replies = await Promise.all(
          (comment.replies || []).map(async (r) => {
            const reply = r.toObject();
            reply.userId = await populateUser(reply.userType, reply.userId);
            return reply;
          })
        );
        return comment;
      })
    ),
    reactions: await Promise.all(
      (lesson.reactions || []).map(async (r) => {
        const reaction = r.toObject();
        reaction.userId = await populateUser(reaction.userType, reaction.userId);
        return reaction;
      })
    ),
  };
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
  deleteReaction,     // <-- newly added,
  getLessonInfo
};
