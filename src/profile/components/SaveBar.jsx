import { Check, RotateCcw } from "lucide-react";

export default function SaveBar({
  isVisible,
  isSaving,
  onSave,
  onDiscard
}) {
  return (
    <div
      className={`ks-save-bar${isVisible ? " is-visible" : ""}`}
      role="region"
      aria-label="Unsaved Changes Notification"
      aria-live="polite"
    >
      <div className="ks-save-bar-msg">
        <span className="ks-save-bar-dot" aria-hidden="true" />
        <span>You have unsaved changes</span>
      </div>

      <div className="ks-save-bar-actions">
        <button
          type="button"
          className="ks-btn-secondary"
          onClick={onDiscard}
          disabled={isSaving}
        >
          <RotateCcw size={14} />
          <span>Discard</span>
        </button>

        <button
          type="button"
          className="ks-btn-primary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
