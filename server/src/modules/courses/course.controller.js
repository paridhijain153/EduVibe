const courseService = require('./course.service');

// Create course
const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse({
      ...req.body,
      instructor: req.user.id  // comes from auth middleware
    });
    res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (error) {
    next(error);
  }
};

// Get all courses
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

// Get single course
const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// Update course
const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.json({ success: true, message: 'Course updated', data: course });
  } catch (error) {
    next(error);
  }
};

// Delete course
const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse };