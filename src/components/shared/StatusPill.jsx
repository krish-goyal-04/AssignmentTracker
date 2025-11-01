import React from "react";
import { cn } from "../../lib/utils";

/**
 * StatusPill Component
 *
 * Reusable status indicator used across student and professor views
 * Shows a colored pill with text based on status type
 */
export const StatusPill = ({
  status,
  text,
  className,
  daysRemaining,
  submittedDate,
  customColor,
}) => {
  // Define status colors
  const colors = {
    completed: "bg-green-100 text-green-700",
    submitted: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-800",
    "past-due": "bg-rose-100 text-rose-700",
    "no-students": "bg-slate-200 text-slate-500",
  };

  // Get color based on status or custom override
  const colorClass = customColor || colors[status] || colors.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap",
        colorClass,
        className
      )}
    >
      {text ||
        (status === "submitted" &&
          `✓ Submitted${
            submittedDate
              ? ` on ${new Date(submittedDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}`
              : ""
          }`) ||
        (status === "completed" && "✓ Completed") ||
        (status === "active" && "Active") ||
        (status === "past-due" && "⚠️ Past due") ||
        (status === "no-students" && "No students") ||
        (status === "pending" &&
          `⏰ Due in ${Math.max(daysRemaining || 0, 0)} day${
            Math.max(daysRemaining || 0, 0) !== 1 ? "s" : ""
          }`)}
    </span>
  );
};
