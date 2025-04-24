const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const PreferenceForm = require('../models/PreferenceForm');
const FormSubmission = require('../models/PreferenceForm');
const { Parser } = require('json2csv');

// @desc    Get faculty reports
// @route   GET /api/reports/faculty
// @access  Private (Faculty only)
exports.getFacultyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, reportType, dateRange, startDate, endDate } = req.query;

    // Get date range filter
    const dateFilter = getDateFilter(dateRange, startDate, endDate);

    // Get faculty's courses if no specific course is selected
    let courses = [];
    if (courseId) {
      const course = await Course.findOne({ _id: courseId, faculty: userId });
      if (course) courses = [course];
    } else {
      courses = await Course.find({ faculty: userId });
    }

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this faculty' });
    }

    let reportData;

    switch (reportType) {
      case 'quiz-performance':
        reportData = await getQuizPerformanceReport(courses, dateFilter);
        break;
      case 'student-engagement':
        reportData = await getStudentEngagementReport(courses, dateFilter);
        break;
      case 'question-analysis':
        reportData = await getQuestionAnalysisReport(courses, dateFilter);
        break;
      default:
        reportData = {
          title: 'No Data Available',
          description: 'Please select a valid report type',
          labels: [],
          datasets: []
        };
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating faculty report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export faculty report as CSV
// @route   GET /api/reports/faculty/export
// @access  Private (Faculty only)
exports.exportFacultyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, reportType, dateRange, startDate, endDate, format = 'csv' } = req.query;

    // Get date range filter
    const dateFilter = getDateFilter(dateRange, startDate, endDate);

    // Get faculty's courses if no specific course is selected
    let courses = [];
    if (courseId) {
      const course = await Course.findOne({ _id: courseId, faculty: userId });
      if (course) courses = [course];
    } else {
      courses = await Course.find({ faculty: userId });
    }

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this faculty' });
    }

    let reportData;

    switch (reportType) {
      case 'quiz-performance':
        reportData = await getQuizPerformanceReport(courses, dateFilter);
        break;
      case 'student-engagement':
        reportData = await getStudentEngagementReport(courses, dateFilter);
        break;
      case 'question-analysis':
        reportData = await getQuestionAnalysisReport(courses, dateFilter);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Convert report data to CSV format
    const csvData = convertReportToCSV(reportData, reportType);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);

    // Send CSV data
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Error exporting faculty report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export management report as CSV
// @route   GET /api/reports/management/export
// @access  Private (Management only)
exports.exportManagementReport = async (req, res) => {
  try {
    const { courseId, reportType, dateRange, startDate, endDate, format = 'csv' } = req.query;

    // Get date range filter
    const dateFilter = getDateFilter(dateRange, startDate, endDate);

    // Get courses based on filter
    let courses = [];
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) courses = [course];
    } else {
      courses = await Course.find({});
    }

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found' });
    }

    let reportData;

    switch (reportType) {
      case 'quiz-performance':
        reportData = await getQuizPerformanceReport(courses, dateFilter);
        break;
      case 'student-engagement':
        reportData = await getStudentEngagementReport(courses, dateFilter);
        break;
      case 'course-comparison':
        reportData = await getCourseComparisonReport(courses, dateFilter);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Convert report data to CSV format
    const csvData = convertReportToCSV(reportData, reportType);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);

    // Send CSV data
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Error exporting management report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get management reports
// @route   GET /api/reports/management
// @access  Private (Management only)
exports.getManagementReports = async (req, res) => {
  try {
    const { courseId, reportType, dateRange, startDate, endDate } = req.query;

    // Get date range filter
    const dateFilter = getDateFilter(dateRange, startDate, endDate);

    // Get courses based on filter
    let courses = [];
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) courses = [course];
    } else {
      courses = await Course.find({});
    }

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found' });
    }

    let reportData;

    switch (reportType) {
      case 'quiz-performance':
        reportData = await getQuizPerformanceReport(courses, dateFilter);
        break;
      case 'student-engagement':
        reportData = await getStudentEngagementReport(courses, dateFilter);
        break;
      case 'course-comparison':
        reportData = await getCourseComparisonReport(courses, dateFilter);
        break;
      default:
        reportData = {
          title: 'No Data Available',
          description: 'Please select a valid report type',
          labels: [],
          datasets: []
        };
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating management report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get date filter based on date range
const getDateFilter = (dateRange, startDate, endDate) => {
  const now = new Date();
  let dateFilter = {};

  switch (dateRange) {
    case 'last-week':
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { $gte: lastWeek, $lte: now };
      break;
    case 'last-month':
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = { $gte: lastMonth, $lte: now };
      break;
    case 'last-semester':
      const lastSemester = new Date(now);
      lastSemester.setMonth(lastSemester.getMonth() - 6);
      dateFilter = { $gte: lastSemester, $lte: now };
      break;
    case 'custom':
      if (startDate && endDate) {
        dateFilter = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      break;
    default:
      // No date filter
      dateFilter = {};
  }

  return dateFilter;
};

// Helper function to get quiz performance report
const getQuizPerformanceReport = async (courses, dateFilter) => {
  // Get all quizzes for the courses within the date range
  const quizzes = await Quiz.find({
    course: { $in: courses.map(course => course._id) },
    isPublished: true,
    ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
  }).sort({ createdAt: 1 });

  if (quizzes.length === 0) {
    return {
      title: 'Quiz Performance Report',
      description: 'No quizzes found for the selected criteria',
      labels: [],
      datasets: [],
      summary: 'No data available'
    };
  }

  // Get all submissions for these quizzes
  const submissions = await QuizSubmission.find({
    quiz: { $in: quizzes.map(quiz => quiz._id) },
    status: 'graded'
  });

  // Group submissions by quiz
  const quizSubmissions = {};
  quizzes.forEach(quiz => {
    quizSubmissions[quiz._id] = submissions.filter(sub => sub.quiz.toString() === quiz._id.toString());
  });

  // Calculate average scores for each quiz
  const labels = [];
  const scores = [];
  const submissionCounts = [];

  quizzes.forEach(quiz => {
    const quizSubs = quizSubmissions[quiz._id];
    labels.push(quiz.title);

    if (quizSubs.length > 0) {
      const totalScore = quizSubs.reduce((sum, sub) => sum + (sub.percentage || 0), 0);
      scores.push(parseFloat((totalScore / quizSubs.length).toFixed(1)));
    } else {
      scores.push(0);
    }

    submissionCounts.push(quizSubs.length);
  });

  // Calculate overall average
  const overallAverage = scores.length > 0
    ? parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
    : 0;

  // Calculate total submissions
  const totalSubmissions = submissionCounts.reduce((sum, count) => sum + count, 0);

  return {
    title: 'Quiz Performance Report',
    description: 'Average scores across quizzes',
    labels,
    datasets: [
      {
        label: 'Average Score (%)',
        data: scores,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Submission Count',
        data: submissionCounts,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ],
    summary: `Overall average score: ${overallAverage}% across ${totalSubmissions} submissions`,
    metrics: {
      totalQuizzes: quizzes.length,
      totalSubmissions,
      averageScore: overallAverage,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    }
  };
};

// Helper function to get student engagement report
const getStudentEngagementReport = async (courses, dateFilter) => {
  // Get all students in these courses
  const courseIds = courses.map(course => course._id);
  const courseStudents = await Course.find({ _id: { $in: courseIds } })
    .select('students');

  // Flatten the array of student arrays
  const studentIds = [];
  courseStudents.forEach(course => {
    if (course.students && course.students.length > 0) {
      studentIds.push(...course.students);
    }
  });

  // Remove duplicates
  const uniqueStudentIds = [...new Set(studentIds)];

  if (uniqueStudentIds.length === 0) {
    return {
      title: 'Student Engagement Report',
      description: 'No students found for the selected courses',
      labels: [],
      datasets: [],
      summary: 'No data available'
    };
  }

  // Get date range for weekly data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 35); // Go back 5 weeks

  // Generate week labels
  const labels = [];
  for (let i = 0; i < 5; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    labels.push(`Week ${i+1}`);
  }

  // Get quiz submissions by week
  const quizSubmissionsByWeek = [];
  const formSubmissionsByWeek = [];

  for (let i = 0; i < 5; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Quiz submissions for this week
    const quizSubs = await QuizSubmission.countDocuments({
      student: { $in: uniqueStudentIds },
      submittedAt: { $gte: weekStart, $lte: weekEnd }
    });
    quizSubmissionsByWeek.push(quizSubs);

    // Form submissions for this week
    const formSubs = await FormSubmission.countDocuments({
      student: { $in: uniqueStudentIds },
      submittedAt: { $gte: weekStart, $lte: weekEnd }
    });
    formSubmissionsByWeek.push(formSubs);
  }

  // Calculate total submissions
  const totalQuizSubmissions = quizSubmissionsByWeek.reduce((sum, count) => sum + count, 0);
  const totalFormSubmissions = formSubmissionsByWeek.reduce((sum, count) => sum + count, 0);

  // Calculate average weekly engagement
  const totalStudents = uniqueStudentIds.length;
  const totalWeeks = 5;
  const totalPossibleEngagements = totalStudents * totalWeeks;
  const totalActualEngagements = totalQuizSubmissions + totalFormSubmissions;
  const averageEngagement = totalPossibleEngagements > 0
    ? parseFloat(((totalActualEngagements / totalPossibleEngagements) * 100).toFixed(1))
    : 0;

  return {
    title: 'Student Engagement Report',
    description: 'Student participation metrics over the last 5 weeks',
    labels,
    datasets: [
      {
        label: 'Quiz Submissions',
        data: quizSubmissionsByWeek,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Form Responses',
        data: formSubmissionsByWeek,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ],
    summary: `Average weekly engagement: ${averageEngagement}%`,
    metrics: {
      totalStudents,
      totalQuizSubmissions,
      totalFormSubmissions,
      averageEngagement
    }
  };
};

// Helper function to get question analysis report
const getQuestionAnalysisReport = async (courses, dateFilter) => {
  // Get all quizzes for the courses
  const quizzes = await Quiz.find({
    course: { $in: courses.map(course => course._id) },
    isPublished: true,
    ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
  });

  if (quizzes.length === 0) {
    return {
      title: 'Question Analysis Report',
      description: 'No quizzes found for the selected criteria',
      labels: [],
      datasets: [],
      summary: 'No data available'
    };
  }

  // Get all submissions for these quizzes
  const submissions = await QuizSubmission.find({
    quiz: { $in: quizzes.map(quiz => quiz._id) },
    status: 'graded'
  });

  // Count questions by type
  const questionTypes = ['multiple-choice', 'true-false', 'multiple-select', 'essay'];
  const questionCounts = {
    'multiple-choice': 0,
    'true-false': 0,
    'multiple-select': 0,
    'essay': 0
  };

  // Track correct answers by question type
  const correctByType = {
    'multiple-choice': 0,
    'true-false': 0,
    'multiple-select': 0,
    'essay': 0
  };

  // Track total answers by question type
  const totalByType = {
    'multiple-choice': 0,
    'true-false': 0,
    'multiple-select': 0,
    'essay': 0
  };

  // Process all quizzes and their questions
  quizzes.forEach(quiz => {
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach(question => {
        if (questionTypes.includes(question.type)) {
          questionCounts[question.type]++;

          // Find submissions for this quiz
          const quizSubmissions = submissions.filter(sub => sub.quiz.toString() === quiz._id.toString());

          quizSubmissions.forEach(submission => {
            if (submission.answers) {
              // Check if the answer is correct
              const answer = submission.answers.find(a => a.questionId === question._id.toString());
              if (answer) {
                totalByType[question.type]++;

                if (answer.isCorrect) {
                  correctByType[question.type]++;
                }
              }
            }
          });
        }
      });
    }
  });

  // Calculate average scores by question type
  const labels = questionTypes.map(type => {
    switch(type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'multiple-select': return 'Multiple Select';
      case 'essay': return 'Essay';
      default: return type;
    }
  });

  const scores = questionTypes.map(type => {
    if (totalByType[type] > 0) {
      return parseFloat(((correctByType[type] / totalByType[type]) * 100).toFixed(1));
    }
    return 0;
  });

  // Find the best performing question type
  let bestType = questionTypes[0];
  let bestScore = scores[0];

  for (let i = 1; i < questionTypes.length; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestType = questionTypes[i];
    }
  }

  // Format the best type for display
  let bestTypeFormatted;
  switch(bestType) {
    case 'multiple-choice': bestTypeFormatted = 'Multiple Choice'; break;
    case 'true-false': bestTypeFormatted = 'True/False'; break;
    case 'multiple-select': bestTypeFormatted = 'Multiple Select'; break;
    case 'essay': bestTypeFormatted = 'Essay'; break;
    default: bestTypeFormatted = bestType;
  }

  return {
    title: 'Question Analysis Report',
    description: 'Performance breakdown by question type',
    labels,
    datasets: [
      {
        label: 'Average Score (%)',
        data: scores,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      },
      {
        label: 'Question Count',
        data: questionTypes.map(type => questionCounts[type]),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ],
    summary: `Students perform best on ${bestTypeFormatted} questions (${bestScore}%)`,
    metrics: {
      totalQuestions: Object.values(questionCounts).reduce((sum, count) => sum + count, 0),
      questionCounts,
      averageScores: questionTypes.reduce((obj, type, index) => {
        obj[type] = scores[index];
        return obj;
      }, {})
    }
  };
};

// Helper function to get course comparison report
const getCourseComparisonReport = async (courses, dateFilter) => {
  if (courses.length === 0) {
    return {
      title: 'Course Comparison Report',
      description: 'No courses found for comparison',
      labels: [],
      datasets: [],
      summary: 'No data available'
    };
  }

  // Get data for each course
  const courseData = await Promise.all(courses.map(async (course) => {
    // Get quizzes for this course
    const quizzes = await Quiz.find({
      course: course._id,
      isPublished: true,
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
    });

    // Get submissions for these quizzes
    const submissions = await QuizSubmission.find({
      quiz: { $in: quizzes.map(quiz => quiz._id) },
      status: 'graded'
    });

    // Calculate average score
    let averageScore = 0;
    if (submissions.length > 0) {
      const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
      averageScore = parseFloat((totalScore / submissions.length).toFixed(1));
    }

    // Calculate completion rate
    const studentCount = course.students ? course.students.length : 0;
    const quizCount = quizzes.length;
    let completionRate = 0;

    if (studentCount > 0 && quizCount > 0) {
      const expectedSubmissions = studentCount * quizCount;
      completionRate = parseFloat(((submissions.length / expectedSubmissions) * 100).toFixed(1));
    }

    return {
      name: `${course.name} (${course.code})`,
      averageScore,
      completionRate,
      studentCount,
      quizCount,
      submissionCount: submissions.length
    };
  }));

  // Sort courses by average score
  courseData.sort((a, b) => b.averageScore - a.averageScore);

  // Prepare data for chart
  const labels = courseData.map(course => course.name);
  const averageScores = courseData.map(course => course.averageScore);
  const completionRates = courseData.map(course => course.completionRate);

  // Find the best performing course
  const bestCourse = courseData.length > 0 ? courseData[0] : null;

  return {
    title: 'Course Comparison Report',
    description: 'Performance metrics across courses',
    labels,
    datasets: [
      {
        label: 'Average Quiz Score',
        data: averageScores,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Completion Rate',
        data: completionRates,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ],
    summary: bestCourse
      ? `${bestCourse.name} shows the highest overall performance with an average score of ${bestCourse.averageScore}%`
      : 'No course data available for comparison',
    metrics: {
      totalCourses: courseData.length,
      courseData
    }
  };
};

// Helper function to convert report data to CSV format
const convertReportToCSV = (reportData, reportType) => {
  try {
    let fields = [];
    let data = [];

    switch (reportType) {
      case 'quiz-performance':
        // Prepare data for quiz performance report
        fields = ['Quiz', 'Average Score', 'Submission Count'];
        data = reportData.labels.map((label, index) => ({
          Quiz: label,
          'Average Score': reportData.datasets[0].data[index],
          'Submission Count': reportData.datasets[1].data[index]
        }));

        // Add summary row
        data.push({
          Quiz: 'SUMMARY',
          'Average Score': reportData.metrics.averageScore,
          'Submission Count': reportData.metrics.totalSubmissions
        });
        break;

      case 'student-engagement':
        // Prepare data for student engagement report
        fields = ['Week', 'Quiz Submissions', 'Form Responses', 'Total Engagement'];
        data = reportData.labels.map((label, index) => ({
          Week: label,
          'Quiz Submissions': reportData.datasets[0].data[index],
          'Form Responses': reportData.datasets[1].data[index],
          'Total Engagement': reportData.datasets[0].data[index] + reportData.datasets[1].data[index]
        }));

        // Add summary row
        data.push({
          Week: 'SUMMARY',
          'Quiz Submissions': reportData.metrics.totalQuizSubmissions,
          'Form Responses': reportData.metrics.totalFormSubmissions,
          'Total Engagement': reportData.metrics.totalQuizSubmissions + reportData.metrics.totalFormSubmissions
        });
        break;

      case 'question-analysis':
        // Prepare data for question analysis report
        fields = ['Question Type', 'Average Score', 'Question Count'];
        data = reportData.labels.map((label, index) => ({
          'Question Type': label,
          'Average Score': reportData.datasets[0].data[index],
          'Question Count': reportData.datasets[1].data[index]
        }));
        break;

      case 'course-comparison':
        // Prepare data for course comparison report
        fields = ['Course', 'Average Score', 'Completion Rate', 'Student Count', 'Quiz Count'];
        data = reportData.metrics.courseData.map(course => ({
          Course: course.name,
          'Average Score': course.averageScore,
          'Completion Rate': course.completionRate,
          'Student Count': course.studentCount,
          'Quiz Count': course.quizCount
        }));
        break;

      default:
        // Default empty data
        fields = ['No Data'];
        data = [{ 'No Data': 'No data available for this report type' }];
    }

    // Add metadata
    const metadata = [
      { Metadata: 'Report Type', Value: reportData.title },
      { Metadata: 'Generated On', Value: new Date().toISOString() },
      { Metadata: 'Summary', Value: reportData.summary }
    ];

    // Create CSV parser
    const metadataParser = new Parser({ fields: ['Metadata', 'Value'] });
    const dataParser = new Parser({ fields });

    // Generate CSV
    const metadataCSV = metadataParser.parse(metadata);
    const dataCSV = dataParser.parse(data);

    // Combine metadata and data
    return `${metadataCSV}\n\n${dataCSV}`;
  } catch (error) {
    console.error('Error converting report to CSV:', error);
    return 'Error generating CSV';
  }
};