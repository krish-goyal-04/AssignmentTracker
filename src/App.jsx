import React, { useEffect } from "react";
import { initializeData } from "../src/utils/storage";
import Login from "./pages/Login";

const App = () => {
  //One time inital feeding data into local storage
  useEffect(() => {
    initializeData();
  }, []);
  return (
    <div className="text-4xl">
      <Login />
    </div>
  );
};

export default App;
