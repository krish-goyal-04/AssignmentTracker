import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { motion } from "framer-motion";
import { getStudents } from "../utils/storage";
const StudentDashboard = () => {
  const params = useParams();
  const studentId = params.studentId?.toUpperCase();
  const { assignments, updateAssignment } = useContext(AppContext);
  console.log("Assignments from students dashboard", assignments);
  // Modal state for double-confirmation of submission
  const [confirming, setConfirming] = useState(null); // { assignmentId, title } or null
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // filter assignments assigned to this student (simple, no memo)
  const studentAssignments = assignments
    ? assignments.filter((a) => a.studentsAssigned?.includes(studentId))
    : [];
  console.log(studentAssignments);
  // stats derived (compute directly)
  const total = studentAssignments.length;
  let completed = 0;
  for (const a of studentAssignments) {
    const s = a.submissions?.find((x) => x.studentId === studentId);
    if (s?.status === "completed") completed += 1;
  }
  const pending = Math.max(0, total - completed);
  const stats = {
    total,
    completed,
    pending,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };

  const cardItems = [
    { title: "Total Assignments", color: "text-slate-500", value: stats.total },
    { title: "Completed", color: "text-green-500", value: stats.completed },
    { title: "Pending", color: "text-red-500", value: stats.pending },
  ];

  // helper: format date display
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // helper: days left / overdue
  const daysLeft = (isoDate) => {
    const today = new Date();
    const due = new Date(isoDate + "T23:59:59"); // treat due date as whole day
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // submit handler (final confirmation)
  const handleFinalConfirm = async (assignmentId) => {
    setSubmitting(true);
    try {
      // call context update which should update local storage / state
      await updateAssignment(studentId, assignmentId);
      setSuccessMsg("Submission confirmed successfully.");
      // close modal after short delay
      setTimeout(() => {
        setSuccessMsg("");
        setConfirming(null);
      }, 1200);
    } catch (err) {
      // graceful error fallback
      console.error(err);
      setSuccessMsg("Something went wrong. Try again.");
      setTimeout(() => setSuccessMsg(""), 1600);
    } finally {
      setSubmitting(false);
    }
  };

  // when assignments change clear successMessage after a bit
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Your Assignments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track progress and confirm submissions. Only assignments assigned to
            you are shown.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cardItems.map((item, ind) => (
          <Card className="p-4" key={ind}>
            <div className={`text-sm ${item.color}`}>{item.title}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-800">
              {item.value}
            </div>
          </Card>
        ))}

        <Card className="p-4">
          <div className="text-sm text-slate-500">Overall Progress</div>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={stats.progress} />
            <div className="text-sm font-semibold">{stats.progress}%</div>
          </div>
        </Card>
      </div>

      {/* Assignment list */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Assignments</h2>

        {studentAssignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-medium text-slate-700">
              No assignments yet
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Your professor will assign tasks. Check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentAssignments.map((a) => {
              const submission = a.submissions?.find(
                (s) => s.studentId === studentId
              );
              const isCompleted = submission?.status === "completed";
              const dueIn = daysLeft(a.dueDate);
              const isPastDue = dueIn < 0;
              const dueLabel = isPastDue
                ? "Past due"
                : dueIn === 0
                ? "Due today"
                : `${dueIn}d left`;

              return (
                <div key={a.assignmentId}>
                  <Card className="overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-800 truncate">
                            {a.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-3">
                            {a.description}
                          </p>

                          <div className="mt-3 flex items-center text-xs text-slate-500 gap-3">
                            <div>
                              Professor:{" "}
                              <span className="font-medium text-slate-700">
                                {a.professorName}
                              </span>
                            </div>
                            <div>
                              Due:{" "}
                              <span className="font-medium text-slate-700">
                                {formatDate(a.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              isCompleted
                                ? "bg-green-100 text-green-800"
                                : isPastDue
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isCompleted
                              ? "Completed"
                              : isPastDue
                              ? "Past Due"
                              : "Pending"}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            {dueLabel}
                          </div>
                        </div>
                      </div>

                      {/* Progress per assignment (shows class progress for reference - we show student's own status visually) */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                          <span>Submission status</span>
                          <span className="font-medium text-slate-700">
                            {isCompleted ? "Submitted" : "Not submitted"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCompleted ? "bg-green-600" : "bg-blue-500"
                            }`}
                            style={{ width: isCompleted ? "100%" : "6%" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4 bg-slate-50 border-t flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        {isCompleted
                          ? `Submitted: ${formatDate(submission.submittedOn)}`
                          : isPastDue
                          ? "Overdue"
                          : "Due soon"}
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          className="text-sm rounded-md px-3 py-2 bg-white border hover:bg-gray-50"
                          onClick={() =>
                            window.open(a.driveTemplateLink, "_blank")
                          }
                        >
                          Open Template
                        </Button>

                        {!isCompleted && (
                          <Button
                            className="text-sm rounded-md px-3 py-2 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() =>
                              setConfirming({
                                assignmentId: a.assignmentId,
                                title: a.title,
                              })
                            }
                          >
                            Confirm Submission
                          </Button>
                        )}

                        {isCompleted && (
                          <Button
                            className="text-sm rounded-md px-3 py-2 bg-gray-100 text-slate-800"
                            onClick={() =>
                              window.open(a.driveTemplateLink, "_blank")
                            }
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Double-confirmation modal */}
      {/*<AnimatePresence>*/}
      {confirming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setConfirming(null)}
          />
          <motion.div
            initial={{ y: 12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Confirm submission
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you have submitted{" "}
                <span className="font-medium">{confirming.title}</span> on
                Drive?
              </p>

              <div className="mt-4 text-sm text-slate-600">
                <p>Steps (double verification):</p>
                <ol className="list-decimal list-inside ml-3 mt-2 text-slate-500">
                  <li>
                    Open the assignment template and upload your work to Drive.
                  </li>
                  <li>
                    Make sure sharing link / permissions allow professor to
                    view.
                  </li>
                  <li>
                    Click Confirm Submission → Final Confirm to mark as
                    submitted.
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t">
              <Button
                className="bg-white border text-slate-700"
                onClick={() => !submitting && setConfirming(null)}
              >
                Cancel
              </Button>

              <div className="ml-auto flex items-center gap-3">
                <Button
                  className="text-sm rounded-md px-3 py-2 bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() => {
                    // first "Yes, I have submitted" step opens final confirm overlay inline
                    // we'll reuse the same modal with simple confirm flow
                    if (!submitting) {
                      const proceed = window.confirm(
                        "Final confirmation: Do you want to mark this assignment as submitted?"
                      );
                      if (proceed) handleFinalConfirm(confirming.assignmentId);
                    }
                  }}
                >
                  Final Confirm
                </Button>

                <Button
                  className="text-sm rounded-md px-3 py-2 bg-gray-100"
                  onClick={() => !submitting && setConfirming(null)}
                >
                  Back
                </Button>
              </div>
            </div>

            {submitting && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                Processing...
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      {/*</AnimatePresence>*/}
    </div>
  );
};

export default StudentDashboard;
