import React from "react";
import { motion as Motion } from "framer-motion";
import { Card } from "../ui/card";

/**
 * Student profile header showing avatar, name, email and assignment stats
 * Displays total, completed, and pending counts in a clean layout
 */
export const StudentProfileHeader = ({ student, totals }) => {
  // Generate initials from student name (e.g., "John Doe" → "JD")
  let userInitials = "ST"; // Default initials
  if (student?.name) {
    const nameParts = student.name.split(" ");
    const firstInitial = nameParts[0]?.[0] || "";
    const lastInitial = nameParts[1]?.[0] || "";
    userInitials = (firstInitial + lastInitial).toUpperCase();
  }

  // Display name: prefer full name, fallback to email, then generic "Student"
  const displayName = student?.name || student?.email || "Student";

  return (
    <Motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mb-6 shadow-md hover:shadow-lg transition-shadow">
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar circle with initials */}
          <Motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="size-16 rounded-full bg-linear-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md"
          >
            {userInitials}
          </Motion.div>

          {/* Name and email section */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-slate-800 truncate"
            >
              {displayName}
            </Motion.div>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-slate-500 truncate mt-1"
            >
              {student?.email}
            </Motion.div>
          </div>

          {/* Stats grid: Total, Completed, Pending */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {/* Total assignments */}
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {totals.total}
              </div>
            </Motion.div>

            {/* Completed assignments */}
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Done
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {totals.completed}
              </div>
            </Motion.div>

            {/* Pending assignments */}
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Pending
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {totals.pending}
              </div>
            </Motion.div>
          </div>
        </div>
      </Card>
    </Motion.div>
  );
};
