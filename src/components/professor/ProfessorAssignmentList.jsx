import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { EmptyState } from "../shared/EmptyState";
import AssignmentStudentTable from "./AssignmentStudentTable";

/**
 * ProfessorAssignmentList Component
 *
 * Displays a list of assignments created by the professor.
 * Each assignment card shows:
 * - Title, description, due date
 * - Status pill (Active, Due soon, Past due)
 * - Student count and submission count
 * - Action buttons: Details, Edit, Delete
 *
 * When "Details" is clicked, expands to show student submission table.
 * Uses Motion for smooth card animations on mount and expand/collapse.
 */
export const ProfessorAssignmentList = ({
  assignments,
  activeId,
  onToggleDetails,
  onEdit,
  onDelete,
  onToggleStatus,
  formatDate,
}) => {
  // Show empty state if no assignments exist
  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        message="No assignments found"
        description="Use the New button to create an assignment."
      />
    );
  }

  return (
    <div className="grid gap-6">
      {assignments.map((assignment, index) => {
        // Calculate due date status
        const today = new Date();
        const dueDate = new Date(assignment.dueDate + "T23:59:59");
        const timeDifference = dueDate - today;
        const daysRemaining = Math.ceil(timeDifference / 86400000);
        const isPastDue = timeDifference < 0;

        // Determine status pill color and text
        let statusColor = "bg-emerald-100 text-emerald-700"; // Default: Active
        let statusText = "Active";

        if (isPastDue) {
          statusColor = "bg-rose-100 text-rose-700";
          statusText = "Past due";
        } else if (daysRemaining <= 7) {
          statusColor = "bg-amber-100 text-amber-800";
          statusText = `Due in ${Math.max(daysRemaining, 0)}d`;
        }

        // Calculate submission progress
        const submissionsArray = assignment.submissions || [];
        const completedSubmissions = submissionsArray.filter(
          (submission) => submission.status === "completed"
        ).length;
        const totalStudents = assignment.studentsAssigned?.length || 0;

        // Check if this assignment is expanded
        const isExpanded = activeId === assignment.assignmentId;

        return (
          <Motion.div
            key={assignment.assignmentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Main assignment info section */}
              <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left side: Title, description, stats */}
                <div className="flex-1 min-w-0">
                  {/* Title row with status pill and due date */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-800 truncate">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      {/* Status pill showing urgency */}
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor}`}
                      >
                        {statusText}
                      </span>

                      {/* Due date display */}
                      <div className="text-xs text-slate-500">
                        Due:{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate
                            ? formatDate(assignment.dueDate)
                            : assignment.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description text (if present) */}
                  {assignment.description && (
                    <p className="mt-2 text-sm text-slate-600">
                      {assignment.description}
                    </p>
                  )}

                  {/* Bottom stats: students assigned and submitted */}
                  <div className="mt-3 text-sm text-slate-500 flex items-center gap-3">
                    <span>👥 {totalStudents} students assigned</span>
                    <span className="text-slate-400">•</span>
                    <span>
                      📄 {completedSubmissions}/{totalStudents} submitted
                    </span>
                  </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      onToggleDetails &&
                      onToggleDetails(assignment.assignmentId)
                    }
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onEdit && onEdit(assignment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      onDelete && onDelete(assignment.assignmentId)
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Expandable student submission table */}
              <AnimatePresence>
                {isExpanded && (
                  <Motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t bg-slate-50">
                      <AssignmentStudentTable
                        students={assignment.studentsAssigned || []}
                        submissions={submissionsArray}
                        driveLink={
                          assignment.driveTemplateLink ||
                          assignment.driveLink ||
                          ""
                        }
                        onToggleStatus={(studentId) =>
                          onToggleStatus &&
                          onToggleStatus(assignment.assignmentId, studentId)
                        }
                        formatDate={formatDate}
                      />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </Card>
          </Motion.div>
        );
      })}
    </div>
  );
};
