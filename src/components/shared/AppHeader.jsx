import React from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "../ui/button";

const AppHeader = ({ title, subtitle, userName, userId, onLogout, icon }) => {
  return (
    <Motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
              {title}
            </h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700">
              {userName}
            </span>
            <span className="text-xs text-slate-500">{userId}</span>
          </div>
          <Button
            variant="destructive"
            onClick={onLogout}
            className="hidden sm:inline-flex"
          >
            Logout
          </Button>
        </div>
      </div>
    </Motion.nav>
  );
};

export default AppHeader;
