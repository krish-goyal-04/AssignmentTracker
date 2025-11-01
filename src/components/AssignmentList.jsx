import React from "react";
import { EmptyState } from "./empty-state";
import AssignmentCard from "./AssignmentCard";

export function AssignmentList({
  assignments,
  activeId,
  onToggleDetails,
  onEdit,
  onDelete,
  onToggleStatus,
  formatDate,
}) {
  if (assignments.length === 0) {
    return (
      <EmptyState
        message="No assignments found"
        description="Use the New button to create an assignment."
      />
    );
  }

  return (
    <div className="grid gap-6">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.assignmentId}
          assignment={assignment}
          active={activeId === assignment.assignmentId}
          onToggleDetails={() => onToggleDetails(assignment.assignmentId)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}
