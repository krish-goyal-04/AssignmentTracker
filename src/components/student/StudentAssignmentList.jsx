import React from "react";
import { Card } from "../ui/card";
import { EmptyState } from "../shared/EmptyState";

export const StudentAssignmentList = ({
  assignments,
  renderAssignmentCard,
}) => {
  if (!assignments.length) {
    return <EmptyState message="No assignments available" />;
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => renderAssignmentCard(assignment))}
    </div>
  );
};
