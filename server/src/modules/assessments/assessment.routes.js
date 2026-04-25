const express = require('express');
const router = express.Router();

const { protect } = require('../../middlewares/auth.middleware');

const {
  createQuiz,
  submitQuiz,
  submitAssignment,
  gradeAssignment
} = require('./assessment.controller');

router.post('/quizzes', protect, createQuiz);
router.post('/quizzes/:quizId/submit', protect, submitQuiz);
router.post('/assignments/:assignmentId/submit', protect, submitAssignment);
router.post('/assignments/:submissionId/grade', protect, gradeAssignment);

module.exports = router;