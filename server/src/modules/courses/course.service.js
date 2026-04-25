const Course = require('./course.model');

// Create course
const createCourse = async (data) => {
  return await Course.create(data);
};

// Get all courses
const getAllCourses = async () => {
  return await Course.find({ isPublished: true }).populate('instructor', 'name email');
};

// Get course by ID
const getCourseById = async (id) => {
  return await Course.findById(id).populate('instructor', 'name email');
};

// Update course
const updateCourse = async (id, data) => {
  return await Course.findByIdAndUpdate(id, data, { new: true });
};

// Delete course
const deleteCourse = async (id) => {
  return await Course.findByIdAndDelete(id);
};

module.exports = { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse };