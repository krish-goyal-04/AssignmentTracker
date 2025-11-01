import React from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { SubmissionModal } from "../shared/SubmissionModal";
import { SubmissionSuccessToast } from "../shared/SubmissionSuccessToast";
import { useAssignmentSubmission } from "../../hooks/useAssignmentUI";

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
          <div className="p-6">
            {/* Header: Title + Action button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Assignment title */}
                <h3 className="text-lg font-bold text-slate-800">
                  {assignment.title}
                </h3>

                {/* Status badges: Submitted overrides Due/Past due */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {isSubmitted ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      ✓ Submitted
                      {submittedDate &&
                        ` on ${new Date(submittedDate).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" }
                        )}`}
                    </span>
                  ) : isPastDue ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">
                      ⚠️ Past due
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                      ⏰ Due in {Math.max(daysRemaining, 0)} day
                      {Math.max(daysRemaining, 0) !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">
                    {new Date(assignment.dueDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Submit button (hidden when already submitted) */}
              <div className="flex items-center gap-2">
                {!isSubmitted && (
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                  >
                    ✓ Submit
                  </Button>
                )}
              </div>
            </div>

            {/* Assignment description */}
            <div className="mt-4 text-sm text-slate-600 leading-relaxed">
              <p>{assignment.description}</p>
            </div>

            {/* Footer: Template link + Professor name */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <a
                href={assignment.driveTemplateLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                📄 Open Template
              </a>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                👤 {assignment.professorName}
              </span>
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
