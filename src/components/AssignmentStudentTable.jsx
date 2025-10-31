import React from "react";

const AssignmentStudentTable = ({
  students = [],
  submissions = [],
  driveLink,
  onToggleStatus,
  formatDate,
}) => {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500">
            <th className="pb-2">Student ID</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Submitted On</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((sid) => {
            const sObj = submissions.find((s) => s.studentId === sid) || {
              status: "pending",
              submittedOn: null,
            };
            const isDone = sObj.status === "completed";

            return (
              <tr key={sid} className="border-t">
                <td className="py-3">{sid}</td>
                <td className="py-3">
                  <div
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      isDone
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isDone ? "Submitted" : "Pending"}
                  </div>
                </td>
                <td className="py-3">
                  {sObj.submittedOn ? formatDate(sObj.submittedOn) : "-"}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className={`text-sm px-3 py-1 rounded-md ${
                        isDone ? "bg-gray-100" : "bg-green-600 text-white"
                      }`}
                      onClick={() => onToggleStatus(sid)}
                    >
                      {isDone ? "Mark Pending" : "Mark Submitted"}
                    </button>

                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm px-3 py-1 rounded-md bg-white border"
                    >
                      Open Drive
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentStudentTable;
