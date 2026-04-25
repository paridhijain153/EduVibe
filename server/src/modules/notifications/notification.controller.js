const getMyNotifications = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get notifications endpoint ready' });
};

const markNotificationRead = async (req, res) => {
  res.status(200).json({ success: true, message: 'Mark notification as read endpoint ready' });
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
};
