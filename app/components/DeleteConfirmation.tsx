'use client';
import { useContext, useEffect, useRef } from 'react';
import { PlayerContext } from './PlayerContext';

export default function DeleteConfirmation() {
  const { deleteConfirmation, handleDeleteConfirm, handleDeleteCancel } = useContext(PlayerContext);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (deleteConfirmation) {
      // Focus the cancel button when dialog opens
      cancelRef.current?.focus();

      // Store the element that had focus before dialog opened
      const previousActiveElement = document.activeElement;

      // Trap focus within dialog
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleDeleteCancel();
          return;
        }

        if (e.key !== 'Tab') return;

        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not([disabled])'
        ) as NodeListOf<HTMLButtonElement>;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus when dialog closes
        if (previousActiveElement instanceof HTMLElement) {
          previousActiveElement.focus();
        }
      };
    }
  }, [deleteConfirmation, handleDeleteCancel]);

  if (!deleteConfirmation) return null;

  const { title, isDeleting } = deleteConfirmation;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      role="presentation"
    >
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="glass p-8 rounded-2xl shadow-2xl max-w-md mx-4 border border-surface-800/50"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <h3 id="delete-dialog-title" className="text-2xl font-medium text-surface-50">
            Delete Track
          </h3>
          <p id="delete-dialog-description" className="text-surface-200 text-lg leading-relaxed">
            Are you sure you want to delete<br/>
            <span className="text-primary-400">&quot;{title}&quot;</span>?
          </p>
          <p className="text-surface-400 text-sm">
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3 w-full pt-2">
            <button
              ref={cancelRef}
              onClick={handleDeleteCancel}
              className="flex-1 max-w-[140px] px-6 py-2.5 rounded-xl bg-surface-800/80 text-surface-300 hover:bg-surface-700 transition-all duration-300 hover:text-surface-200"
              disabled={isDeleting}
              aria-label="Cancel deletion"
            >
              Cancel
            </button>
            <button
              ref={deleteRef}
              onClick={handleDeleteConfirm}
              className="flex-1 max-w-[140px] px-6 py-2.5 rounded-xl bg-red-600/90 text-white hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              disabled={isDeleting}
              aria-busy={isDeleting}
              aria-label={isDeleting ? "Deleting track" : "Confirm deletion"}
            >
              {isDeleting ? (
                <span className="flex items-center justify-center">
                  <div 
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
                    role="progressbar"
                    aria-label="Deletion in progress"
                  />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
