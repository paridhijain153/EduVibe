// Centralized route table for react-router-dom v6.
// Generated to mirror the original TanStack file-based routes.
import { Routes, Route, Navigate } from "react-router-dom";

import Index from "./routes/index.jsx";
import CoursesLayout from "./routes/courses.jsx";
import CoursesIndex from "./routes/courses.index.jsx";
import CourseDetail from "./routes/courses.$slug.jsx";
import CheckoutPage from "./routes/checkout.$slug.jsx";
import CheckoutSuccess from "./routes/checkout.success.$slug.jsx";
import LearnPage from "./routes/learn.$slug.jsx";
import Login from "./routes/login.jsx";
import Signup from "./routes/signup.jsx";
import Forgot from "./routes/forgot.jsx";
import Instructors from "./routes/instructors.jsx";

import DashboardIndex from "./routes/dashboard.index.jsx";
import DashboardCourses from "./routes/dashboard.courses.jsx";
import DashboardCertificates from "./routes/dashboard.certificates.jsx";
import DashboardPayments from "./routes/dashboard.payments.jsx";
import DashboardWishlist from "./routes/dashboard.wishlist.jsx";

import InstructorIndex from "./routes/instructor.index.jsx";
import InstructorCourses from "./routes/instructor.courses.jsx";
import InstructorCourseDetail from "./routes/instructor.courses.$id.jsx";
import InstructorAnalytics from "./routes/instructor.analytics.jsx";
import InstructorNew from "./routes/instructor.new.jsx";

import AdminIndex from "./routes/admin.index.jsx";
import AdminCourses from "./routes/admin.courses.jsx";
import AdminCourseDetail from "./routes/admin.courses.$id.jsx";
import AdminStudents from "./routes/admin.students.jsx";
import AdminStudentDetail from "./routes/admin.students.$id.jsx";
import AdminUsers from "./routes/admin.users.jsx";
import AdminPayments from "./routes/admin.payments.jsx";
import AdminCertificates from "./routes/admin.certificates.jsx";
import AdminAnalytics from "./routes/admin.analytics.jsx";
import AdminSettings from "./routes/admin.settings.jsx";

import NotFound from "./not-found.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route path="/courses" element={<CoursesLayout />}>
        <Route index element={<CoursesIndex />} />
        <Route path=":slug" element={<CourseDetail />} />
      </Route>

      <Route path="/checkout/:slug" element={<CheckoutPage />} />
      <Route path="/checkout/success/:slug" element={<CheckoutSuccess />} />

      <Route path="/learn/:slug" element={<LearnPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/instructors" element={<Instructors />} />

      <Route path="/dashboard">
        <Route index element={<DashboardIndex />} />
        <Route path="courses" element={<DashboardCourses />} />
        <Route path="certificates" element={<DashboardCertificates />} />
        <Route path="payments" element={<DashboardPayments />} />
        <Route path="wishlist" element={<DashboardWishlist />} />
      </Route>

      <Route path="/instructor">
        <Route index element={<InstructorIndex />} />
        <Route path="courses" element={<InstructorCourses />} />
        <Route path="courses/:id" element={<InstructorCourseDetail />} />
        <Route path="analytics" element={<InstructorAnalytics />} />
        <Route path="new" element={<InstructorNew />} />
      </Route>

      <Route path="/admin">
        <Route index element={<AdminIndex />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:id" element={<AdminCourseDetail />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/:id" element={<AdminStudentDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
