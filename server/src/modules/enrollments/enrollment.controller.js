const enrollmentService = require('./enrollment.service');

// Enroll in course
const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.enrollStudent(
      req.user.id,
      req.params.courseId
    );
    res.status(201).json({ success: true, message: 'Enrolled successfully', data: enrollment });
  } catch (error) {
    next(error);
  }
};

// Get my enrollments
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getStudentEnrollments(req.user.id);
    res.json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// Get all students in a course
const getCourseEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getCourseEnrollments(req.params.courseId);
    res.json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// Cancel enrollment
const cancelEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.cancelEnrollment(
      req.user.id,
      req.params.courseId
    );
    res.json({ success: true, message: 'Enrollment cancelled', data: enrollment });
  } catch (error) {
    next(error);
  }
};

// Complete enrollment
const completeEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.completeEnrollment(
      req.user.id,
      req.params.courseId
    );
    res.json({ success: true, message: 'Course completed!', data: enrollment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollStudent,
  getMyEnrollments,
  getCourseEnrollments,
  cancelEnrollment,
  completeEnrollment
};