import React from "react";
import { motion as Motion } from "framer-motion";
import { Card } from "../ui/card";
import { SubmissionModal } from "../shared/SubmissionModal";
import { SubmissionSuccessToast } from "../shared/SubmissionSuccessToast";
import { useAssignmentSubmission } from "../../hooks/useAssignmentUI";
import { StatusPill } from "../shared/StatusPill";
import { LoadingButton } from "../shared/LoadingButton";

/**
 * Individual assignment card for students
 * Shows assignment details, due date status, and submit button
 */
export const StudentAssignmentCard = ({
  assignment,
  onSubmitAssignment,
  submittedAssignments,
  studentId,
}) => {
  // Track modal open/close state
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Check if this student has already submitted
  const isSubmitted = submittedAssignments.includes(assignment.assignmentId);

  // Find this student's submission record (if exists)
  const allSubmissions = assignment.submissions || [];
  const studentSubmission = allSubmissions.find(
    (sub) => sub.studentId === studentId
  );
  const submittedDate = studentSubmission?.submittedOn || null;

  // Calculate days until due date
  const dueDateTime = new Date(assignment.dueDate + "T23:59:59");
  const currentTime = new Date();
  const timeDifference = dueDateTime - currentTime;
  const daysRemaining = Math.ceil(timeDifference / 86400000);
  const isPastDue = timeDifference < 0;

  // Hook for submission loading + success state
  const { isSubmitting, showSuccess, handleSubmit } =
    useAssignmentSubmission(onSubmitAssignment);

  // Final confirmation handler
  const confirmSubmission = async () => {
    const success = await handleSubmit(assignment.assignmentId);
    if (success) {
      setIsModalOpen(false); // Close modal on success
    }
  };

  return (
    <>
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="mb-4 last:mb-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Professor name moved to the top and emphasized */}
                <div className="mb-1 text-xs sm:text-[13px] text-slate-500">
                  <span className=" tracking-wide">Professor:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {assignment.professorName || "—"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-3">
                  {assignment.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <StatusPill
                    status={
                      isSubmitted
                        ? "submitted"
                        : isPastDue
                        ? "past-due"
                        : "pending"
                    }
                    daysRemaining={daysRemaining}
                    submittedDate={submittedDate}
                  />
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-700 bg-slate-100 rounded-md px-2 py-1">
                    Due:{" "}
                    {new Date(assignment.dueDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {!isSubmitted && (
                <div className="w-full sm:w-auto">
                  <LoadingButton
                    loading={isSubmitting}
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                  >
                    Submit
                  </LoadingButton>
                </div>
              )}
            </div>

            {assignment.description && (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {assignment.description}
              </p>
            )}

            {/* Actions row */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3 text-sm">
              <a
                href={assignment.driveTemplateLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                📂 Open Template
              </a>
              {isSubmitted && submittedDate && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                  Submitted on{" "}
                  {new Date(submittedDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Motion.div>

      {/* Double-verification modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        title={assignment.title}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={confirmSubmission}
        submitting={isSubmitting}
      />

      {/* Success toast notification */}
      {showSuccess && (
        <SubmissionSuccessToast message="✓ Assignment submitted successfully!" />
      )}
    </>
  );
};
