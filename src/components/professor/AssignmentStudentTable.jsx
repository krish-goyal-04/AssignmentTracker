import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * AssignmentStudentTable Component
 *
 * Displays a table of students assigned to an assignment.
 * For each student, shows:
 * - Student ID
 * - Submission status (Submitted or Pending) with colored badge
 * - Date submitted (if applicable)
 * - Action buttons to toggle status or open Drive link
 *
 * Used inside ProfessorAssignmentList when "Details" is clicked.
 */
const AssignmentStudentTable = ({
  students = [],
  submissions = [],
  driveLink,
  onToggleStatus,
  formatDate,
}) => {
  // Show message if no students are assigned
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No students assigned to this assignment yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        {/* Table header */}
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="pb-3 font-semibold">Student ID</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Submitted On</th>
            <th className="pb-3 font-semibold">Actions</th>
          </tr>
        </thead>

        {/* Table body with student rows */}
        <tbody>
          {students.map((studentId, index) => {
            // Find this student's submission record (if exists)
            const submission = submissions.find(
              (sub) => sub.studentId === studentId
            ) || {
              status: "pending",
              submittedOn: null,
            };

            // Check if student has completed the assignment
            const hasSubmitted = submission.status === "completed";

            // Determine badge colors based on status
            const badgeColor = hasSubmitted
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800";

            return (
              <Motion.tr
                key={studentId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {/* Student ID column */}
                <td className="py-3 font-medium text-slate-700">{studentId}</td>

                {/* Status badge column */}
                <td className="py-3">
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${badgeColor}`}
                  >
                    {hasSubmitted ? "✓ Submitted" : "⏳ Pending"}
                  </div>
                </td>

                {/* Submission date column */}
                <td className="py-3 text-slate-600">
                  {submission.submittedOn
                    ? formatDate(submission.submittedOn)
                    : "—"}
                </td>

                {/* Action buttons column */}
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {/* Toggle submission status button */}
                    <button
                      className={`text-sm px-3 py-1.5 rounded-md font-medium transition-all ${
                        hasSubmitted
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                      onClick={() => onToggleStatus(studentId)}
                    >
                      {hasSubmitted ? "Mark Pending" : "Mark Submitted"}
                    </button>

                    {/* Open Drive link button */}
                    {driveLink && (
                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                      >
                        📂 Open Drive
                      </a>
                    )}
                  </div>
                </td>
              </Motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentStudentTable;
