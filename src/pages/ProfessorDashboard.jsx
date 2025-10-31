/*import React, { useContext, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AppContext } from "../context/AppContext";
import { getAssignments, saveAssignments } from "../utils/storage";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
import AssignmentHeader from "../components/AssignmentHeader";
import AssignmentStats from "../components/AssignmentStats";
import AssignmentModal from "../components/AssignmentModal";
import AssignmentStudentTable from "../components/AssignmentStudentTable";
import AssignmentCard from "../components/AssignmentCard";

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
  // If the context provides a setter-like function, prefer context.assignments so
  // updates go through the context. Otherwise fall back to the local state so
  // newly created assignments (saved to localStorage) appear immediately.
  const assignments =
    setExternalAssignments && typeof setExternalAssignments === "function"
      ? context.assignments ?? assignmentsState
      : assignmentsState;

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
    const newAssignments = (assignments || []).map((a) => {
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

    // Update both context and local storage
    setAssignmentsState(newAssignments);
    if (
      setExternalAssignments &&
      typeof setExternalAssignments === "function"
    ) {
      setExternalAssignments(newAssignments);
    } else {
      saveAssignments(newAssignments);
    }
    setToast("Updated submission status");
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header }
      <AssignmentHeader
        q={q}
        setQ={setQ}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        openCreate={openCreate}
      />

      {/* Top stats }
      <AssignmentStats
        assignmentsCount={stats.assignmentsCount}
        totalStudents={stats.totalStudents}
        completionRate={stats.completionRate}
      />

      {/* Assignments list }
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
            const isActive = active === a.assignmentId;

            return (
              <AssignmentCard
                key={a.assignmentId}
                assignment={a}
                active={isActive}
                onToggleDetails={(id) =>
                  setActive((prev) => (prev === id ? null : id))
                }
                onEdit={openEdit}
                onDelete={handleDeleteAssignment}
                onToggleStatus={toggleStudentStatus}
                formatDate={formatDate}
              />
            );
          })
        )}
      </div>

      {/* Modal: Create/Edit assignment }
      <AnimatePresence>
        {modalOpen && (
          <AssignmentModal
            onClose={closeModal}
            onSave={handleSaveAssignment}
            setForm={setForm}
            form={form}
            editing={editing}
            saving={saving}
            isOpen={modalOpen}
          />
        )}
      </AnimatePresence>

      {/* toast }
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
*/

//Instead of professor name professor email is saved as email

