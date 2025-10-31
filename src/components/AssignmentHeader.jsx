import React from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";

const AssignmentHeader = ({
  q,
  setQ,
  filter,
  setFilter,
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
          Manage assignments, review submissions and export reports.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-white border rounded-md px-3 py-2">
          <input
            placeholder="Search assignments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="text-sm outline-none w-64"
          />
          <button
            className="text-slate-500"
            onClick={() => setQ("")}
            aria-label="clear search"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="text-sm rounded-md border px-2 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="dueSoon">Due soon</option>
            <option value="pastDue">Past due</option>
            <option value="incomplete">Incomplete</option>
          </select>

          <select
            className="text-sm rounded-md border px-2 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueAsc">Due date ↑</option>
            <option value="dueDesc">Due date ↓</option>
            <option value="completionDesc">Completion % ↓</option>
          </select>

          <Button className="flex items-center gap-2" onClick={onCreateNew}>
            <PlusIcon className="w-4 h-4" /> New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentHeader;
