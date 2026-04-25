const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../../middlewares/auth.middleware');
const { ROLES } = require('../../constants/roles');
const { getAllUsers, getDashboardAnalytics, manageCourse } = require('./admin.controller');

router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get('/analytics', getDashboardAnalytics);
router.get('/users', getAllUsers);
router.patch('/courses/:courseId', manageCourse);

module.exports = router;