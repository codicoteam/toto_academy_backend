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
      booksByLevel  // Changed from communitiesByLevel to booksByLevel
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

      // REPLACED: Communities by level with Books by level
      Book.aggregate([
        {
          $group: {
            _id: "$level",
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

    // UPDATED: Changed to Books by Education Level
    const pieChart2 = {
      title: "Library Books by Education Level",
      data: booksByLevel.map(item => ({
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

const getWalletAnalytics = async () => {
  try {
    // Get all wallets with populated student information
    const wallets = await Wallet.find()
      .populate("student", "firstName lastName email level")
      .lean();

    // Calculate total balance across all wallets
    const totalBalance = wallets.reduce(
      (sum, wallet) => sum + wallet.balance,
      0
    );

    // Calculate total deposits and withdrawals
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawalCount = 0;

    // Process transactions
    const transactionStats = {
      byMethod: {
        bank_transfer: { deposits: 0, withdrawals: 0, total: 0 },
        ecocash: { deposits: 0, withdrawals: 0, total: 0 },
        "inn bucks": { deposits: 0, withdrawals: 0, total: 0 },
        other: { deposits: 0, withdrawals: 0, total: 0 },
      },
      byStatus: {
        pending: 0,
        completed: 0,
        failed: 0,
      },
      dailyVolume: {},
    };

    // Process all transactions from all wallets
    wallets.forEach((wallet) => {
      // Process deposits
      wallet.deposits.forEach((deposit) => {
        totalDeposits += deposit.amount;
        depositCount++;

        // Track by method
        if (transactionStats.byMethod[deposit.method]) {
          transactionStats.byMethod[deposit.method].deposits += deposit.amount;
          transactionStats.byMethod[deposit.method].total += deposit.amount;
        }

        // Track by status
        transactionStats.byStatus[deposit.status] =
          (transactionStats.byStatus[deposit.status] || 0) + 1;

        // Track daily volume
        const date = deposit.date.toISOString().split("T")[0];
        transactionStats.dailyVolume[date] =
          (transactionStats.dailyVolume[date] || 0) + deposit.amount;
      });

      // Process withdrawals
      wallet.withdrawals.forEach((withdrawal) => {
        totalWithdrawals += withdrawal.amount;
        withdrawalCount++;

        // Track by method
        if (transactionStats.byMethod[withdrawal.method]) {
          transactionStats.byMethod[withdrawal.method].withdrawals +=
            withdrawal.amount;
          transactionStats.byMethod[withdrawal.method].total +=
            withdrawal.amount;
        }

        // Track by status
        transactionStats.byStatus[withdrawal.status] =
          (transactionStats.byStatus[withdrawal.status] || 0) + 1;

        // Track daily volume
        const date = withdrawal.date.toISOString().split("T")[0];
        transactionStats.dailyVolume[date] =
          (transactionStats.dailyVolume[date] || 0) - withdrawal.amount;
      });
    });

    // Get top 10 students by balance
    const topStudentsByBalance = [...wallets]
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10)
      .map((wallet) => ({
        student: wallet.student,
        balance: wallet.balance,
        currency: wallet.currency,
      }));

    // Get top 10 students by deposits
    const studentDeposits = wallets.map((wallet) => {
      const totalDeposit = wallet.deposits.reduce((sum, deposit) => {
        return deposit.status === "completed" ? sum + deposit.amount : sum;
      }, 0);

      return {
        student: wallet.student,
        totalDeposit,
      };
    });

    const topStudentsByDeposits = studentDeposits
      .sort((a, b) => b.totalDeposit - a.totalDeposit)
      .slice(0, 10);

    // Get top 10 students by withdrawals
    const studentWithdrawals = wallets.map((wallet) => {
      const totalWithdrawal = wallet.withdrawals.reduce((sum, withdrawal) => {
        return withdrawal.status === "completed"
          ? sum + withdrawal.amount
          : sum;
      }, 0);

      return {
        student: wallet.student,
        totalWithdrawal,
      };
    });

    const topStudentsByWithdrawals = studentWithdrawals
      .sort((a, b) => b.totalWithdrawal - a.totalWithdrawal)
      .slice(0, 10);

    // Calculate net flow (deposits - withdrawals)
    const netFlow = totalDeposits - totalWithdrawals;

    // Prepare data for charts
    const transactionMethodChart = {
      title: "Transactions by Method",
      data: Object.entries(transactionStats.byMethod).map(
        ([method, stats]) => ({
          name: method,
          deposits: stats.deposits,
          withdrawals: stats.withdrawals,
          total: stats.total,
        })
      ),
    };

    const transactionStatusChart = {
      title: "Transactions by Status",
      data: Object.entries(transactionStats.byStatus).map(
        ([status, count]) => ({
          name: status,
          value: count,
        })
      ),
    };

    const dailyVolumeChart = {
      title: "Daily Transaction Volume",
      labels: Object.keys(transactionStats.dailyVolume),
      data: Object.values(transactionStats.dailyVolume),
    };

    return {
      summary: {
        totalWallets: wallets.length,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        netFlow,
        depositCount,
        withdrawalCount,
        averageDeposit: depositCount > 0 ? totalDeposits / depositCount : 0,
        averageWithdrawal:
          withdrawalCount > 0 ? totalWithdrawals / withdrawalCount : 0,
      },
      transactionStats,
      topStudents: {
        byBalance: topStudentsByBalance,
        byDeposits: topStudentsByDeposits,
        byWithdrawals: topStudentsByWithdrawals,
      },
      charts: {
        transactionMethodChart,
        transactionStatusChart,
        dailyVolumeChart,
      },
      allWallets: wallets, // Return all wallet data as requested
    };
  } catch (error) {
    throw new Error(`Failed to fetch wallet analytics: ${error.message}`);
  }
};



const getStudentInfoOnLevel = async (level, studentId) => {
  try {
    // Verify student exists and matches the level
    const student = await Student.findOne({
      _id: studentId,
      level: level
    });

    if (!student) {
      throw new Error('Student not found or level mismatch');
    }

    // Get 6 random subjects for the specified level
    const randomSubjects = await Subject.aggregate([
      { $match: { Level: level, showSubject: true } },
      { $sample: { size: 6 } },
      { $project: { subjectName: 1, imageUrl: 1, Level: 1 } }
    ]);

    // Get 8 random communities for the specified level
    const randomCommunities = await Community.aggregate([
      { $match: { Level: level, showCommunity: true } },
      { $sample: { size: 8 } },
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
        $project: {
          name: 1,
          profilePicture: 1,
          Level: 1,
          subjectName: "$subjectData.subjectName",
          studentsCount: { $size: "$students" }
        }
      }
    ]);

    // Get 8 random books for the specified level
    const randomBooks = await Book.aggregate([
      { $match: { level: level, showBook: true } },
      { $sample: { size: 8 } },
      { $project: { title: 1, coverImage: 1, level: 1, author: 1 } }
    ]);

    return {
      studentInfo: {
        id: student._id,
        name: student.name,
        level: student.level,
        subscription_status: student.subscription_status
      },
      recommendedSubjects: randomSubjects,
      recommendedCommunities: randomCommunities,
      recommendedBooks: randomBooks
    };
  } catch (error) {
    throw new Error(`Failed to fetch student level information: ${error.message}`);
  }
};

module.exports = { getDashboardInfo, getWalletAnalytics, getStudentInfoOnLevel };