import React from "react";
import { motion as Motion } from "framer-motion";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

/**
 * AssignmentStats Component
 *
 * Displays a row of stat cards showing key metrics.
 * Used by both Student and Professor dashboards.
 *
 * Shows:
 * - Individual stat cards (count values with labels)
 * - Overall progress card with animated progress bar
 *
 * Props:
 * - statsItems: Array of {title, value, color} objects for stat cards
 * - progress: Number (0-100) for progress bar percentage
 */
export const AssignmentStats = ({ statsItems, progress }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Render stat cards with staggered animations */}
      {statsItems &&
        statsItems.map((statItem, index) => (
          <Motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              {/* Stat label with custom color */}
              <div className={`text-sm font-medium ${statItem.color}`}>
                {statItem.title}
              </div>
              {/* Stat value (large and bold) */}
              <div className="mt-2 text-3xl font-bold text-slate-800">
                {statItem.value}
              </div>
            </Card>
          </Motion.div>
        ))}

      {/* Overall progress card */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: (statsItems?.length || 0) * 0.05 }}
      >
        <Card className="p-4 bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow">
          <div className="text-sm font-medium text-blue-700">
            Overall Progress
          </div>
          {/* Progress bar with percentage label */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <div className="text-sm font-bold text-blue-800">{progress}%</div>
          </div>
        </Card>
      </Motion.div>
    </div>
  );
};
