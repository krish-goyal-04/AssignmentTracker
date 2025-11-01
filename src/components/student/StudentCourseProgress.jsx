import React from "react";
import { motion as Motion } from "framer-motion";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

/**
 * Overall progress indicator for student assignments
 * Shows completion percentage and count with animated progress bar
 */
export const StudentCourseProgress = ({ totalAssignments, submittedCount }) => {
  // Calculate completion percentage (0-100)
  const completionPercentage = totalAssignments
    ? Math.round((submittedCount / totalAssignments) * 100)
    : 0;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <Card className="mb-6 shadow-sm">
        <div className="p-6">
          {/* Section title */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">
              📊 Overall Progress
            </h3>
            <span className="text-lg font-bold text-slate-800">
              {completionPercentage}%
            </span>
          </div>

          {/* Animated progress bar */}
          <Motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ transformOrigin: "left" }}
          >
            <Progress value={completionPercentage} className="h-3" />
          </Motion.div>

          {/* Completion summary text */}
          <div className="mt-3 text-xs text-slate-500">
            <span className="font-medium text-emerald-600">
              {submittedCount} completed
            </span>
            {" · "}
            <span className="font-medium text-amber-600">
              {totalAssignments - submittedCount} pending
            </span>
            {" · "}
            <span>{totalAssignments} total</span>
          </div>
        </div>
      </Card>
    </Motion.div>
  );
};
