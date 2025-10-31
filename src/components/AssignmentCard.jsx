import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import AssignmentStudentTable from "./AssignmentStudentTable";

const AssignmentCard = ({
  assignment,
  active,
  onToggleDetails,
  onEdit,
  onDelete,
  onToggleStatus,
  formatDate,
}) => {
  const total = assignment.studentsAssigned?.length || 0;
  const completed =
    assignment.submissions?.filter((s) => s.status === "completed")?.length ||
    0;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  const isPastDue = new Date(assignment.dueDate + "T23:59:59") < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border"
    >
      <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {assignment.title}
            </h3>
            <div className="text-xs text-slate-500">
              Due:{" "}
              <span className="font-medium text-slate-700">
                {formatDate(assignment.dueDate)}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500 line-clamp-2">
            {assignment.description}
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <div>
              Students:{" "}
              <span className="font-medium text-slate-700">{total}</span>
            </div>
            <div>
              Completed:{" "}
              <span className="font-medium text-slate-700">{completed}</span>
            </div>
            <div
              className={`px-2 py-0.5 rounded-md ${
                isPastDue
                  ? "bg-red-100 text-red-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isPastDue ? "Past due" : "Active"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block w-40">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-600"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {percentage}% completed
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="text-sm px-3 py-2 bg-white border"
              onClick={() => onToggleDetails(assignment.assignmentId)}
            >
              {active ? "Collapse" : "Details"}
            </Button>

            <Button
              className="text-sm px-3 py-2 bg-white border"
              onClick={() => onEdit(assignment)}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>

            <Button
              className="text-sm px-3 py-2 bg-red-50 text-red-700 border"
              onClick={() => onDelete(assignment.assignmentId)}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t bg-slate-50"
          >
            <AssignmentStudentTable
              students={assignment.studentsAssigned}
              submissions={assignment.submissions}
              driveLink={assignment.driveTemplateLink}
              onToggleStatus={(studentId) =>
                onToggleStatus(assignment.assignmentId, studentId)
              }
              formatDate={formatDate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssignmentCard;
