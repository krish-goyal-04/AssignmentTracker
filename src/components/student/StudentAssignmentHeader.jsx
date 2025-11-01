import React from "react";
import { Card } from "../ui/card";

export const StudentAssignmentHeader = ({
  selectedCourse,
  assignments = [],
}) => {
  return (
    <div className="mb-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-1">
            {selectedCourse ? selectedCourse : "All Courses"}
          </h2>
          <p className="text-sm text-slate-500">
            {assignments.length} Active Assignment
            {assignments.length !== 1 && "s"}
          </p>
        </div>
      </Card>
    </div>
  );
};
