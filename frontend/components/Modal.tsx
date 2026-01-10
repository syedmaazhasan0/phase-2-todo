'use client';

import { useEffect, useRef } from 'react';
import type { ModalProps } from '@/types';

/**
 * Modal component with focus trap, escape key handling, and backdrop click to close.
 *
 * Features:
 * - Focus trap: Keeps keyboard focus within modal
 * - Escape key: Closes modal when Escape is pressed
 * - Backdrop click: Closes modal when clicking outside content
 * - Size variants: 'sm' (400px), 'md' (600px), 'lg' (800px)
 * - Accessible: Proper ARIA attributes and keyboard navigation
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes for modal width
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  // Handle escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal on open
    modalRef.current?.focus();

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore body scroll
      document.body.style.overflow = 'unset';

      // Restore focus to previous element
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle focus trap
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: Move focus backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: Move focus forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-[var(--card-bg)] rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto border border-[var(--color-border)]`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--card-bg)] to-[var(--background)] rounded-t-lg">
          <h2
            id="modal-title"
            className="text-xl font-bold text-[var(--color-foreground)]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[var(--color-border)] hover:bg-[var(--color-foreground)]/20 text-[var(--color-foreground)] transition-colors flex items-center justify-center w-8 h-8"
            aria-label="Close modal"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 text-[var(--color-foreground)]">{children}</div>
      </div>
    </div>
  );
}
