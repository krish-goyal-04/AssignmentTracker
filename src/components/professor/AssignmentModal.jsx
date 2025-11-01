import React from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "../ui/button";

/**
 * AssignmentModal Component
 *
 * Modal dialog for creating a new assignment or editing an existing one.
 * Shows form fields for:
 * - Title, due date, description
 * - Drive template link
 * - Student IDs (comma-separated textarea)
 *
 * On blur of student IDs field:
 * - Parses input (comma/space/newline separated)
 * - Converts to uppercase
 * - Creates submission records (preserving existing status)
 *
 * Uses Motion for smooth entrance/exit animations and backdrop fade.
 */
const AssignmentModal = ({
  isOpen,
  onClose,
  onSave,
  form,
  setForm,
  editing,
  saving,
}) => {
  // Don't render modal if not open
  if (!isOpen) return null;

  return (
    <Motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop with click-to-close */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />

      {/* Modal card with form */}
      <Motion.div
        initial={{ y: 12, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.98 }}
        className="relative max-w-2xl w-full bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <form onSubmit={onSave}>
          {/* Header section */}
          <div className="p-6 border-b bg-linear-to-br from-slate-50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {editing ? "📝 Edit Assignment" : "✨ New Assignment"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {editing
                    ? "Modify assignment details and student list"
                    : "Create a new assignment for your students"}
                </p>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  required
                  value={form.title || ""}
                  onChange={(e) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Math Homework 5"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Due date field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due date *
                </label>
                <input
                  required
                  type="date"
                  value={form.dueDate || ""}
                  onChange={(e) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description field (spans 2 columns) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the assignment objectives and instructions..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Drive link field (spans 2 columns) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Drive template link
                </label>
                <input
                  value={form.driveTemplateLink || ""}
                  onChange={(e) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      driveTemplateLink: e.target.value,
                    }))
                  }
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Student IDs field (spans 2 columns) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Students assigned
                </label>
                <textarea
                  value={form.studentsAssignedInput || ""}
                  onChange={(e) => {
                    // Update textarea value as user types
                    setForm((prevForm) => ({
                      ...prevForm,
                      studentsAssignedInput: e.target.value,
                    }));
                  }}
                  onBlur={(e) => {
                    // When user leaves textarea, parse the student IDs
                    // Step 1: Split by commas, spaces, or newlines
                    const parsedIds = e.target.value
                      .split(/[ ,\s\n]+/)
                      .map((id) => id.trim().toUpperCase()) // Convert to uppercase
                      .filter(Boolean); // Remove empty strings

                    // Step 2: Build submission records for each student
                    // Preserve existing submission status if student was already assigned
                    const submissionRecords = parsedIds.map((studentId) => {
                      const existingSubmission = form.submissions?.find(
                        (sub) => sub.studentId === studentId
                      );
                      return {
                        studentId,
                        status: existingSubmission?.status || "pending",
                        submittedOn: existingSubmission?.submittedOn || null,
                      };
                    });

                    // Step 3: Update form with cleaned list and submissions
                    setForm((prevForm) => ({
                      ...prevForm,
                      studentsAssigned: parsedIds,
                      studentsAssignedInput: parsedIds.join(", "), // Format nicely
                      submissions: submissionRecords,
                    }));
                  }}
                  placeholder="Enter student IDs (e.g., S101, S102, S103)"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={2}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separate IDs with commas, spaces, or line breaks
                </p>
              </div>
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-slate-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "⏳ Saving..."
                : editing
                ? "✓ Save changes"
                : "✓ Create"}
            </Button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
};

export default AssignmentModal;
