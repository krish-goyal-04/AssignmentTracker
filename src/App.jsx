import React, { createContext, useContext, useEffect } from "react";
import { initializeData } from "../src/utils/storage";
import Login from "./pages/Login";
import { AppProvider } from "./context/AppContext";
const App = ({ children }) => {
  //One time inital feeding data into local storage
  useEffect(() => {
    initializeData();
  }, []);
  return (
    <AppProvider value={children}>
      <div className="text-4xl">
        <Login />
      </div>
    </AppProvider>
  );
};

export default App;
