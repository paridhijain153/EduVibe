const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const { getMyNotifications, markNotificationRead } = require('./notification.controller');

router.get('/', protect, getMyNotifications);
router.patch('/:notificationId/read', protect, markNotificationRead);

module.exports = router;