import { useEffect, useRef } from "react";
import { AlertCircle, Check, Trash2, X } from "lucide-react";

export default function UnsavedChangesModal({
  isOpen,
  isSaving,
  onSaveAndLeave,
  onDiscardAndLeave,
  onStay
}) {
  const saveBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus save button on open
    setTimeout(() => {
      saveBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onStay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onStay]);

  if (!isOpen) return null;

  return (
    <div
      className="ks-modal-overlay"
      role="presentation"
      onClick={onStay}
    >
      <div
        className="ks-unsaved-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ks-unsaved-title"
        aria-describedby="ks-unsaved-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FFD60A]/10 border border-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A] shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 id="ks-unsaved-title" className="text-lg font-bold text-white">
                Unsaved Changes
              </h3>
              <p className="text-xs text-gray-400">
                You have modified information that hasn't been saved yet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStay}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
            aria-label="Close dialog and stay"
          >
            <X size={18} />
          </button>
        </div>

        <p id="ks-unsaved-desc" className="text-sm text-gray-300 mb-6 leading-relaxed">
          If you switch sections now without saving, your recent edits will be lost. Would you like to save your edits first, discard them, or stay on this tab?
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            className="ks-unsaved-btn ks-unsaved-btn--stay w-full sm:w-auto"
            onClick={onStay}
            disabled={isSaving}
          >
            Stay on Section
          </button>

          <button
            type="button"
            className="ks-unsaved-btn ks-unsaved-btn--discard w-full sm:w-auto"
            onClick={onDiscardAndLeave}
            disabled={isSaving}
          >
            <Trash2 size={14} />
            <span>Discard Edits</span>
          </button>

          <button
            ref={saveBtnRef}
            type="button"
            className="ks-unsaved-btn ks-unsaved-btn--save w-full sm:w-auto"
            onClick={onSaveAndLeave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={16} />
                <span>Save & Continue</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
