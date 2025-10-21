const Quiz = require("../models/end_lesson_question_modal");

class QuizService {
  // Create a new quiz
  async createQuiz(quizData) {
    try {
      const quiz = new Quiz(quizData);
      return await quiz.save();
    } catch (error) {
      throw new Error(`Error creating quiz: ${error.message}`);
    }
  }

  // Get all quizzes (non-deleted)
  async getAllQuizzes() {
    try {
      return await Quiz.find({ isDeleted: false }).populate("topic_content_id");
    } catch (error) {
      throw new Error(`Error fetching quizzes: ${error.message}`);
    }
  }

  // Get quiz by ID
  async getQuizById(id) {
    try {
      return await Quiz.findOne({ _id: id, isDeleted: false }).populate(
        "topic_content_id"
      );
    } catch (error) {
      throw new Error(`Error fetching quiz: ${error.message}`);
    }
  }

  // Get quizzes by topic_content_id
  async getQuizzesByContentId(topicContentId) {
    try {
      return await Quiz.find({
        topic_content_id: topicContentId,
        isDeleted: false,
      }).populate("topic_content_id");
    } catch (error) {
      throw new Error(`Error fetching quizzes by content ID: ${error.message}`);
    }
  }

  // Update quiz by ID
  async updateQuiz(id, updateData) {
    try {
      return await Quiz.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
      ).populate("topic_content_id");
    } catch (error) {
      throw new Error(`Error updating quiz: ${error.message}`);
    }
  }

  // Soft delete quiz
  async softDeleteQuiz(id) {
    try {
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      return await quiz.softDelete();
    } catch (error) {
      throw new Error(`Error soft deleting quiz: ${error.message}`);
    }
  }

  // Restore soft deleted quiz
  async restoreQuiz(id) {
    try {
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      return await quiz.restore();
    } catch (error) {
      throw new Error(`Error restoring quiz: ${error.message}`);
    }
  }

  // Permanent delete
  async permanentDeleteQuiz(id) {
    try {
      return await Quiz.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error permanently deleting quiz: ${error.message}`);
    }
  }

  // Get all quizzes including deleted (for admin)
  async getAllQuizzesWithDeleted() {
    try {
      return await Quiz.find({}).populate("topic_content_id");
    } catch (error) {
      throw new Error(`Error fetching all quizzes: ${error.message}`);
    }
  }

  // Get only deleted quizzes
  async getDeletedQuizzes() {
    try {
      return await Quiz.find({ isDeleted: true }).populate("topic_content_id");
    } catch (error) {
      throw new Error(`Error fetching deleted quizzes: ${error.message}`);
    }
  }

  // Delete quizzes by topic_content_id
  async deleteQuizzesByContentId(topicContentId) {
    try {
      return await Quiz.updateMany(
        { topic_content_id: topicContentId },
        {
          isDeleted: true,
          deletedAt: new Date(),
        }
      );
    } catch (error) {
      throw new Error(`Error deleting quizzes by content ID: ${error.message}`);
    }
  }

  // Restore quizzes by topic_content_id
  async restoreQuizzesByContentId(topicContentId) {
    try {
      return await Quiz.updateMany(
        { topic_content_id: topicContentId },
        {
          isDeleted: false,
          deletedAt: null,
        }
      );
    } catch (error) {
      throw new Error(
        `Error restoring quizzes by content ID: ${error.message}`
      );
    }
  }

  // Get quiz count by topic_content_id
  async getQuizCountByContentId(topicContentId) {
    try {
      return await Quiz.countDocuments({
        topic_content_id: topicContentId,
        isDeleted: false,
      });
    } catch (error) {
      throw new Error(`Error counting quizzes: ${error.message}`);
    }
  }
}

module.exports = new QuizService();
