import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * StudentCourseTabs Component
 *
 * Displays clickable course tabs for filtering assignments.
 * No "All" button - shows all courses as individual tabs.
 * Active tab has gradient background and bold text.
 */
export const StudentCourseTabs = ({
  courses,
  selectedCourse,
  onSelectCourse,
}) => {
  // Don't render if no courses available
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {courses.map((course, index) => {
        const isActive = selectedCourse === course;

        return (
          <Motion.button
            key={course}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => onSelectCourse(course)}
            className={`
              relative px-6 py-3 rounded-lg font-medium text-sm
              transition-all duration-200 whitespace-nowrap
              ${
                isActive
                  ? "bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md"
              }
            `}
          >
            {/* Active indicator dot */}
            {isActive && (
              <Motion.span
                layoutId="activeTab"
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
            {course}
          </Motion.button>
        );
      })}
    </div>
  );
};
