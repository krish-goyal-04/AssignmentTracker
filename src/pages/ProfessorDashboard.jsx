import React, { useContext, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";

import { Toast, AssignmentStats } from "../components/shared";
import { getProfessors } from "../utils/storage";
import ProfessorAssignmentHeader from "../components/professor/ProfessorAssignmentHeader";
import { ProfessorAssignmentList } from "../components/professor";
import AssignmentModal from "../components/professor/AssignmentModal";
import { useToast } from "../hooks/useToast";
import AppHeader from "../components/shared/AppHeader";
import {
  useAssignmentForm,
  useAssignmentFilters,
} from "../hooks/useAssignmentUI";
import { useAssignmentPersistence } from "../hooks/useAssignmentPersistence";
import {
  createEmptyAssignment,
  calculateAssignmentStats,
  formatDateToLocale,
  filterAndSortAssignments,
  calculateCompletionPercentage,
} from "../utils/assignmentUtils";

/**
 * Professor Dashboard - Main admin view for managing assignments
 * Allows creating, editing, deleting assignments and tracking student submissions
 */
export default function ProfessorDashboard() {
  // Get current user and assignments from context
  const {
    assignments: contextAssignments,
    setAssignments: contextSetAssignments,
    user,
  } = useContext(AppContext);

  // Get professor ID from URL
  const { professorId } = useParams();
  const navigate = useNavigate();
  // Prefer name from storage by professorId; fallback to context user.name/email
  const storedProf = (getProfessors?.() || []).find(
    (p) => p.id === professorId
  );
  const professorName = storedProf?.name || user?.name || user?.email || "";

  // Hook for persisting assignments to storage
  const {
    assignments: allAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    updateSubmissionStatus,
  } = useAssignmentPersistence(contextAssignments, contextSetAssignments);

  // Hook for search, filter, and sort controls
  const { query, setQuery, sortBy, setSortBy } = useAssignmentFilters();

  // Hook for form state (create/edit modal)
  const { form, setForm, editing, setEditing, saving, setSaving, resetForm } =
    useAssignmentForm(createEmptyAssignment());

  // Toast notifications
  const [toastMessage, showToast] = useToast();

  // Track which assignment details panel is expanded
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

  // Track modal open/close state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Step 1: Filter assignments belonging to this professor
  const professorAssignments = allAssignments.filter((assignment) => {
    // Show if no professorId set, or matches current professor
    return !assignment.professorId || assignment.professorId === professorId;
  });

  // Step 2: Apply search and sort (no filter needed)
  const displayedAssignments = filterAndSortAssignments(
    professorAssignments,
    query,
    "", // No filter type for professor view
    sortBy
  );

  // Step 3: Calculate statistics for the stats cards
  const statistics = calculateAssignmentStats(professorAssignments);
  const overallCompletionRate = calculateCompletionPercentage(
    statistics.totalCompleted,
    statistics.totalStudents
  );

  // Stats to display in cards
  const statsCards = [
    {
      title: "Assignments Created",
      value: statistics.assignmentsCount,
      color: "text-slate-500",
    },
    {
      title: "Total Students Assigned",
      value: statistics.totalStudents,
      color: "text-slate-500",
    },
  ];

  // Handler: Open modal to create new assignment
  const openCreateModal = () => {
    // Prepare a blank assignment with generated ID
    const blankAssignment = {
      ...createEmptyAssignment(),
      assignmentId: "A" + Date.now(), // Unique ID using timestamp
      professorId,
      professorName,
      studentsAssigned: [],
      studentsAssignedInput: "", // For textarea input
    };
    setForm(blankAssignment);
    setEditing(null); // Not editing, creating new
    setIsModalOpen(true);
  };

  // Handler: Open modal to edit existing assignment
  const openEditModal = (assignment) => {
    // Convert studentsAssigned array to comma-separated string for textarea
    const studentList = assignment.studentsAssigned
      ? assignment.studentsAssigned.join(", ")
      : "";
    setForm({
      ...assignment,
      studentsAssignedInput: studentList,
    });
    setEditing(assignment.assignmentId); // Set editing mode
    setIsModalOpen(true);
  };

  // Handler: Save assignment (create or update)
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Helper: Build submissions array from student IDs
      // Preserves existing submission status if student was already assigned
      const buildSubmissions = (studentIds, previousSubmissions = []) => {
        return studentIds.map((studentId) => {
          // Check if this student already has a submission record
          const existingSubmission = (previousSubmissions || []).find(
            (sub) => sub.studentId === studentId
          );
          // Keep existing status, or set to pending for new students
          return existingSubmission
            ? existingSubmission
            : { studentId, status: "pending", submittedOn: null };
        });
      };

      // Parse student IDs from form (array or string)
      const studentIds = Array.isArray(form.studentsAssigned)
        ? form.studentsAssigned.map((s) => String(s).trim()).filter(Boolean)
        : [];

      if (editing) {
        // UPDATE existing assignment
        const currentAssignment = allAssignments.find(
          (a) => a.assignmentId === editing
        );
        const submissions = buildSubmissions(
          studentIds,
          currentAssignment?.submissions || []
        );
        await updateAssignment(editing, {
          ...form,
          studentsAssigned: studentIds,
          submissions,
        });
        showToast("✓ Assignment updated successfully");
      } else {
        // CREATE new assignment
        const submissions = buildSubmissions(studentIds, []);
        await addAssignment({
          ...form,
          studentsAssigned: studentIds,
          submissions,
        });
        showToast("✓ Assignment created successfully");
      }

      // Close modal and reset form
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast("⚠ Error saving assignment");
      console.error("Save assignment error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handler: Delete assignment with confirmation
  const handleDeleteAssignment = async (assignmentId) => {
    // Ask for confirmation before deleting
    const confirmed = confirm(
      "Are you sure you want to delete this assignment?"
    );
    if (!confirmed) return;

    try {
      await deleteAssignment(assignmentId);
      showToast("✓ Assignment deleted successfully");
    } catch (error) {
      showToast("⚠ Error deleting assignment");
      console.error("Delete assignment error:", error);
    }
  };

  // Handler: Toggle student submission status (pending ↔ completed)
  const handleToggleSubmissionStatus = async (assignmentId, studentId) => {
    try {
      // Find the assignment
      const assignment = allAssignments.find(
        (a) => a.assignmentId === assignmentId
      );

      // Find current status of this student's submission
      const currentStatus = assignment?.submissions?.find(
        (sub) => sub.studentId === studentId
      )?.status;

      // Toggle: completed → pending, pending → completed
      const newStatus = currentStatus === "completed" ? "pending" : "completed";

      await updateSubmissionStatus(assignmentId, studentId, newStatus);
      showToast("✓ Submission status updated");
    } catch (error) {
      showToast("⚠ Error updating submission status");
      console.error("Toggle submission status error:", error);
    }
  };

  // Handler: Toggle assignment details panel
  const handleToggleDetails = (assignmentId) => {
    // If same ID, collapse; otherwise expand new one
    if (expandedAssignmentId === assignmentId) {
      setExpandedAssignmentId(null);
    } else {
      setExpandedAssignmentId(assignmentId);
    }
  };

  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <AppHeader
        title="Assignment Tracker"
        subtitle="Professor Portal"
        userName={professorName}
        userId={professorId}
        onLogout={handleLogout}
        icon={null}
      />

      {/* Main Content */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header with search, sort, and create button */}
          <ProfessorAssignmentHeader
            query={query}
            setQuery={setQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onCreateNew={openCreateModal}
          />

          {/* Stats cards showing overview */}
          <AssignmentStats
            statsItems={statsCards}
            progress={overallCompletionRate}
          />

          {/* List of assignments with expand/collapse details */}
          <ProfessorAssignmentList
            assignments={displayedAssignments}
            activeId={expandedAssignmentId}
            onToggleDetails={handleToggleDetails}
            onEdit={openEditModal}
            onDelete={handleDeleteAssignment}
            onToggleStatus={handleToggleSubmissionStatus}
            formatDate={formatDateToLocale}
          />

          {/* Create/Edit Modal with animation */}
          <AnimatePresence>
            {isModalOpen && (
              <AssignmentModal
                onClose={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                onSave={handleSaveAssignment}
                form={form}
                setForm={setForm}
                editing={editing}
                saving={saving}
                isOpen={isModalOpen}
              />
            )}
          </AnimatePresence>

          {/* Toast notification */}
          <Toast message={toastMessage} />
        </div>
      </Motion.div>
    </div>
  );
}
