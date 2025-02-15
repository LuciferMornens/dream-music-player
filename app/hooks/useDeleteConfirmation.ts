import { useState, useCallback } from 'react';
import { Track } from '../types/track';

interface DeleteConfirmationState {
  track: Track;
  title: string;
  isDeleting: boolean;
}

interface UseDeleteConfirmationProps {
  onConfirm: (track: Track) => Promise<void>;
}

export function useDeleteConfirmation({ onConfirm }: UseDeleteConfirmationProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState | null>(null);

  const showDeleteConfirmation = useCallback((track: Track) => {
    setDeleteConfirmation({
      track,
      title: track.title,
      isDeleting: false
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmation || deleteConfirmation.isDeleting) return;

    const { track } = deleteConfirmation;
    
    try {
      setDeleteConfirmation(prev => prev ? { ...prev, isDeleting: true } : null);
      await onConfirm(track);
    } finally {
      setDeleteConfirmation(null);
    }
  }, [deleteConfirmation, onConfirm]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmation(null);
  }, []);

  return {
    deleteConfirmation,
    showDeleteConfirmation,
    handleDeleteConfirm,
    handleDeleteCancel
  };
}
