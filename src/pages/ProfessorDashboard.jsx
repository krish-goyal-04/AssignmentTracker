import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input"; // optional — replace with <input> if not available
import { AppContext } from "../context/AppContext";
import { getAssignments, saveAssignments } from "../utils/storage";

import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
//once only one student is only given assignment by professor
//on adding assignment, its not gettting immediately updated
//Submitted assignments on marking pending arenot getting updated with refresh
/**
 * PROFESSOR DASHBOARD
 *
 * Features:
 * - Top-level stats (assignments given, avg completion)
 * - Assignment cards list + search/filter/sort
 * - Per-assignment expanded view showing rows for each student with status & small progress bar
 * - Create/Edit assignment modal (title, description, dueDate, driveLink, studentsAssigned)
 * - Mark student submission status inline, and persist
 * - Export submissions CSV
 *
 * NOTE: component tries to use context-provided `assignments` and mutator functions:
 *   - assignments (array)
 *   - setAssignments (optional) OR createAssignment/editAssignment/deleteAssignment/updateAssignment
 * If those aren't available in your AppContext, the component will fall back to reading/writing localStorage
 * using getAssignments/saveAssignments from ../utils/storage (this mimics your earlier code).
 */

const emptyAssignment = {
  assignmentId: "",
  title: "",
  description: "",
  professorId: "",
  professorName: "",
  dueDate: "",
  driveTemplateLink: "",
  studentsAssigned: [],
  submissions: [],
};

