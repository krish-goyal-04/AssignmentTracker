import React from "react";
import Login from "./pages/Login";
import { AppProvider } from "./context/AppContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";

const App = ({ children }) => {
  return (
    <AppProvider value={children}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student/:studentId" element={<StudentDashboard />} />
          <Route
            path="/professor/:professorId"
            element={<ProfessorDashboard />}
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
