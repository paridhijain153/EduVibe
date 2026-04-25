const express = require('express');
const router = express.Router();
const {
  enrollStudent,
  getMyEnrollments,
  getCourseEnrollments,
  cancelEnrollment,
  completeEnrollment
} = require('./enrollment.controller');

router.post('/:courseId', enrollStudent);          // enroll in a course
router.get('/my', getMyEnrollments);               // get my enrollments
router.get('/course/:courseId', getCourseEnrollments); // get all students in course
router.put('/cancel/:courseId', cancelEnrollment); // cancel enrollment
router.put('/complete/:courseId', completeEnrollment); // complete enrollment

module.exports = router;