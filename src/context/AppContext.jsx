import { createContext, useEffect, useState } from "react";
import { getAssignments, saveAssignments } from "../utils/storage";

export const AppContext = createContext();

//user will hold all the user related data which will be stored in localstorage
//role will store student or ptofessor and load dashboard accordingly
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("loggedInUser")) || null
  );
  const assignmentsData = getAssignments();
  const [assignments, setAssignments] = useState(assignmentsData);

  const [role, setRole] = useState(user?.role || null);

  //updating assignments in local storage if any changes are made
  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

  const loginUser = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("loggedInUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("loggedInUser");
  };

  //mark assignment submitted for a student based on studentid and assignmentid
  const updateAssignment = (studentId, assignmentId) => {
    const updated = assignments.map((a) =>
      a.assignmentId === assignmentId
        ? {
            ...a,
            submissions: a.submissions.map((s) =>
              s.studentId === studentId
                ? {
                    ...s,
                    status: "completed",
                    submittedOn: new Date().toISOString(),
                  }
                : s
            ),
          }
        : a
    );
    setAssignments(updated);
  };

  return (
    <AppContext.Provider
      value={{ user, role, assignments, loginUser, logout, updateAssignment }}
    >
      {children}
    </AppContext.Provider>
  );
};
