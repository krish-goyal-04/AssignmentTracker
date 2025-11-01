import React from "react";
import { Button } from "../ui/button";

export const SubmissionModal = ({
  isOpen,
  title,
  onCancel,
  onConfirm,
  submitting,
  successMsg,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800">
            Confirm submission
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you have submitted{" "}
            <span className="font-medium">{title}</span> on Drive?
          </p>

          <div className="mt-4 text-sm text-slate-600">
            <p>Steps (double verification):</p>
            <ol className="list-decimal list-inside ml-3 mt-2 text-slate-500">
              <li>
                Open the assignment template and upload your work to Drive.
              </li>
              <li>
                Make sure sharing link / permissions allow professor to view.
              </li>
              <li>
                Click Confirm Submission → Final Confirm to mark as submitted.
              </li>
            </ol>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t">
          <Button
            className="bg-white border text-slate-700"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>

          <div className="ml-auto flex items-center gap-3">
            <Button
              className="text-sm rounded-md px-3 py-2 bg-amber-500 text-white hover:bg-amber-600"
              onClick={onConfirm}
              disabled={submitting}
            >
              Final Confirm
            </Button>

            <Button
              className="text-sm rounded-md px-3 py-2 bg-gray-100"
              onClick={onCancel}
              disabled={submitting}
            >
              Back
            </Button>
          </div>
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            Processing...
          </div>
        )}

        {successMsg && (
          <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white p-3 text-center">
            {successMsg}
          </div>
        )}
      </div>
    </div>
  );
};
