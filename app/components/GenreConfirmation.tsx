'use client';
import { ReactElement, useEffect, useRef } from 'react';

interface GenreConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GenreConfirmation({ onConfirm, onCancel }: GenreConfirmationProps): ReactElement {
  const dialogRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the skip button when dialog opens
    skipRef.current?.focus();

    // Store the element that had focus before dialog opened
    const previousActiveElement = document.activeElement;

    // Trap focus within dialog
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
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
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      role="presentation"
    >
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="genre-dialog-title"
        aria-describedby="genre-dialog-description"
        className="glass p-8 rounded-2xl shadow-2xl max-w-md mx-4 border border-surface-800/50"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <h3 id="genre-dialog-title" className="text-2xl font-medium text-surface-50">
            Add Genre?
          </h3>
          <div id="genre-dialog-description">
            <p className="text-surface-200 text-lg leading-relaxed">
              Would you like to add a genre to your track?<br/>
              <span className="text-surface-400 text-sm">
                This helps organize your music library.
              </span>
            </p>
          </div>
          <div className="flex justify-center gap-3 w-full pt-2">
            <button
              ref={skipRef}
              onClick={onCancel}
              className="flex-1 max-w-[140px] px-6 py-2.5 rounded-xl bg-surface-800/80 text-surface-300 hover:bg-surface-700 transition-all duration-300 hover:text-surface-200"
              aria-label="Skip adding genre"
            >
              Skip
            </button>
            <button
              ref={addRef}
              onClick={onConfirm}
              className="flex-1 max-w-[140px] px-6 py-2.5 rounded-xl bg-primary-600/90 text-white hover:bg-primary-500 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
              aria-label="Add genre to track"
            >
              Add Genre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
