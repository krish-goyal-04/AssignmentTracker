import React from "react";
import { Card } from "./ui/card";

const AssignmentStats = ({
  assignmentsCount,
  totalStudents,
  completionRate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="text-sm text-slate-500">Assignments given</div>
        <div className="mt-2 text-2xl font-semibold text-slate-800">
          {assignmentsCount}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-slate-500">Students assigned (total)</div>
        <div className="mt-2 text-2xl font-semibold text-slate-800">
          {totalStudents}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-slate-500">Overall completion rate</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-green-600 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-sm font-semibold">{completionRate}%</div>
        </div>
      </Card>
    </div>
  );
};

export default AssignmentStats;
