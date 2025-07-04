const Admin = require('../models/admin_model');
const Community = require("../models/community_model");
const Exam = require("../models/exam_model");
const Book = require("../models/library_book_model");
const RecordExam = require("../models/record_exam");
const Student = require('../models/student_model');
const Subject = require("../models/subjects_model");
const TopicContent = require("../models/topic_content_model");
const Topic = require("../models/topic_in_subject");
const Wallet = require("../models/wallet_model");

const getDashboardInfo = async () => {
  try {
    const [
      totalAdmins,
      totalCommunities,
      totalExams,
      totalBooks,
      totalRecordedExams,
      totalStudents,
      totalSubjects,
      totalTopicContents,
      totalTopics,
      totalWallets,
      activeStudents,
      publishedExams,
      visibleBooks,
      visibleSubjects,
      studentsByLevel,
      examsBySubject,
      topicsBySubject,
      communitiesByLevel
    ] = await Promise.all([
      // Basic counts
      Admin.countDocuments(),
      Community.countDocuments(),
      Exam.countDocuments(),
      Book.countDocuments(),
      RecordExam.countDocuments(),
      Student.countDocuments(),
      Subject.countDocuments(),
      TopicContent.countDocuments(),
      Topic.countDocuments(),
      Wallet.countDocuments(),
      Student.countDocuments({ subscription_status: 'active' }),
      Exam.countDocuments({ isPublished: true }),
      Book.countDocuments({ showBook: true }),
      Subject.countDocuments({ showSubject: true }),

      // Data for bar graph 1: Students by education level
      Student.aggregate([
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 }
          }
        }
      ]),

      // Data for bar graph 2: Exams by subject
      Exam.aggregate([
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectData"
          }
        },
        { $unwind: "$subjectData" },
        {
          $group: {
            _id: "$subjectData.subjectName",
            count: { $sum: 1 }
          }
        }
      ]),

      // Data for pie chart 1: Topics by subject
      Topic.aggregate([
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectData"
          }
        },
        { $unwind: "$subjectData" },
        {
          $group: {
            _id: "$subjectData.subjectName",
            count: { $sum: 1 }
          }
        }
      ]),

      // Data for pie chart 2: Communities by level
      Community.aggregate([
        {
          $group: {
            _id: "$Level",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format data for frontend charts
    const barGraph1 = {
      title: "Students by Education Level",
      labels: studentsByLevel.map(item => item._id),
      data: studentsByLevel.map(item => item.count)
    };

    const barGraph2 = {
      title: "Exams by Subject",
      labels: examsBySubject.map(item => item._id),
      data: examsBySubject.map(item => item.count)
    };

    const pieChart1 = {
      title: "Topics Distribution by Subject",
      data: topicsBySubject.map(item => ({
        name: item._id,
        value: item.count
      }))
    };

    const pieChart2 = {
      title: "Communities by Education Level",
      data: communitiesByLevel.map(item => ({
        name: item._id,
        value: item.count
      }))
    };

    return {
      counts: {
        admins: totalAdmins,
        communities: totalCommunities,
        exams: totalExams,
        books: totalBooks,
        recordedExams: totalRecordedExams,
        students: totalStudents,
        subjects: totalSubjects,
        topicContents: totalTopicContents,
        topics: totalTopics,
        wallets: totalWallets
      },
      stats: {
        activeStudents,
        publishedExams,
        visibleBooks,
        visibleSubjects,
        activePercentage: totalStudents
          ? Math.round((activeStudents / totalStudents) * 100)
          : 0
      },
      charts: {
        barGraph1,
        barGraph2,
        pieChart1,
        pieChart2
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
};

module.exports = { getDashboardInfo };
