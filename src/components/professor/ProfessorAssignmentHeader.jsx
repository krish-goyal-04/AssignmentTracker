import React from "react";
import { Button } from "../ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";

const ProfessorAssignmentHeader = ({
  query,
  setQuery,
  sortBy,
  setSortBy,
  onCreateNew,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Professor Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage assignments and review submissions.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-white border rounded-md px-3 py-2">
          <input
            placeholder="Search assignments..."
            value={query}
            onChange={(e) => setQuery && setQuery(e.target.value)}
            className="text-sm outline-none w-64"
          />
          <button
            className="text-slate-500"
            onClick={() => setQuery && setQuery("")}
            aria-label="clear search"
          >
            ✕
          </button>
        </div>

        {/* Sorting options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy && setSortBy(e.target.value)}
          className="text-sm border rounded-md px-2 py-1 bg-white"
        >
          <option value="dueAsc">Due Date (Earliest)</option>
          <option value="dueDesc">Due Date (Latest)</option>
        </select>

        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New
        </Button>
      </div>
    </div>
  );
};

export default ProfessorAssignmentHeader;
