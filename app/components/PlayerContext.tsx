'use client';
import React, { createContext, useEffect, useState } from 'react';
import { Track } from '../types/track';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useVolume } from '../hooks/useVolume';
import { useNotifications } from '../hooks/useNotifications';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { useTracks } from '../hooks/useTracks';

interface PlayerContextType {
  // Track management
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  
  // Playback controls
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  isLoading: boolean;
  error: { type: string; message: string; } | null;
  
  // Volume controls
  volume: number;
  isMuted: boolean;
  adjustVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Notifications
  showToast: boolean;
  toastMessage: string;
  showNotification: (message: string) => void;
  
  // Delete confirmation
  deleteConfirmation: { track: Track; title: string; isDeleting: boolean; } | null;
  showDeleteConfirmation: (track: Track) => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
}

// Initialize with proper default values instead of empty object
const defaultContext: PlayerContextType = {
  tracks: [],
  setTracks: () => {},
  currentTrack: null,
  isPlaying: false,
  playTrack: () => {},
  pauseTrack: () => {},
  togglePlay: () => {},
  currentTime: 0,
  duration: 0,
  seek: () => {},
  isLoading: false,
  error: null,
  volume: 1,
  isMuted: false,
  adjustVolume: () => {},
  toggleMute: () => {},
  showToast: false,
  toastMessage: '',
  showNotification: () => {},
  deleteConfirmation: null,
  showDeleteConfirmation: () => {},
  handleDeleteConfirm: () => {},
  handleDeleteCancel: () => {}
};

export const PlayerContext = createContext<PlayerContextType>(defaultContext);

interface PlayerContextProviderProps {
  children: React.ReactNode;
}

export default function PlayerContextProvider({ children }: PlayerContextProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize hooks in consistent order
  const { tracks, setTracks, deleteTrack } = useTracks();
  const { showToast, toastMessage, showNotification } = useNotifications();
  const volumeControls = useVolume();
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    playTrack,
    pauseTrack,
    togglePlay,
    seek
  } = useAudioPlayer({
    onAudioElement: (element) => {
      if (element) {
        volumeControls.setAudioElement(element);
      }
    }
  });

  const { 
    deleteConfirmation, 
    showDeleteConfirmation, 
    handleDeleteConfirm: confirmDelete, 
    handleDeleteCancel 
  } = useDeleteConfirmation({
    onConfirm: async (track) => {
      try {
        showNotification(`Deleting "${track.title}"...`);
        await deleteTrack(track);
        showNotification(`Successfully deleted "${track.title}"`);
      } catch (error) {
        showNotification('Failed to delete track. Please try again.');
        throw error;
      }
    }
  });

  // Ensure all hooks are initialized before rendering children
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  const contextValue: PlayerContextType = {
    tracks,
    setTracks,
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    togglePlay,
    currentTime,
    duration,
    seek,
    isLoading,
    error,
    volume: volumeControls.volume,
    isMuted: volumeControls.isMuted,
    adjustVolume: volumeControls.adjustVolume,
    toggleMute: volumeControls.toggleMute,
    showToast,
    toastMessage,
    showNotification,
    deleteConfirmation,
    showDeleteConfirmation,
    handleDeleteConfirm: confirmDelete,
    handleDeleteCancel
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}
