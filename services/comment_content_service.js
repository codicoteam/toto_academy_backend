const ContentComment = require("../models/comment_content_schema"); 

const createComment = async (commentData) => {
  try {
    const newComment = new ContentComment(commentData);
    await newComment.save();
    return newComment;
  } catch (error) {
    throw new Error(error.message);
  }
};


const getAllComments = async () => {
  try {
    return await ContentComment.find().populate("student_id", "firstName lastName email");
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCommentsByContentSystemId = async (contentSystemId) => {
  try {
    return await ContentComment.find({
      content_system_id: contentSystemId,
    }).populate("student_id"); // adjust fields
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCommentById = async (id) => {
  try {
    const comment = await ContentComment.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const updateComment = async (id, updateData) => {
  try {
    const updatedComment = await ContentComment.findByIdAndUpdate(
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

const deleteComment = async (id) => {
  try {
    const deletedComment = await ContentComment.findByIdAndDelete(id);
    if (!deletedComment) {
      throw new Error("Comment not found");
    }
    return deletedComment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteCommentsByContentSystemId = async (contentSystemId) => {
  try {
    const result = await ContentComment.deleteMany({ content_system_id: contentSystemId });
    if (result.deletedCount === 0) {
      throw new Error("No comments found for the specified content_system_id");
    }
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = {
  createComment,
  getAllComments,
  getCommentsByContentSystemId,
  getCommentById,
  updateComment,
  deleteComment,
  deleteCommentsByContentSystemId
};
