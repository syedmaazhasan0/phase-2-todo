'use client';

import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getDaysUntilDue = (): { days: number, status: 'overdue' | 'due_soon' | 'on_time' } | null => {
    if (!task.due_date) return null;

    const dueDate = new Date(task.due_date);
    const now = new Date();
    // Set time to midnight for accurate day comparison
    now.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { days: Math.abs(days), status: 'overdue' };
    } else if (days === 0) {
      return { days: 0, status: 'due_soon' }; // Due today
    } else if (days <= 3) {
      return { days, status: 'due_soon' }; // Due in 3 days or less
    } else {
      return { days, status: 'on_time' };
    }
  };

  const getDueDateDisplay = (): { text: string, className: string } | null => {
    if (!task.due_date) return null;

    const dueInfo = getDaysUntilDue();
    if (!dueInfo) return null;

    if (dueInfo.status === 'overdue') {
      return {
        text: `Overdue by ${dueInfo.days} day${dueInfo.days !== 1 ? 's' : ''}`,
        className: 'text-[var(--color-danger-600)] bg-[var(--color-danger-100)] px-3 py-1 rounded-full text-xs font-semibold'
      };
    } else if (dueInfo.status === 'due_soon') {
      if (dueInfo.days === 0) {
        return {
          text: 'Due today!',
          className: 'text-[var(--color-warning-700)] bg-[var(--color-warning-100)] px-3 py-1 rounded-full text-xs font-semibold'
        };
      } else {
        return {
          text: `Due in ${dueInfo.days} day${dueInfo.days !== 1 ? 's' : ''}`,
          className: 'text-[var(--color-warning-700)] bg-[var(--color-warning-100)] px-3 py-1 rounded-full text-xs font-semibold'
        };
      }
    } else {
      return {
        text: `Due in ${dueInfo.days} days`,
        className: 'text-[var(--color-success-700)] bg-[var(--color-success-100)] px-3 py-1 rounded-full text-xs font-semibold'
      };
    }
  };

  const truncateDescription = (desc?: string): string => {
    if (!desc) return '';
    return desc.length > 100 ? desc.slice(0, 100) + '...' : desc;
  };

  return (
    <div
      className={`
        bg-[var(--card-bg)] rounded-2xl border p-6 transition-all duration-300 shadow-lg hover:shadow-xl
        ${task.completed
          ? 'border-[var(--color-success-300)] bg-gradient-to-br from-[var(--color-success-100)] to-[var(--color-success-200)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-primary-400)] hover:scale-[1.02]'
        }
      `}
    >
      <div className="flex items-start gap-5">
        {/* Checkbox for completion toggle */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`
            flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center
            transition-all duration-300 mt-1 shadow-sm
            ${task.completed
              ? 'bg-gradient-to-r from-[var(--color-success-600)] to-[var(--color-success-700)] border-[var(--color-success-600)] shadow-md'
              : 'border-[var(--color-border)] hover:border-[var(--color-success-500)] hover:bg-[var(--color-success-50)]'
            }
          `}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        <div className="flex-grow min-w-0">
          {/* Task title with strikethrough for completed tasks */}
          <h3
            className={`
              text-xl font-bold mb-2.5 truncate
              ${task.completed
                ? 'text-[var(--color-foreground)]/80 line-through'
                : 'text-[var(--color-foreground)]'
              }
            `}
          >
            {task.title}
          </h3>

          {/* Task description (truncated) */}
          {task.description && (
            <p
              className={`
                text-base mb-3.5 break-words leading-relaxed
                ${task.completed
                  ? 'text-[var(--color-foreground)]/80'
                  : 'text-[var(--color-foreground)]'
                }
              `}
            >
              {truncateDescription(task.description)}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <span className={`flex items-center gap-2 ${task.completed ? 'text-[var(--color-foreground)]/70' : 'text-[var(--color-foreground)]/80'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l-4-4m4-4h4m4 4v12h-12V8zM12 8a4 4 0 00-4 4v4m4 0 00-4-4h12m4 0 00-4-4V8z" />
              </svg>
              Created {formatRelativeTime(task.created_at)}
            </span>

            {/* Days Remaining/Due Date Info */}
            {(() => {
              const dueDisplay = getDueDateDisplay();
              if (!dueDisplay) return null;

              return (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={dueDisplay.className}>
                    {dueDisplay.text}
                  </span>
                </span>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(task.id)}
            className={`
              w-12 h-12 flex items-center justify-center rounded-xl
              transition-all duration-300 hover:scale-110 shadow-md
              ${task.completed
                ? 'bg-gradient-to-r from-[var(--color-primary-200)] to-[var(--color-primary-300)] text-[var(--color-foreground)] hover:from-[var(--color-primary-300)] hover:to-[var(--color-primary-400)] hover:shadow-lg'
                : 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)] hover:shadow-lg'
              }
            `}
            aria-label="Edit task"
            title="Edit Task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(task.id)}
            className={`
              w-12 h-12 flex items-center justify-center rounded-xl
              transition-all duration-300 hover:scale-110 shadow-md
              bg-gradient-to-r from-[var(--color-danger-500)] to-[var(--color-danger-600)] text-white hover:from-[var(--color-danger-600)] hover:to-[var(--color-danger-700)] hover:shadow-lg
            `}
            aria-label="Delete task"
            title="Delete Task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
