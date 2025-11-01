import React, { useContext, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";

import { Toast } from "../components/toast";
import AssignmentHeader from "../components/AssignmentHeader";
import AssignmentStats from "../components/AssignmentStats";
import AssignmentModal from "../components/AssignmentModal";
import { AssignmentList } from "../components/AssignmentList";
import {
  useAssignmentForm,
  useAssignmentFilters,
  useToast,
} from "../hooks/useAssignment";
import { useAssignmentPersistence } from "../hooks/useAssignmentPersistence";
import {
  createEmptyAssignment,
  calculateAssignmentStats,
  formatDateToLocale,
  filterAndSortAssignments,
  calculateCompletionPercentage,
} from "../utils/assignmentUtils";

export default function ProfessorDashboard() {
  const {
    assignments: contextAssignments,
    setAssignments: contextSetAssignments,
    user,
  } = useContext(AppContext);
  const { professorId } = useParams();
  const professorName = user?.name ?? user?.email ?? "";

  // Custom hooks for state management
  const {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    updateSubmissionStatus,
  } = useAssignmentPersistence(contextAssignments, contextSetAssignments);

  const { query, setQuery, filter, setFilter, sortBy, setSortBy } =
    useAssignmentFilters();

  const { form, setForm, editing, setEditing, saving, setSaving, resetForm } =
    useAssignmentForm(createEmptyAssignment());

  const [toast, showToast] = useToast();
  const [active, setActive] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter assignments for current professor and apply filters
  const myAssignments = assignments.filter(
    (a) => !a.professorId || a.professorId === professorId
  );

  const visibleAssignments = filterAndSortAssignments(
    myAssignments,
    query,
    filter,
    sortBy
  );

  // Calculate statistics
  const stats = calculateAssignmentStats(myAssignments);

  // Modal handlers
  const openCreate = () => {
    const newAssignment = {
      ...createEmptyAssignment(),
      assignmentId: "A" + Date.now(),
      professorId,
      professorName,
    };
    setForm(newAssignment);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (assignment) => {
    setForm({ ...assignment });
    setEditing(assignment.assignmentId);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await updateAssignment(editing, form);
        showToast("Assignment updated successfully");
      } else {
        const submissions = (form.studentsAssigned || []).map((sid) => ({
          studentId: sid,
          status: "pending",
          submittedOn: null,
        }));
        await addAssignment({ ...form, submissions });
        showToast("Assignment created successfully");
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      showToast("Error saving assignment");
      console.error("Error saving assignment:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteAssignment(id);
      showToast("Assignment deleted successfully");
    } catch (error) {
      showToast("Error deleting assignment");
      console.error("Error deleting assignment:", error);
    }
  };

  const toggleStudentStatus = async (assignmentId, studentId) => {
    try {
      const assignment = assignments.find(
        (a) => a.assignmentId === assignmentId
      );
      const currentStatus = assignment?.submissions?.find(
        (s) => s.studentId === studentId
      )?.status;
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await updateSubmissionStatus(assignmentId, studentId, newStatus);
      showToast("Submission status updated");
    } catch (error) {
      showToast("Error updating submission status");
      console.error("Error updating submission status:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AssignmentHeader
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onCreateNew={openCreate}
      />

      <AssignmentStats
        assignmentsCount={stats.assignmentsCount}
        totalStudents={stats.totalStudents}
        completionRate={calculateCompletionPercentage(
          stats.totalCompleted,
          stats.totalStudents
        )}
      />

      <AssignmentList
        assignments={visibleAssignments}
        activeId={active}
        onToggleDetails={(id) => setActive(id === active ? null : id)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleStatus={toggleStudentStatus}
        formatDate={formatDateToLocale}
      />

      <AnimatePresence>
        {modalOpen && (
          <AssignmentModal
            onClose={() => {
              setModalOpen(false);
              resetForm();
            }}
            onSave={handleSave}
            form={form}
            setForm={setForm}
            editing={editing}
            saving={saving}
            isOpen={modalOpen}
          />
        )}
      </AnimatePresence>

      <Toast message={toast} />
    </div>
  );
}
