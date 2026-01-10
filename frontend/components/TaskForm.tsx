'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { TaskFormProps } from '@/types';

/**
 * TaskForm component handles creating and editing tasks.
 *
 * Features:
 * - Mode support: 'create' or 'edit'
 * - Title validation: 1-200 characters, required
 * - Description validation: max 1000 characters, optional
 * - Due date: optional, ISO 8601 format
 * - Client-side validation with inline error display
 */
export default function TaskForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Update form when initialData changes (e.g., when switching tasks to edit)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDueDate(initialData.due_date || '');
    }
  }, [initialData]);

  // Validate title: 1-200 characters
  const validateTitle = (value: string): string | null => {
    if (!value.trim()) {
      return 'Title is required';
    }
    if (value.length > 200) {
      return 'Title must be 200 characters or less';
    }
    return null;
  };

  // Validate description: max 1000 characters
  const validateDescription = (value: string): string | null => {
    if (value.length > 1000) {
      return 'Description must be 1000 characters or less';
    }
    return null;
  };

  // Handle title change with validation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (touched) {
      setTitleError(validateTitle(value));
    }
  };

  // Handle description change with validation
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (touched) {
      setDescriptionError(validateDescription(value));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const titleValidationError = validateTitle(title);
    const descriptionValidationError = validateDescription(description);

    setTitleError(titleValidationError);
    setDescriptionError(descriptionValidationError);

    if (!titleValidationError && !descriptionValidationError) {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
      });
    }
  };

  // Calculate remaining character count for description
  const descriptionRemaining = 1000 - description.length;
  const isDescriptionNearLimit = descriptionRemaining < 100;
  const isDescriptionAtLimit = descriptionRemaining <= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title field */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-sm font-semibold text-[var(--color-foreground)]/90 mb-2"
        >
          Title <span className="text-[var(--color-danger-500)]">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={() => {
            setTouched(true);
            setTitleError(validateTitle(title));
          }}
          disabled={isLoading}
          placeholder="Enter task title"
          maxLength={200}
          className={`
            w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-500)]/30 focus:border-[var(--color-primary-500)]
            disabled:bg-[var(--background)]/50 disabled:text-[var(--color-foreground)]/50 transition-all duration-300
            ${titleError
              ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)]/30'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary-500)]'
            }
          `}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
        />
        {titleError && (
          <p id="title-error" className="mt-2 text-sm text-[var(--color-danger-600)] font-medium">
            {titleError}
          </p>
        )}
        <p className="mt-1 text-xs text-[var(--color-foreground)]/60 font-medium">
          {title.length}/200 characters
        </p>
      </div>

      {/* Description field */}
      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-semibold text-[var(--color-foreground)]/90 mb-2"
        >
          Description (optional)
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={handleDescriptionChange}
          onBlur={() => {
            setTouched(true);
            setDescriptionError(validateDescription(description));
          }}
          disabled={isLoading}
          placeholder="Add a description for your task"
          rows={4}
          maxLength={1000}
          className={`
            w-full px-5 py-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-500)]/30 focus:border-[var(--color-primary-500)]
            disabled:bg-[var(--background)]/50 disabled:text-[var(--color-foreground)]/50 transition-all duration-300
            ${descriptionError
              ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)]/30'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary-500)]'
            }
          `}
          aria-invalid={!!descriptionError}
          aria-describedby={descriptionError ? 'description-error' : 'description-count'}
        />
        {descriptionError && (
          <p id="description-error" className="mt-2 text-sm text-[var(--color-danger-600)] font-medium">
            {descriptionError}
          </p>
        )}
        <p
          id="description-count"
          className={`
            mt-1 text-xs font-medium
            ${isDescriptionAtLimit
              ? 'text-[var(--color-danger-600)]'
              : isDescriptionNearLimit
              ? 'text-[var(--color-warning-600)]'
              : 'text-[var(--color-foreground)]/60'
            }
          `}
        >
          {descriptionRemaining} characters remaining
        </p>
      </div>

      {/* Due date field */}
      <div>
        <label
          htmlFor="task-due-date"
          className="block text-sm font-semibold text-[var(--color-foreground)]/90 mb-2"
        >
          Due Date (optional)
        </label>
        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
          min={new Date().toISOString().split('T')[0]}  // Prevent past dates
          className={`
            w-full px-5 py-4 border-2 border-[var(--color-border)] rounded-xl
            focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-500)]/30 focus:border-[var(--color-primary-500)]
            disabled:bg-[var(--background)]/50 disabled:text-[var(--color-foreground)]/50 transition-all duration-300
          `}
        />
      </div>

      {/* Form actions */}
      <div className="flex gap-4 pt-3">
        <button
          type="submit"
          disabled={isLoading || !!titleError || !!descriptionError}
          className={`
            flex-1 py-4 font-bold text-lg rounded-xl
            focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-500)]/30
            transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5
            ${isLoading
              ? 'bg-gradient-to-r from-[var(--color-foreground)]/40 to-[var(--color-foreground)]/50 text-white/70 cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-800)]'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </span>
          ) : (
            mode === 'create' ? 'Create Task' : 'Save Changes'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`
            py-4 px-6 font-bold text-lg rounded-xl border-0
            focus:outline-none focus:ring-4 focus:ring-[var(--color-foreground)]/30
            hover:shadow-lg transition-all duration-300 shadow-lg
            bg-gradient-to-r from-[var(--color-foreground)]/10 to-[var(--color-foreground)]/20 text-[var(--color-foreground)] hover:from-[var(--color-foreground)]/20 hover:to-[var(--color-foreground)]/30
            disabled:bg-[var(--color-foreground)]/10 disabled:text-[var(--color-foreground)]/40
          `}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
