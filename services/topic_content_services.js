const TopicContent = require("../models/topic_content_model"); // Adjust the path as needed
const Student = require("../models/student_model");
const Admin = require("../models/admin_model");
const mongoose = require("mongoose");

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
        const userData = await UserModel.findById(comment.userId).select(
          "firstName lastName profilePicture email profile_picture"
        );
        comment.userId = userData;
      }

      // Populate replies in comments
      for (const comment of lesson.comments) {
        for (const reply of comment.replies) {
          const UserModel = reply.userType === "Admin" ? Admin : Student;
          const userData = await UserModel.findById(reply.userId).select(
            "firstName lastName profilePicture email profile_picture"
          );
          reply.userId = userData;
        }
      }

      // Populate reactions
      for (const reaction of lesson.reactions) {
        const UserModel = reaction.userType === "Admin" ? Admin : Student;
        const userData = await UserModel.findById(reaction.userId).select(
          "firstName lastName profilePicture email profile_picture"
        );
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
          const userData = await UserModel.findById(comment.userId).select(
            "firstName lastName profilePicture email profile_picture"
          );
          comment.userId = userData;
        }

        // Populate replies inside comments
        for (const comment of lesson.comments) {
          for (const reply of comment.replies) {
            const UserModel = reply.userType === "Admin" ? Admin : Student;
            const userData = await UserModel.findById(reply.userId).select(
              "firstName lastName profilePicture email profile_picture"
            );
            reply.userId = userData;
          }
        }
        // Populate reactions
        for (const reaction of lesson.reactions) {
          const UserModel = reaction.userType === "Admin" ? Admin : Student;
          const userData = await UserModel.findById(reaction.userId).select(
            "firstName lastName profilePicture email profile_picture"
          );
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

const pickUserFields =
  "firstName lastName profilePicture email profile_picture";

const getModelForUserType = (userType) =>
  userType === "Admin" ? Admin : Student;

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
        reaction.userId = await populateUser(
          reaction.userType,
          reaction.userId
        );
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

const safeToObject = (v) =>
  v && typeof v.toObject === "function" ? v.toObject() : v;

const getLessonInfo = async (contentId, lessonId) => {
  if (!Types.ObjectId.isValid(contentId)) throw new Error("Invalid contentId");
  if (!Types.ObjectId.isValid(lessonId)) throw new Error("Invalid lessonId");

  const content = await TopicContent.findById(contentId).populate("Topic");
  if (!content) throw new Error("Topic content not found");

  const lesson = content.lesson.id(lessonId); // or content.lessons.id(...) if that’s your path
  if (!lesson) throw new Error("Lesson not found");

  const base = safeToObject(lesson);

  const comments = await Promise.all(
    (base.comments || []).map(async (c) => {
      const comment = safeToObject(c);
      if (comment?.userId) {
        comment.userId = await populateUser(comment.userType, comment.userId);
      }

      comment.replies = await Promise.all(
        (comment.replies || []).map(async (r) => {
          const reply = safeToObject(r);
          if (reply?.userId) {
            reply.userId = await populateUser(reply.userType, reply.userId);
          }
          return reply;
        })
      );

      return comment;
    })
  );

  const reactions = await Promise.all(
    (base.reactions || []).map(async (r) => {
      const reaction = safeToObject(r);
      if (reaction?.userId) {
        reaction.userId = await populateUser(
          reaction.userType,
          reaction.userId
        );
      }
      return reaction;
    })
  );

  return { ...base, comments, reactions };
};

const {
  Types: { ObjectId },
} = mongoose;

/**
 * Get all topic contents (non-deleted) returning ALL top-level fields,
 * but within `lesson` only `_id` and `text`.
 */
const getAllTopicContentsLeanLessons = async () => {
  try {
    const results = await TopicContent.aggregate([
      { $match: { deleted: false } },
      // populate Topic
      {
        $lookup: {
          from: "topics",
          localField: "Topic",
          foreignField: "_id",
          as: "Topic",
        },
      },
      { $unwind: { path: "$Topic", preserveNullAndEmptyArrays: true } },
      // project lessons to only {_id, text} while keeping all other fields
      {
        $addFields: {
          lesson: {
            $map: {
              input: "$lesson",
              as: "l",
              in: { _id: "$$l._id", text: "$$l.text" },
            },
          },
        },
      },
    ]).exec();

    return results;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get topic contents by Topic ID (non-deleted) returning ALL top-level fields,
 * but within `lesson` only `_id` and `text`.
 */
const getTopicContentsByTopicIdLeanLessons = async (topicId) => {
  try {
    const results = await TopicContent.aggregate([
      { $match: { deleted: false, Topic: new ObjectId(topicId) } },
      // populate Topic
      {
        $lookup: {
          from: "topics",
          localField: "Topic",
          foreignField: "_id",
          as: "Topic",
        },
      },
      { $unwind: { path: "$Topic", preserveNullAndEmptyArrays: true } },
      // project lessons to only {_id, text} while keeping all other fields
      {
        $addFields: {
          lesson: {
            $map: {
              input: "$lesson",
              as: "l",
              in: { _id: "$$l._id", text: "$$l.text" },
            },
          },
        },
      },
    ]).exec();

    if (!results || results.length === 0) {
      throw new Error("No content found for the specified Topic ID");
    }

    // ✅ Return only the first object in the array
    return results[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTopicContentLeanLessonsById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid topic content ID");
    }

    const [doc] = await TopicContent.aggregate([
      { $match: { _id: new ObjectId(id), deleted: false } },
      // Populate `Topic`
      {
        $lookup: {
          from: "topics",
          localField: "Topic",
          foreignField: "_id",
          as: "Topic",
        },
      },
      { $unwind: { path: "$Topic", preserveNullAndEmptyArrays: true } },
      // Keep all top-level fields but slim down lessons to {_id, text}
      {
        $addFields: {
          lesson: {
            $map: {
              input: "$lesson",
              as: "l",
              in: { _id: "$$l._id", text: "$$l.text" },
            },
          },
        },
      },
    ]).exec();

    if (!doc) {
      throw new Error("Topic content not found");
    }

    return doc; // a single object
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Update a lesson inside a topic_content document.
 * Targets the lesson by contentId + lessonId and updates only provided fields.
 *
 * @param {string} contentId - TopicContent _id
 * @param {string} lessonId  - lesson subdocument _id
 * @param {object} payload   - fields to update on the lesson:
 *   Allowed: { text, audio, video, subHeading }
 *   - text: String
 *   - audio: String
 *   - video: String
 *   - subHeading: Array (REPLACES the entire subHeading array if provided)
 *
 * @returns {Promise<object>} The updated lesson object (and optionally Topic, if needed)
 */
const updateLessonContent = async (contentId, lessonId, payload = {}) => {
  if (!Types.ObjectId.isValid(contentId)) throw new Error("Invalid contentId");
  if (!Types.ObjectId.isValid(lessonId)) throw new Error("Invalid lessonId");

  const ALLOWED = ["text", "audio", "video", "subHeading"];
  const setOps = {};
  for (const key of ALLOWED) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      setOps[`lesson.$.${key}`] = payload[key];
    }
  }
  if (Object.keys(setOps).length === 0) {
    throw new Error(
      "No valid fields to update. Allowed: text, audio, video, subHeading"
    );
  }

  const res = await TopicContent.updateOne(
    { _id: contentId, deleted: false, "lesson._id": lessonId },
    { $set: setOps }
  );

  if (res.matchedCount === 0) {
    const content = await TopicContent.findById(contentId).lean();
    if (!content) throw new Error("Topic content not found");
    if (content.deleted) throw new Error("Topic content is deleted");
    throw new Error("Lesson not found");
  }

  // You can inspect res.modifiedCount (0 means same values as before)
  return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount };
};

/**
 * Reorder lessons within a topic_content by providing the desired order of lesson IDs.
 * @param {String} topicContentId - _id of the topic_content doc
 * @param {String[]} orderedLessonIds - array of lesson _id strings in the final order
 * @returns {Promise<Object>} - the updated topic_content (only _id and lesson _id order)
 */
async function reorderLessons(topicContentId, orderedLessonIds) {
  if (!mongoose.isValidObjectId(topicContentId)) {
    throw new Error("Invalid topic_content id");
  }
  if (!Array.isArray(orderedLessonIds) || orderedLessonIds.length === 0) {
    throw new Error("`order` must be a non-empty array of lesson ids");
  }

  // IMPORTANT: load full lesson subdocs so validation passes
  const doc = await TopicContent.findById(topicContentId);
  if (!doc) throw new Error("topic_content not found");

  const existingIds = doc.lesson.map((l) => String(l._id));
  const incomingIds = orderedLessonIds.map(String);

  // Validate 1: same size
  if (existingIds.length !== incomingIds.length) {
    throw new Error(
      "`order` must include every existing lesson id exactly once"
    );
  }
  // Validate 2: same set
  const sameSet =
    [...existingIds].sort().join(",") === [...incomingIds].sort().join(",");
  if (!sameSet) {
    throw new Error("`order` must match the set of existing lesson ids");
  }

  // Index the full subdocs by id
  const byId = new Map(doc.lesson.map((l) => [String(l._id), l]));

  // Rebuild in new order using the full subdocs (not just ids!)
  doc.lesson = incomingIds.map((id) => byId.get(id));

  // Optional: be explicit
  doc.markModified("lesson");

  await doc.save(); // validates with all required fields present

  return {
    _id: doc._id,
    lesson: doc.lesson.map((l) => ({ _id: l._id })),
  };
}

/**
 * Add a lesson to a topic_content document.
 * @param {string} topicContentId - The _id of the topic_content document
 * @param {object} lessonPayload  - The lessonInfo payload (text, subHeading, audio, video, etc.)
 * @returns {Promise<{ topicContent: object, lesson: object }>}
 */
const addLessonInfo = async (topicContentId, lessonPayload = {}) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(topicContentId)) {
      throw new Error("Invalid topic_content id");
    }

    // Find the parent doc (and ensure not trashed)
    const content = await TopicContent.findOne({
      _id: topicContentId,
      deleted: false,
    });

    if (!content) {
      throw new Error("Topic content not found or is in trash");
    }

    // Normalize payload so we don't store undefined (schema defaults still apply)
    const lesson = {
      text: lessonPayload.text ?? "",
      subHeading: Array.isArray(lessonPayload.subHeading)
        ? lessonPayload.subHeading
        : [], // expects array of addSubheading subdocs
      audio: lessonPayload.audio ?? undefined, // let schema default to "no content" if undefined
      video: lessonPayload.video ?? undefined, // let schema default to "no content" if undefined

      // Never accept comments/reactions from the client when creating a lesson
      comments: [],
      reactions: [],
    };

    // Push and save (lets mongoose run validators)
    content.lesson.push(lesson);
    await content.save();

    const newLesson = content.lesson[content.lesson.length - 1]; // the one we just added
    return { topicContent: content, lesson: newLesson };
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteLessonInfo = async (topicContentId, lessonId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(topicContentId)) {
      throw new Error("Invalid topic_content id");
    }
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw new Error("Invalid lesson id");
    }

    const content = await TopicContent.findOne({
      _id: topicContentId,
      deleted: false,
    }).select("lesson");

    if (!content) throw new Error("Topic content not found or is in trash");

    const lesson = content.lesson.id(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const deletedLesson = lesson.toObject();

    // Mongoose 6/7 way:
    lesson.deleteOne(); // <- replace .remove()
    await content.save();

    return { topicContent: content, deletedLesson };
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
  deleteComment, // <-- newly added
  deleteReaction, // <-- newly added,
  getLessonInfo,
  getAllTopicContentsLeanLessons,
  getTopicContentsByTopicIdLeanLessons,
  getTopicContentLeanLessonsById,
  updateLessonContent,
  reorderLessons,
  addLessonInfo,
  deleteLessonInfo,
};
