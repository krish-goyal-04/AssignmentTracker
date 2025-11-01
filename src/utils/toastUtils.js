import React from "react";
import { toast } from "../shared/toast";

export const createToast = (message, type = "info") => {
  toast[type](message);
};

export const toastMessages = {
  assignmentCreated: "Assignment created successfully",
  assignmentUpdated: "Assignment updated successfully",
  assignmentDeleted: "Assignment deleted successfully",
  submissionUpdated: "Submission status updated successfully",
  error: {
    create: "Error creating assignment",
    update: "Error updating assignment",
    delete: "Error deleting assignment",
    submit: "Error updating submission status",
  },
};
