import { useState } from "react";
import { useToast } from "./useToast";

// Custom hook for managing assignment filters and search
export const useAssignmentFilters = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueAsc");

  return {
    query,
    setQuery,
    filter,
    setFilter,
    sortBy,
    setSortBy,
  };
};

// Custom hook for managing assignment form state
export const useAssignmentForm = (initialState) => {
  const [form, setForm] = useState(initialState);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm(initialState);
    setEditing(null);
    setSaving(false);
  };

  return {
    form,
    setForm,
    editing,
    setEditing,
    saving,
    setSaving,
    resetForm,
  };
};

// Custom hook for managing the active/expanded state of assignments
export const useActiveAssignment = () => {
  const [activeId, setActiveId] = useState(null);

  const toggleActive = (id) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return {
    activeId,
    toggleActive,
  };
};

// Custom hook for managing assignment submission state
export const useAssignmentSubmission = (onSubmit) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [, showToast] = useToast();

  const handleSubmit = async (assignmentId) => {
    setIsSubmitting(true);
    try {
      await onSubmit(assignmentId);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return true;
    } catch (error) {
      console.error("Error submitting assignment:", error);
      showToast("Failed to submit assignment");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showSuccess,
    handleSubmit,
  };
};
