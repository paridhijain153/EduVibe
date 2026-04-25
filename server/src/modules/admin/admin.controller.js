const getDashboardAnalytics = async (req, res) => {
  res.status(200).json({ success: true, message: 'Admin analytics endpoint ready' });
};

const getAllUsers = async (req, res) => {
  res.status(200).json({ success: true, message: 'List users endpoint ready' });
};

const manageCourse = async (req, res) => {
  res.status(200).json({ success: true, message: 'Manage course endpoint ready' });
};

module.exports = {
  getDashboardAnalytics,
  getAllUsers,
  manageCourse,
};
