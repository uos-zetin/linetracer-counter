import { useState, useEffect } from "react";
import { Button, Textarea } from "@/shared/ui";
import { useRecordService } from "../model/context";

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
  const recordService = useRecordService();
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
      await recordService.admin.updateNote(recordId, note);
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
      <label className="block text-sm font-medium text-foreground">Record Note</label>

      <div className="space-y-2">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Add a note about this record..."
          className="resize-none"
          rows={3}
        />

        {hasChanges && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Press Ctrl+Enter to save, Esc to cancel</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={disabled || isLoading}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={disabled || isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
