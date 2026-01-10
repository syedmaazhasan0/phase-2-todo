'use client';

import { useState, useMemo } from 'react';
import type { Task, TaskStatus, TaskSortOption, TaskFormData, UpdateTaskData } from '@/types';
import { createTask, updateTask, deleteTask, toggleTaskComplete } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import Modal from '@/components/Modal';

interface TasksDashboardClientProps {
  tasks: Task[];
  isAuthenticated: boolean;
  currentUser?: { name?: string } | null;
}

export default function TasksDashboardClient({
  tasks: initialTasks,
  isAuthenticated = false,
  currentUser = null
}: TasksDashboardClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
  const [sortOption, setSortOption] = useState<TaskSortOption>('created');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Create task modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit task modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Delete confirmation modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update tasks when initialTasks changes
  useMemo(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Client-side filtering logic
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    if (statusFilter === 'pending') return tasks.filter((t) => !t.completed);
    if (statusFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, statusFilter]);

  // Client-side sorting logic
  const sortedTasks = useMemo(() => {
    const tasksToSort = [...filteredTasks];
    switch (sortOption) {
      case 'created':
        return tasksToSort.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'title':
        return tasksToSort.sort((a, b) => a.title.localeCompare(b.title));
      case 'due_date':
        return tasksToSort.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      default:
        return tasksToSort;
    }
  }, [filteredTasks, sortOption]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const requireLogin = () => {
    router.push('/login');
  };

  const handleCreateTask = async (data: TaskFormData) => {
    setErrorMessage(null);
    setIsCreating(true);
    try {
      const newTask = await createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      setIsCreateModalOpen(false);
      showSuccessMessage('Task created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      showErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (taskId: string) => {
    if (!isAuthenticated) { requireLogin(); return; }
    const task = tasks.find((t) => t.id === taskId);
    if (task) setEditingTask(task);
  };

  const handleEditTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    setErrorMessage(null);
    setIsEditing(true);
    try {
      const updatedTask = await updateTask(editingTask.id, data as UpdateTaskData);
      setTasks((prev) => prev.map((t) => t.id === editingTask.id ? updatedTask : t));
      setEditingTask(null);
      showSuccessMessage('Task updated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      showErrorMessage(message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    if (!isAuthenticated) { requireLogin(); return; }
    setErrorMessage(null);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const originalCompleted = task.completed;
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, completed: !originalCompleted } : t));
    try {
      await toggleTaskComplete(taskId);
      showSuccessMessage(originalCompleted ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle task';
      showErrorMessage(message);
      setTasks((prev) => prev.map((t) => t.id === taskId ? task : t));
    }
  };

  const handleDeleteClick = (taskId: string) => {
    if (!isAuthenticated) { requireLogin(); return; }
    const task = tasks.find((t) => t.id === taskId);
    if (task) setTaskToDelete(task);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
      showSuccessMessage('Task deleted successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      showErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-right-4 fade-in-0 zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-right-4 fade-in-0 zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--color-border)] p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Status Filter Dropdown */}
            <div className="flex-1 sm:flex-initial min-w-[140px]">
              <label htmlFor="status-filter" className="sr-only">Filter by status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus)}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent bg-[var(--card-bg)] text-[var(--color-foreground)] font-medium transition-all duration-200"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex-1 sm:flex-initial min-w-[160px]">
              <label htmlFor="sort-option" className="sr-only">Sort by</label>
              <select
                id="sort-option"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as TaskSortOption)}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent bg-[var(--card-bg)] text-[var(--color-foreground)] font-medium transition-all duration-200"
              >
                <option value="created">Sort by Created</option>
                <option value="title">Sort by Title</option>
                <option value="due_date">Sort by Due Date</option>
              </select>
            </div>

            {/* Add New Task Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white font-semibold rounded-xl hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add New Task
              </button>
            )}
            {!isAuthenticated && (
              <button
                onClick={requireLogin}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-xl hover:from-gray-500 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4v12a2 2 0 002 2h6a2 2 0 002-2V9c0-1.105-.553-2-2-2z" />
                </svg>
                Sign In to Add
              </button>
            )}
          </div>

          {/* Task count display */}
          <div className="text-sm font-semibold text-[var(--color-foreground)]/70 bg-[var(--card-bg)] px-4 py-2 rounded-xl border border-[var(--color-border)]">
            {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </div>
        </div>
      </div>

      {/* Empty State UI */}
      {sortedTasks.length === 0 && (
        <div className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[var(--color-primary-100)] to-[var(--color-primary-200)] rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
            No tasks yet
          </h3>
          <p className="text-[var(--color-foreground)]/80 text-lg mb-4">
            {statusFilter === 'all'
              ? "You don't have any tasks yet."
              : `No ${statusFilter} tasks found.`}
          </p>
          {isAuthenticated && (
            <p className="text-[var(--color-foreground)]/60 text-sm">
              Click the "Add New Task" button to create your first task.
            </p>
          )}
          {!isAuthenticated && (
            <button
              onClick={requireLogin}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white font-semibold rounded-xl hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)] transition-all duration-200 shadow-md"
            >
              Sign In to Get Started
            </button>
          )}
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDeleteClick} onToggleComplete={handleToggleComplete} />
        ))}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          mode="edit"
          initialData={editingTask ? {
            title: editingTask.title,
            description: editingTask.description,
            due_date: editingTask.due_date,
          } : undefined}
          onSubmit={handleEditTask}
          onCancel={() => setEditingTask(null)}
          isLoading={isEditing}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task"
        size="md"
      >
        <div className="space-y-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-danger-100)] rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-danger-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 11.5a2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <p className="text-center text-lg text-[var(--color-foreground)] mb-4">
            Are you sure you want to delete task
          </p>
          <div className="bg-[var(--card-bg)] rounded-2xl px-6 py-4 text-center border border-[var(--color-border)]">
            <p className="text-xl font-bold text-[var(--color-foreground)] mb-2">
              "{taskToDelete?.title}"
            </p>
            <p className="text-[var(--color-foreground)]/60 text-sm">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setTaskToDelete(null)}
              disabled={isDeleting}
              className="px-6 py-3 bg-[var(--color-border)] text-[var(--color-foreground)] font-semibold rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-6 py-3 bg-gradient-to-r from-[var(--color-danger-500)] to-[var(--color-danger-600)] text-white font-semibold rounded-xl hover:from-[var(--color-danger-600)] hover:to-[var(--color-danger-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger-500)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Task
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