const ProfessorDashboard = () => {
  const context = useContext(AppContext);
  // support several shapes: prefer context values if provided
  const externalAssignments = getAssignments();
  const setExternalAssignments =
    context.setAssignments ?? context.saveAssignments ?? null;

  // helper functions for persistence (tries context first, else localStorage via utils)
  const persistAssignments = (newList) => {
    if (
      setExternalAssignments &&
      typeof setExternalAssignments === "function"
    ) {
      // if AppContext provides a setter-like function, call it
      setExternalAssignments(newList);
    } else {
      // fallback: save to utils/localStorage and update local state
      saveAssignments(newList);
      setAssignmentsState(newList);
    }
  };

  // local copy of assignments to allow editing if context doesn't provide mutator
  const [assignmentsState, setAssignmentsState] = useState(
    externalAssignments || []
  );
  const assignments = context.assignments ?? assignmentsState;

  // UI state
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all / dueSoon / pastDue / incomplete
  const [sortBy, setSortBy] = useState("dueAsc"); // dueAsc / dueDesc / completionDesc
  const [active, setActive] = useState(null); // assignmentId expanded
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // assignment object if editing
  const [form, setForm] = useState(emptyAssignment);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // sync when external assignments change (e.g. other pages update context)
  useEffect(() => {
    const list = context.assignments ?? getAssignments();
    setAssignmentsState(list || []);
  }, [context.assignments]);

  // derived: assignments for this professor only (professorId from context user or login)
  const params = useParams();
  const professorId = params.professorId?.toUpperCase();
  const professorName = context.user?.name ?? context.user?.email ?? "";

  const getMyAssignments = () => {
    return (assignments || []).filter((a) =>
      a.professorId ? a.professorId === professorId : true
    );
  };

  const myAssignments = getMyAssignments();

  // search + filter + sort pipeline
  const getVisibleAssignments = () => {
    let list = [...myAssignments];

    // search query
    if (q?.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description?.toLowerCase().includes(term) ||
          (a.professorName || "").toLowerCase().includes(term)
      );
    }

    // filter
    const today = new Date();
    if (filter === "dueSoon") {
      list = list.filter((a) => {
        const due = new Date(a.dueDate + "T23:59:59");
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
      });
    } else if (filter === "pastDue") {
      list = list.filter((a) => new Date(a.dueDate + "T23:59:59") < today);
    } else if (filter === "incomplete") {
      list = list.filter((a) => {
        const total = a.studentsAssigned?.length || 0;
        const completed =
          a.submissions?.filter((s) => s.status === "completed")?.length || 0;
        return completed < total;
      });
    }

    // sort
    if (sortBy === "dueAsc") {
      list.sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate));
    } else if (sortBy === "dueDesc") {
      list.sort((x, y) => new Date(y.dueDate) - new Date(x.dueDate));
    } else if (sortBy === "completionDesc") {
      list.sort((x, y) => {
        const cx =
          (x.submissions?.filter((s) => s.status === "completed")?.length ||
            0) / (x.studentsAssigned?.length || 1);
        const cy =
          (y.submissions?.filter((s) => s.status === "completed")?.length ||
            0) / (y.studentsAssigned?.length || 1);
        return cy - cx;
      });
    }

    return list;
  };

  const visibleAssignments = getVisibleAssignments();

  // global stats
  const getStats = () => {
    const assignmentsCount = myAssignments.length;
    const overall = myAssignments.reduce(
      (acc, a) => {
        const total = a.studentsAssigned?.length || 0;
        const completed =
          a.submissions?.filter((s) => s.status === "completed")?.length || 0;
        acc.totalStudents += total;
        acc.totalCompleted += completed;
        acc.totalAssignments += 1;
        return acc;
      },
      { totalStudents: 0, totalCompleted: 0, totalAssignments: 0 }
    );
    const completionRate = statsSafePerc(
      overall.totalCompleted,
      overall.totalStudents
    );
    return { assignmentsCount, completionRate, ...overall };
  };

  const stats = getStats();

  // helpers
  function statsSafePerc(done, total) {
    if (!total) return 0;
    return Math.round((done / total) * 100);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  // create/edit modal handlers
  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyAssignment,
      professorId,
      professorName,
      assignmentId: `A${Date.now()}`,
      studentsAssigned: [],
      submissions: [],
    });
    setModalOpen(true);
  };

  const openEdit = (assignment) => {
    setEditing(assignment.assignmentId);
    setForm({
      ...assignment,
      // ensure arrays exist
      studentsAssigned: assignment.studentsAssigned
        ? [...assignment.studentsAssigned]
        : [],
      submissions: assignment.submissions ? [...assignment.submissions] : [],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyAssignment);
    setEditing(null);
  };

  const persistAndToast = (newList, message = "Saved") => {
    persistAssignments(newList);
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const list = [...(assignments || [])];
      if (editing) {
        // update existing
        const idx = list.findIndex((x) => x.assignmentId === editing);
        if (idx >= 0) {
          list[idx] = { ...form };
        }
      } else {
        // push new assignment (ensure submissions for assigned students)
        const submissions = (form.studentsAssigned || []).map((sid) => ({
          studentId: sid,
          status: "pending",
          submittedOn: null,
        }));
        list.push({ ...form, submissions });
      }
      persistAndToast(
        list,
        editing ? "Assignment updated" : "Assignment created"
      );
      setSaving(false);
      closeModal();
    } catch (err) {
      console.error(err);
      setSaving(false);
      setToast("Unable to save");
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleDeleteAssignment = (assignmentId) => {
    if (!confirm("Delete assignment? This cannot be undone.")) return;
    const list = (assignments || []).filter(
      (a) => a.assignmentId !== assignmentId
    );
    persistAndToast(list, "Assignment deleted");
  };

  // mark submission status for a student (toggle)
  const toggleStudentStatus = (assignmentId, studentId) => {
    const list = (assignments || []).map((a) => {
      if (a.assignmentId !== assignmentId) return a;
      const submissions = a.submissions ? [...a.submissions] : [];
      const idx = submissions.findIndex((s) => s.studentId === studentId);
      if (idx === -1) {
        // add as completed
        submissions.push({
          studentId,
          status: "completed",
          submittedOn: new Date().toISOString().slice(0, 10),
        });
      } else {
        // toggle
        const curr = submissions[idx];
        if (curr.status === "completed") {
          submissions[idx] = { ...curr, status: "pending", submittedOn: null };
        } else {
          submissions[idx] = {
            ...curr,
            status: "completed",
            submittedOn: new Date().toISOString().slice(0, 10),
          };
        }
      }
      return { ...a, submissions };
    });
    persistAndToast(list, "Updated submission status");
  };

  // CSV export
  const exportCSV = (assignment) => {
    const headers = [
      "assignmentId",
      "assignmentTitle",
      "studentId",
      "studentStatus",
      "submittedOn",
    ];
    const rows = (assignment.studentsAssigned || []).map((sid) => {
      const s = (assignment.submissions || []).find(
        (x) => x.studentId === sid
      ) || { status: "pending", submittedOn: "" };
      return [
        assignment.assignmentId,
        assignment.title,
        sid,
        s.status,
        s.submittedOn || "",
      ];
    });

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "")}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assignment.assignmentId}-${assignment.title.replace(
      /\s+/g,
      "_"
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // small helpers for form student list management
  const addStudentToForm = (sid) => {
    if (!sid) return;
    if ((form.studentsAssigned || []).includes(sid)) return;
    setForm((f) => ({
      ...f,
      studentsAssigned: [...(f.studentsAssigned || []), sid],
      submissions: [
        ...(f.submissions || []),
        { studentId: sid, status: "pending", submittedOn: null },
      ],
    }));
  };

  const removeStudentFromForm = (sid) => {
    setForm((f) => ({
      ...f,
      studentsAssigned: (f.studentsAssigned || []).filter((x) => x !== sid),
      submissions: (f.submissions || []).filter((s) => s.studentId !== sid),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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

            <Button className="flex items-center gap-2" onClick={openCreate}>
              <PlusIcon className="w-4 h-4" /> New
            </Button>
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Assignments given</div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">
            {stats.assignmentsCount}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-slate-500">
            Students assigned (total)
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">
            {stats.totalStudents}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-slate-500">Overall completion rate</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-green-600 transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="text-sm font-semibold">{stats.completionRate}%</div>
          </div>
        </Card>
      </div>

      {/* Assignments list */}
      <div className="grid gap-6">
        {visibleAssignments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-semibold text-slate-700 mb-1">
              No assignments found
            </p>
            <p className="text-sm text-slate-500">
              Use the <strong>New</strong> button to create an assignment.
            </p>
          </Card>
        ) : (
          visibleAssignments.map((a) => {
            const total = a.studentsAssigned?.length || 0;
            const completed =
              a.submissions?.filter((s) => s.status === "completed")?.length ||
              0;
            const percentage = total
              ? Math.round((completed / total) * 100)
              : 0;
            const isPastDue = new Date(a.dueDate + "T23:59:59") < new Date();

            return (
              <motion.div
                key={a.assignmentId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden border"
              >
                <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-800 truncate">
                        {a.title}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Due:{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(a.dueDate)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                      {a.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <div>
                        Students:{" "}
                        <span className="font-medium text-slate-700">
                          {total}
                        </span>
                      </div>
                      <div>
                        Completed:{" "}
                        <span className="font-medium text-slate-700">
                          {completed}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded-md ${
                          isPastDue
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isPastDue ? "Past due" : "Active"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:block w-40">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {percentage}% completed
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        className="text-sm px-3 py-2 bg-white border"
                        onClick={() => {
                          setActive(
                            active === a.assignmentId ? null : a.assignmentId
                          );
                        }}
                      >
                        {active === a.assignmentId ? "Collapse" : "Details"}
                      </Button>

                      {/*<Button
                        className="text-sm px-3 py-2 bg-white border"
                        onClick={() => exportCSV(a)}
                      >
                        <DownloadIcon className="w-4 h-4 inline-block mr-1" />{" "}
                        CSV
                      </Button>*/}

                      <Button
                        className="text-sm px-3 py-2 bg-white border"
                        onClick={() => openEdit(a)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>

                      <Button
                        className="text-sm px-3 py-2 bg-red-50 text-red-700 border"
                        onClick={() => handleDeleteAssignment(a.assignmentId)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* expanded details: per-student table */}
                <AnimatePresence>
                  {active === a.assignmentId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 border-t bg-slate-50"
                    >
                      <div className="overflow-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-slate-500">
                              <th className="pb-2">Student ID</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2">Submitted On</th>
                              <th className="pb-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(a.studentsAssigned || []).map((sid) => {
                              const sObj = (a.submissions || []).find(
                                (s) => s.studentId === sid
                              ) || { status: "pending", submittedOn: null };
                              const isDone = sObj.status === "completed";
                              return (
                                <tr key={sid} className="border-t">
                                  <td className="py-3">{sid}</td>
                                  <td className="py-3">
                                    <div
                                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                        isDone
                                          ? "bg-green-100 text-green-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {isDone ? "Submitted" : "Pending"}
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    {sObj.submittedOn
                                      ? formatDate(sObj.submittedOn)
                                      : "-"}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        className={`text-sm px-3 py-1 rounded-md ${
                                          isDone
                                            ? "bg-gray-100"
                                            : "bg-green-600 text-white"
                                        }`}
                                        onClick={() =>
                                          toggleStudentStatus(
                                            a.assignmentId,
                                            sid
                                          )
                                        }
                                      >
                                        {isDone
                                          ? "Mark Pending"
                                          : "Mark Submitted"}
                                      </button>

                                      <a
                                        href={`${a.driveTemplateLink}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm px-3 py-1 rounded-md bg-white border"
                                      >
                                        Open Drive
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal: Create/Edit assignment */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => !saving && closeModal()}
            />
            <motion.div
              initial={{ y: 12, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              className="relative max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <form onSubmit={handleSaveAssignment}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {editing ? "Edit Assignment" : "New Assignment"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {editing
                          ? "Update assignment details"
                          : "Create an assignment and assign students"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => closeModal()}
                      className="text-slate-500"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600">
                        Title
                      </label>
                      <input
                        required
                        value={form.title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, title: e.target.value }))
                        }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600">
                        Due date
                      </label>
                      <input
                        required
                        type="date"
                        value={form.dueDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, dueDate: e.target.value }))
                        }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-600">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-600">
                        Drive template link
                      </label>
                      <input
                        value={form.driveTemplateLink}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            driveTemplateLink: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-600">
                        Students assigned (comma separated IDs)
                      </label>
                      <input
                        value={(form.studentsAssigned || []).join(",")}
                        onChange={(e) => {
                          const arr = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setForm((f) => ({
                            ...f,
                            studentsAssigned: arr,
                            submissions: arr.map((sid) => ({
                              studentId: sid,
                              status:
                                f.submissions?.find((x) => x.studentId === sid)
                                  ?.status || "pending",
                              submittedOn:
                                f.submissions?.find((x) => x.studentId === sid)
                                  ?.submittedOn || null,
                            })),
                          }));
                        }}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t">
                  <Button
                    type="button"
                    className="bg-white border"
                    onClick={() => closeModal()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white">
                    {saving ? "Saving..." : editing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className="rounded-md bg-slate-800 text-white px-4 py-2 shadow">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;
