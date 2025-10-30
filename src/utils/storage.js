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

//These three functions are used to retreive data from local storage
export const getStudents = () => {
  JSON.parse(localStorage.getItem("students")) || [];
};

export const getProfessors = () => {
  JSON.parse(localStorage.getItem(professors)) || [];
};
export const getAssignments = () => {
  JSON.parse(localStorage.getItem("assignments")) || [];
};

export const saveAssignments = (data) => {
  localStorage.setItem("assignments", JSON.stringify(data));
};
