import React, { useEffect } from "react";
import { initializeData } from "../src/utils/storage";

const App = () => {
  useEffect(() => {
    initializeData();
  }, []);
  return <div className="text-4xl">App</div>;
};

export default App;
