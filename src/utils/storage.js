import students from "../data/students.json";
import professors from "../data/professors.json";
import assignments from "../data/assignments.json";

export const initializeData = () => {
  // Initialization  for local storage
  if (!localStorage.getItem("assignments")) {
    localStorage.setItem("assignements", JSON.stringify(assignments));
  }

  if (!localStorage.getItem("students")) {
    localStorage.setItem("students", JSON.stringify(students));
  }

  if (!localStorage.getItem("professors")) {
    localStorage.setItem("professors", JSON.stringify(professors));
  }
};

export const getStudents = () => {
  JSON.parse(localStorage.getItem("students")) || [];
};

export const getProfessors = () => {
  JSON.parse(localStorage.getItem(professors)) || [];
};
export const getAssignments = () => {
  JSON.parse(localStorage.getItem("assignments")) || [];
};
