export const createEmptyAssignment = () => ({
  assignmentId: "",
  title: "",
  description: "",
  professorId: "",
  professorName: "",
  dueDate: "",
  driveTemplateLink: "",
  studentsAssigned: [],
  submissions: [],
});

export const calculateAssignmentStats = (assignments) => {
  return assignments.reduce(
    (acc, assignment) => {
      const totalStudents = assignment.studentsAssigned?.length || 0;
      const completedSubmissions =
        assignment.submissions?.filter(
          (submission) => submission.status === "completed"
        ).length || 0;

      return {
        totalStudents: acc.totalStudents + totalStudents,
        totalCompleted: acc.totalCompleted + completedSubmissions,
        assignmentsCount: acc.assignmentsCount + 1,
      };
    },
    { totalStudents: 0, totalCompleted: 0, assignmentsCount: 0 }
  );
};

export const formatDateToLocale = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

export const calculateCompletionPercentage = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

export const filterAssignmentsByProfessor = (assignments, professorId) => {
  return assignments.filter(
    (assignment) =>
      !assignment.professorId || assignment.professorId === professorId
  );
};

export const filterAndSortAssignments = (
  assignments,
  searchQuery,
  filterType,
  sortOrder
) => {
  const today = new Date();
  let filteredAssignments = [...assignments];

  // Apply search filter
  if (searchQuery?.trim()) {
    const searchTerm = searchQuery.toLowerCase();
    filteredAssignments = filteredAssignments.filter(
      (assignment) =>
        assignment.title.toLowerCase().includes(searchTerm) ||
        assignment.description?.toLowerCase().includes(searchTerm) ||
        (assignment.professorName || "").toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  switch (filterType) {
    case "dueSoon":
      filteredAssignments = filteredAssignments.filter((assignment) => {
        const daysUntilDue =
          (new Date(assignment.dueDate + "T23:59:59") - today) / 86400000;
        return daysUntilDue >= 0 && daysUntilDue <= 7;
      });
      break;
    case "pastDue":
      filteredAssignments = filteredAssignments.filter(
        (assignment) => new Date(assignment.dueDate + "T23:59:59") < today
      );
      break;
    case "incomplete":
      filteredAssignments = filteredAssignments.filter((assignment) => {
        const totalStudents = assignment.studentsAssigned?.length || 0;
        const completedSubmissions =
          assignment.submissions?.filter(
            (submission) => submission.status === "completed"
          ).length || 0;
        return completedSubmissions < totalStudents;
      });
      break;
  }

  // Apply sorting
  switch (sortOrder) {
    case "dueAsc":
      filteredAssignments.sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      );
      break;
    case "dueDesc":
      filteredAssignments.sort(
        (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
      );
      break;
    case "completionDesc":
      filteredAssignments.sort((a, b) => {
        const getCompletionRate = (assignment) => {
          const completed =
            assignment.submissions?.filter((s) => s.status === "completed")
              .length || 0;
          const total = assignment.studentsAssigned?.length || 1;
          return completed / total;
        };
        return getCompletionRate(b) - getCompletionRate(a);
      });
      break;
  }

  return filteredAssignments;
};
