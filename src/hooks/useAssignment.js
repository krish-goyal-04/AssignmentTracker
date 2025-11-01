import { useState } from "react";

export function useToast(duration = 2000) {
  const [message, setMessage] = useState("");

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  return [message, showToast];
}

export function useAssignmentForm(initialState) {
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
}

export function useAssignmentFilters() {
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
}
