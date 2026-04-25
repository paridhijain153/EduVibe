const Enrollment = require('./enrollment.model');

// Enroll student in course
const enrollStudent = async (studentId, courseId) => {
  // Check if already enrolled
  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });
  if (existing) throw new Error('Already enrolled in this course');

  return await Enrollment.create({
    student: studentId,
    course: courseId
  });
};

// Get all enrollments of a student
const getStudentEnrollments = async (studentId) => {
  return await Enrollment.find({ student: studentId })
    .populate('course', 'title description thumbnail price');
};

// Get all students in a course
const getCourseEnrollments = async (courseId) => {
  return await Enrollment.find({ course: courseId })
    .populate('student', 'name email avatar');
};

// Cancel enrollment
const cancelEnrollment = async (studentId, courseId) => {
  return await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { status: 'cancelled' },
    { new: true }
  );
};

// Complete enrollment
const completeEnrollment = async (studentId, courseId) => {
  return await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { status: 'completed', completedAt: Date.now() },
    { new: true }
  );
};

module.exports = {
  enrollStudent,
  getStudentEnrollments,
  getCourseEnrollments,
  cancelEnrollment,
  completeEnrollment
};