import React, { useContext, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/card";
import { AppContext } from "../context/AppContext";
import { getAssignments, saveAssignments } from "../utils/storage";
import { useParams } from "react-router-dom";

import AssignmentHeader from "../components/AssignmentHeader";
import AssignmentStats from "../components/AssignmentStats";
import AssignmentModal from "../components/AssignmentModal";
import AssignmentCard from "../components/AssignmentCard";

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

const safePercent = (done, total) =>
  !total ? 0 : Math.round((done / total) * 100);

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function ProfessorDashboard() {
  const {
    assignments: ctxAssign,
    setAssignments,
    user,
  } = useContext(AppContext);

  const local = getAssignments() || [];
  const [assignments, setLocalAssignments] = useState(ctxAssign ?? local);

  const params = useParams();
  const professorId = params.professorId?.toUpperCase();
  const professorName = user?.name ?? user?.email ?? "";

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueAsc");
  const [active, setActive] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyAssignment);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ctxAssign) setLocalAssignments(ctxAssign);
  }, [ctxAssign]);

  const persist = (list) => {
    if (setAssignments) setAssignments(list);
    else saveAssignments(list);
    setLocalAssignments(list);
  };

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const myAssignments = assignments.filter(
    (a) => !a.professorId || a.professorId === professorId
  );

  const visibleAssignments = (() => {
    let list = [...myAssignments];
    const today = new Date();

    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description?.toLowerCase().includes(term) ||
          (a.professorName || "").toLowerCase().includes(term)
      );
    }

    if (filter === "dueSoon") {
      list = list.filter((a) => {
        const diff = (new Date(a.dueDate + "T23:59:59") - today) / 86400000;
        return diff >= 0 && diff <= 7;
      });
    } else if (filter === "pastDue") {
      list = list.filter((a) => new Date(a.dueDate) < today);
    } else if (filter === "incomplete") {
      list = list.filter((a) => {
        const total = a.studentsAssigned?.length || 0;
        const done =
          a.submissions?.filter((s) => s.status === "completed").length || 0;
        return done < total;
      });
    }

    if (sortBy === "dueAsc")
      list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    else if (sortBy === "dueDesc")
      list.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    else if (sortBy === "completionDesc")
      list.sort((a, b) => {
        const ra =
          (a.submissions?.filter((s) => s.status === "completed").length || 0) /
          (a.studentsAssigned?.length || 1);
        const rb =
          (b.submissions?.filter((s) => s.status === "completed").length || 0) /
          (b.studentsAssigned?.length || 1);
        return rb - ra;
      });

    return list;
  })();

  const stats = myAssignments.reduce(
    (acc, a) => {
      const total = a.studentsAssigned?.length || 0;
      const done =
        a.submissions?.filter((s) => s.status === "completed").length || 0;
      return {
        totalStudents: acc.totalStudents + total,
        totalCompleted: acc.totalCompleted + done,
        assignmentsCount: acc.assignmentsCount + 1,
      };
    },
    { totalStudents: 0, totalCompleted: 0, assignmentsCount: 0 }
  );

  const openCreate = () => {
    setForm({
      ...emptyAssignment,
      assignmentId: "A" + Date.now(),
      professorId,
      professorName,
    });
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setForm({ ...a });
    setEditing(a.assignmentId);
    setModalOpen(true);
  };

  const saveAssignment = (e) => {
    e.preventDefault();
    setSaving(true);

    let list = [...assignments];

    if (editing) {
      list = list.map((a) => (a.assignmentId === editing ? form : a));
    } else {
      const submissions = (form.studentsAssigned || []).map((sid) => ({
        studentId: sid,
        status: "pending",
        submittedOn: null,
      }));
      list.push({ ...form, submissions });
    }

    persist(list);
    notify(editing ? "Assignment updated" : "Assignment created");
    setSaving(false);
    setModalOpen(false);
  };

  const deleteAssignment = (id) => {
    if (!confirm("Delete assignment?")) return;
    const list = assignments.filter((a) => a.assignmentId !== id);
    persist(list);
    notify("Assignment deleted");
  };

  const toggleStudentStatus = (aId, sId) => {
    const next = assignments.map((a) => {
      if (a.assignmentId !== aId) return a;
      const subs = [...a.submissions];
      const i = subs.findIndex((s) => s.studentId === sId);

      if (i === -1) {
        subs.push({
          studentId: sId,
          status: "completed",
          submittedOn: new Date().toISOString().slice(0, 10),
        });
      } else {
        const s = subs[i];
        subs[i] = {
          ...s,
          status: s.status === "completed" ? "pending" : "completed",
          submittedOn:
            s.status === "completed"
              ? null
              : new Date().toISOString().slice(0, 10),
        };
      }

      return { ...a, submissions: subs };
    });

    persist(next);
    notify("Updated submission status");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AssignmentHeader
        q={q}
        setQ={setQ}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        openCreate={openCreate}
      />

      <AssignmentStats
        assignmentsCount={stats.assignmentsCount}
        totalStudents={stats.totalStudents}
        completionRate={safePercent(stats.totalCompleted, stats.totalStudents)}
      />

      <div className="grid gap-6">
        {visibleAssignments.length === 0 ? (
          <Card className="p-8 text-center">No assignments found</Card>
        ) : (
          visibleAssignments.map((a) => (
            <AssignmentCard
              key={a.assignmentId}
              assignment={a}
              active={active === a.assignmentId}
              onToggleDetails={() =>
                setActive(active === a.assignmentId ? null : a.assignmentId)
              }
              onEdit={openEdit}
              onDelete={deleteAssignment}
              onToggleStatus={toggleStudentStatus}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <AssignmentModal
            onClose={() => setModalOpen(false)}
            onSave={saveAssignment}
            form={form}
            setForm={setForm}
            editing={editing}
            saving={saving}
            isOpen={modalOpen}
          />
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed right-4 bottom-6 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
