import { useState } from "react";
import { useToast } from "./useToast";

/**
 * Hook for managing search, filter, and sort state for assignments
 * Used primarily in professor dashboard
 */
export const useAssignmentFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("dueAsc");

  return {
    query: searchQuery,
    setQuery: setSearchQuery,
    filter: filterType,
    setFilter: setFilterType,
    sortBy: sortOrder,
    setSortBy: setSortOrder,
  };
};

/**
 * Hook for managing assignment form state (create/edit modal)
 * Tracks form data, edit mode, and saving state
 */
export const useAssignmentForm = (initialFormData) => {
  const [formData, setFormData] = useState(initialFormData);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form back to initial empty state
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingAssignmentId(null);
    setIsSaving(false);
  };

  return {
    form: formData,
    setForm: setFormData,
    editing: editingAssignmentId,
    setEditing: setEditingAssignmentId,
    saving: isSaving,
    setSaving: setIsSaving,
    resetForm,
  };
};

/**
 * Hook for managing which assignment detail panel is open
 * Only one assignment can be expanded at a time
 */
export const useActiveAssignment = () => {
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

  // Toggle: if same ID clicked, collapse; otherwise expand new one
  const toggleExpanded = (assignmentId) => {
    if (expandedAssignmentId === assignmentId) {
      setExpandedAssignmentId(null); // Collapse
    } else {
      setExpandedAssignmentId(assignmentId); // Expand
    }
  };

  return {
    activeId: expandedAssignmentId,
    toggleActive: toggleExpanded,
  };
};

/**
 * Hook for handling assignment submission flow (student side)
 * Manages loading state and success notification
 */
export const useAssignmentSubmission = (onSubmitCallback) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [, showToast] = useToast();

  const handleSubmit = async (assignmentId) => {
    // Show loading indicator
    setIsSubmitting(true);

    try {
      // Call the actual submission function passed from parent
      await onSubmitCallback(assignmentId);

      // Show success notification for 3 seconds
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      return true; // Success
    } catch (error) {
      console.error("Submission failed:", error);
      showToast("Failed to submit assignment");
      return false; // Failure
    } finally {
      // Hide loading indicator
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showSuccess: showSuccessMessage,
    handleSubmit,
  };
};
