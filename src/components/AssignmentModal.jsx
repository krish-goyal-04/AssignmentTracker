import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

const AssignmentModal = ({
  isOpen,
  onClose,
  onSave,
  form,
  setForm,
  editing,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !saving && onClose()}
      />
      <motion.div
        initial={{ y: 12, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.98 }}
        className="relative max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <form onSubmit={onSave}>
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
                onClick={() => onClose()}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600">Title</label>
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
                <label className="block text-xs text-slate-600">Due date</label>
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
              onClick={() => onClose()}
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
  );
};

export default AssignmentModal;
