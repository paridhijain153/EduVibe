const User = require('./user.model');

// Get all users
const getAllUsers = async () => {
  return await User.find().select('-password');
};

// Get user by ID
const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

// Update user
const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

// Delete user
const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };