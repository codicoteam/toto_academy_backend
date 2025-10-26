const Quiz = require("../models/end_lesson_question_modal");

class QuizService {
  // -------- CREATE / UPSERT --------

  // Create (will fail if (topic_content_id, lesson_id) already exists due to unique index)
  async createQuiz(quizData) {
    try {
      const quiz = new Quiz(quizData);
      return await quiz.save();
    } catch (error) {
      throw new Error(`Error creating quiz: ${error.message}`);
    }
  }

  // Create-or-update by composite key (topic_content_id + lesson_id)
  async upsertQuizForLesson({ topic_content_id, lesson_id, questions }) {
    try {
      return await Quiz.upsertForLesson({ topic_content_id, lesson_id, questions });
    } catch (error) {
      throw new Error(`Error upserting quiz for lesson: ${error.message}`);
    }
  }

  // -------- READ --------

  // Get all quizzes (non-deleted)
  async getAllQuizzes() {
    try {
      return await Quiz.find({ isDeleted: false }).populate("topic_content_id", "title");
    } catch (error) {
      throw new Error(`Error fetching quizzes: ${error.message}`);
    }
  }

  // Get quiz by ID (non-deleted)
  async getQuizById(id) {
    try {
      return await Quiz.findOne({ _id: id, isDeleted: false }).populate("topic_content_id", "title");
    } catch (error) {
      throw new Error(`Error fetching quiz: ${error.message}`);
    }
  }

  // Get quizzes by topic_content_id (non-deleted)
  async getQuizzesByContentId(topicContentId) {
    try {
      return await Quiz.find({
        topic_content_id: topicContentId,
        isDeleted: false,
      }).populate("topic_content_id", "title");
    } catch (error) {
      throw new Error(`Error fetching quizzes by content ID: ${error.message}`);
    }
  }

  // Get a single quiz by (topic_content_id, lesson_id)
  async getQuizByContentAndLesson(topicContentId, lessonId) {
    try {
      return await Quiz.findOne({
        topic_content_id: topicContentId,
        lesson_id: lessonId,
        isDeleted: false,
      }).populate("topic_content_id", "title");
    } catch (error) {
      throw new Error(`Error fetching quiz by content & lesson: ${error.message}`);
    }
  }

  // -------- UPDATE --------

  // Update quiz by ID (non-deleted)
  async updateQuiz(id, updateData) {
    try {
      return await Quiz.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
      ).populate("topic_content_id", "title");
    } catch (error) {
      throw new Error(`Error updating quiz: ${error.message}`);
    }
  }

  // Update by composite key (topic_content_id, lesson_id)
  async updateQuizByContentAndLesson(topicContentId, lessonId, updateData) {
    try {
      return await Quiz.findOneAndUpdate(
        { topic_content_id: topicContentId, lesson_id: lessonId, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
      ).populate("topic_content_id", "title");
    } catch (error) {
      throw new Error(`Error updating quiz by content & lesson: ${error.message}`);
    }
  }

  // -------- SOFT DELETE / RESTORE --------

  // Soft delete quiz by ID
  async softDeleteQuiz(id) {
    try {
      const quiz = await Quiz.findById(id);
      if (!quiz) throw new Error("Quiz not found");
      return await quiz.softDelete();
    } catch (error) {
      throw new Error(`Error soft deleting quiz: ${error.message}`);
    }
  }

  // Restore soft-deleted quiz by ID
  async restoreQuiz(id) {
    try {
      const quiz = await Quiz.findById(id);
      if (!quiz) throw new Error("Quiz not found");
      return await quiz.restore();
    } catch (error) {
      throw new Error(`Error restoring quiz: ${error.message}`);
    }
  }

  // Bulk soft delete by topic_content_id
  async deleteQuizzesByContentId(topicContentId) {
    try {
      return await Quiz.updateMany(
        { topic_content_id: topicContentId },
        { isDeleted: true, deletedAt: new Date() }
      );
    } catch (error) {
      throw new Error(`Error deleting quizzes by content ID: ${error.message}`);
    }
  }

  // Bulk restore by topic_content_id
  async restoreQuizzesByContentId(topicContentId) {
    try {
      return await Quiz.updateMany(
        { topic_content_id: topicContentId },
        { isDeleted: false, deletedAt: null }
      );
    } catch (error) {
      throw new Error(`Error restoring quizzes by content ID: ${error.message}`);
    }
  }

  // Soft delete by composite key
  async softDeleteByContentAndLesson(topicContentId, lessonId) {
    try {
      return await Quiz.updateMany(
        { topic_content_id: topicContentId, lesson_id: lessonId },
        { isDeleted: true, deletedAt: new Date() }
      );
    } catch (error) {
      throw new Error(`Error soft deleting by content & lesson: ${error.message}`);
    }
  }

  // Restore by composite key
  async restoreByContentAndLesson(topicContentId, lessonId) {
    try {
      return await Quiz.updateMany(
        { topic_content_id: topicContentId, lesson_id: lessonId },
        { isDeleted: false, deletedAt: null }
      );
    } catch (error) {
      throw new Error(`Error restoring by content & lesson: ${error.message}`);
    }
  }

  // -------- PERMANENT DELETE --------

  // Permanent delete by ID
  async permanentDeleteQuiz(id) {
    try {
      return await Quiz.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error permanently deleting quiz: ${error.message}`);
    }
  }

  // -------- COUNTS --------

  // Count quizzes by topic_content_id
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

  // Count by (topic_content_id, lesson_id)
  async getQuizCountByContentAndLesson(topicContentId, lessonId) {
    try {
      return await Quiz.countDocuments({
        topic_content_id: topicContentId,
        lesson_id: lessonId,
        isDeleted: false,
      });
    } catch (error) {
      throw new Error(`Error counting quizzes by content & lesson: ${error.message}`);
    }
  }
}

module.exports = new QuizService();
