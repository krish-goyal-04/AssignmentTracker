import { useState, useEffect } from "react";
import { getAssignments, saveAssignments } from "../utils/storage";

export function useAssignmentPersistence(
  contextAssignments,
  contextSetAssignments
) {
  const [localAssignments, setLocalAssignments] = useState(
    () => contextAssignments ?? getAssignments() ?? []
  );

  useEffect(() => {
    if (contextAssignments) {
      setLocalAssignments(contextAssignments);
    }
  }, [contextAssignments]);

  const persistAssignments = (assignmentsList) => {
    if (contextSetAssignments) {
      contextSetAssignments(assignmentsList);
    } else {
      saveAssignments(assignmentsList);
    }
    setLocalAssignments(assignmentsList);
  };

  const addAssignment = (newAssignment) => {
    const updatedAssignments = [...localAssignments, newAssignment];
    persistAssignments(updatedAssignments);
    return updatedAssignments;
  };

  const updateAssignment = (assignmentId, updatedAssignment) => {
    const updatedAssignments = localAssignments.map((assignment) =>
      assignment.assignmentId === assignmentId ? updatedAssignment : assignment
    );
    persistAssignments(updatedAssignments);
    return updatedAssignments;
  };

  const deleteAssignment = (assignmentId) => {
    const updatedAssignments = localAssignments.filter(
      (assignment) => assignment.assignmentId !== assignmentId
    );
    persistAssignments(updatedAssignments);
    return updatedAssignments;
  };

  const updateSubmissionStatus = (assignmentId, studentId, newStatus) => {
    const currentDate = new Date().toISOString().slice(0, 10);

    const updatedAssignments = localAssignments.map((assignment) => {
      if (assignment.assignmentId !== assignmentId) return assignment;

      const submissions = [...(assignment.submissions || [])];
      const submissionIndex = submissions.findIndex(
        (s) => s.studentId === studentId
      );

      if (submissionIndex === -1) {
        submissions.push({
          studentId,
          status: newStatus,
          submittedOn: newStatus === "completed" ? currentDate : null,
        });
      } else {
        submissions[submissionIndex] = {
          ...submissions[submissionIndex],
          status: newStatus,
          submittedOn: newStatus === "completed" ? currentDate : null,
        };
      }

      return { ...assignment, submissions };
    });

    persistAssignments(updatedAssignments);
    return updatedAssignments;
  };

  return {
    assignments: localAssignments,
    persistAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    updateSubmissionStatus,
  };
}
