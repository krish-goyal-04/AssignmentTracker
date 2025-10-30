import React from "react";
import { useParams } from "react-router-dom";

const ProfessorDashboard = () => {
  const { professorId } = useParams();
  console.log(professorId);
  return <div>ProfessorDashboard</div>;
};

export default ProfessorDashboard;
