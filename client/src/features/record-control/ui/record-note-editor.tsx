import { useState, useEffect } from "react";
import { useRecordControlService } from "../model/context";

interface RecordNoteEditorProps {
  recordId: string;
  currentNote: string;
  disabled?: boolean;
  onNoteChange?: (note: string) => void;
  className?: string;
}

export const RecordNoteEditor = ({
  recordId,
  currentNote,
  disabled = false,
  onNoteChange,
  className = "",
}: RecordNoteEditorProps) => {
  const recordControlService = useRecordControlService();
  const [note, setNote] = useState(currentNote);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNote(currentNote);
    setHasChanges(false);
  }, [currentNote]);

  useEffect(() => {
    setHasChanges(note !== currentNote);
  }, [note, currentNote]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      await recordControlService.updateRecordNote(recordId, note);
      onNoteChange?.(note);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update record note:", error);
      // Revert to current note on error
      setNote(currentNote);
      setHasChanges(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNote(currentNote);
    setHasChanges(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Record Note</label>

      <div className="space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Add a note about this record..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
        />

        {hasChanges && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500">Press Ctrl+Enter to save, Esc to cancel</div>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={disabled || isLoading}
                className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={disabled || isLoading}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
