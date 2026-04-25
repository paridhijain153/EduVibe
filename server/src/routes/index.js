const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const courseRoutes = require('../modules/courses/course.routes');
const enrollmentRoutes = require('../modules/enrollments/enrollment.routes');
const assessmentRoutes = require('../modules/assessments/assessment.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');
const adminRoutes = require('../modules/admin/admin.routes');

// TEST ROUTE
router.get('/test', (req, res) => {
  res.json({ message: 'API is working 🚀' });
});

router.use('/assessments', assessmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/courses', courseRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
