import { useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

/**
 * Hook for managing student assignments
 * Provides filtered assignments, submission tracking, and course filtering
 */
export const useAssignments = (selectedCourse) => {
  // Get the logged-in student's ID from URL params
  const params = useParams();
  const studentId = params.studentId?.toUpperCase();

  // Get all assignments and the submission handler from context
  const { assignments, updateAssignment } = useContext(AppContext);

  // Step 1: Find all assignments assigned to this student
  const allAssignments = assignments || [];
  const studentAssignments = allAssignments.filter((assignment) => {
    const assignedStudents = assignment.studentsAssigned || [];
    return assignedStudents.includes(studentId);
  });

  // Step 2: Extract unique course names (skip empty/null courses)
  const coursesWithData = studentAssignments
    .map((a) => a.course)
    .filter((c) => c);
  const uniqueCourses = [...new Set(coursesWithData)];

  // Step 3: Find which assignments this student has already submitted
  const submittedAssignmentIds = [];
  studentAssignments.forEach((assignment) => {
    const submissions = assignment.submissions || [];
    const studentSubmission = submissions.find(
      (sub) => sub.studentId === studentId && sub.status === "completed"
    );
    if (studentSubmission) {
      submittedAssignmentIds.push(assignment.assignmentId);
    }
  });

  // Step 4: Filter assignments by selected course (if any)
  let displayedAssignments = studentAssignments;
  if (selectedCourse) {
    displayedAssignments = studentAssignments.filter(
      (assignment) => assignment.course === selectedCourse
    );
  }

  // Step 5: Handler to submit an assignment
  const submitAssignment = async (assignmentId) => {
    try {
      // Call the context method to mark as submitted
      await updateAssignment(studentId, assignmentId);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      throw error;
    }
  };

  return {
    assignments: studentAssignments, // All student's assignments
    courses: uniqueCourses, // Available course filters
    submittedAssignments: submittedAssignmentIds, // IDs of submitted assignments
    submitAssignment, // Function to submit
    filteredAssignments: displayedAssignments, // Filtered by course
    studentId, // Current student ID
  };
};
