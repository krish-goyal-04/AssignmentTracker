import React from "react";
import { useParams } from "react-router-dom";

const StudentDashboard = () => {
  const { studentId } = useParams();
  console.log(studentId);
  return <div>StudentDashboard</div>;
};

export default StudentDashboard;
