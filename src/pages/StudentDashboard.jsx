import React from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAssignments } from "../hooks/useAssignments";
import AppHeader from "../components/shared/AppHeader";
import { StudentCourseProgress } from "../components/student/StudentCourseProgress";
import { StudentAssignmentHeader } from "../components/student/StudentAssignmentHeader";
import { StudentAssignmentList } from "../components/student/StudentAssignmentList";
import { StudentAssignmentCard } from "../components/student/StudentAssignmentCard";
import { getStudents } from "../utils/storage";
import { Button } from "../components/ui/button";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Get student's assignments and submission data (no course filter)
  const {
    assignments,
    submittedAssignments,
    submitAssignment,
    filteredAssignments,
    studentId,
  } = useAssignments(null);

  // Look up full student profile from storage
  const allStudents = getStudents();
  const currentStudent = allStudents.find((s) => s.id === studentId) || null;

  // Calculate completion stats
  const totalAssignments = assignments.length;
  const completedCount = submittedAssignments.length;
  const pendingCount = totalAssignments - completedCount;

  // Handler for submitting assignments
  const handleSubmit = async (assignmentId) => {
    await submitAssignment(assignmentId);
  };

  // Handler for logout
  const handleLogout = () => {
    // Clear user context and navigate to login
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <AppHeader
        title="Assignment Tracker"
        subtitle="Student Portal"
        userName={currentStudent?.name || "Student"}
        userId={studentId}
        onLogout={handleLogout}
        icon={null}
      />

      {/* Main Content */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Welcome Banner with Student Info */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
              <span className="text-3xl font-bold">
                {currentStudent?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "ST"}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {currentStudent?.name?.split(" ")[0] || "Student"}
                ! 👋
              </h2>
              <p className="text-white/90 text-lg">
                You have {pendingCount} pending assignment
                {pendingCount !== 1 ? "s" : ""} to complete
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="text-2xl font-bold">{totalAssignments}</div>
                <div className="text-xs text-white/80 mt-1">Total</div>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-xs text-white/80 mt-1">Done</div>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-xs text-white/80 mt-1">Pending</div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Overall progress bar */}
        <StudentCourseProgress
          totalAssignments={totalAssignments}
          submittedCount={completedCount}
        />

        {/* Assignment list section */}
        <div className="space-y-4">
          <StudentAssignmentHeader
            selectedCourse={null}
            assignments={filteredAssignments}
          />

          <StudentAssignmentList
            assignments={filteredAssignments}
            renderAssignmentCard={(assignment) => (
              <StudentAssignmentCard
                key={assignment.assignmentId}
                assignment={assignment}
                onSubmitAssignment={handleSubmit}
                submittedAssignments={submittedAssignments}
                studentId={studentId}
              />
            )}
          />
        </div>
      </Motion.div>
    </div>
  );
};

export default StudentDashboard;
