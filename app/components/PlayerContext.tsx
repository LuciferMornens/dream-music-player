'use client';
import React, { createContext, useEffect, useState } from 'react';
import { Track } from '../types/track';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useVolume } from '../hooks/useVolume';
import { useNotifications } from '../hooks/useNotifications';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { useTracks } from '../hooks/useTracks';
import { useAudioAnalyzer, AudioAnalysisData } from '../hooks/useAudioAnalyzer';
import { useBeatSync, BeatSyncData } from '../hooks/useBeatSync';

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
  
  // Beat detection and audio analysis
  audioAnalysisData: AudioAnalysisData;
  beatSyncData: BeatSyncData;
  isAudioAnalyzing: boolean;
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
  handleDeleteCancel: () => {},
  audioAnalysisData: {
    bass: 0,
    mid: 0,
    treble: 0,
    beatStrength: 0,
    isBeat: false,
    beatTempo: 0,
    frequencyData: new Uint8Array(0),
    waveformData: new Uint8Array(0),
    volume: 0,
    energy: 0
  },
  beatSyncData: {
    bassIntensity: 0,
    midIntensity: 0,
    trebleIntensity: 0,
    beatPulse: 0,
    beatScale: 1,
    beatGlow: 0,
    energyLevel: 0,
    volumeLevel: 0,
    tempoMultiplier: 1,
    isHighEnergy: false,
    bassBoost: 0,
    trebleSparkle: 0,
    midMotion: 0,
    cssVars: {
      '--beat-intensity': '0',
      '--bass-level': '0',
      '--mid-level': '0',
      '--treble-level': '0',
      '--energy-level': '0',
      '--beat-scale': '1',
      '--beat-glow': '0',
      '--tempo-speed': '1s'
    }
  },
  isAudioAnalyzing: false
};

export const PlayerContext = createContext<PlayerContextType>(defaultContext);

interface PlayerContextProviderProps {
  children: React.ReactNode;
}

export default function PlayerContextProvider({ children }: PlayerContextProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

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
        setAudioElement(element);
      }
    }
  });

  // Audio analysis and beat detection hooks
  const { analysisData, isAnalyzing } = useAudioAnalyzer(audioElement, {
    enabled: true,
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    beatThreshold: 1.3,
    beatDecayRate: 0.95
  });

  const beatSyncData = useBeatSync(analysisData, isPlaying, {
    enabled: true,
    sensitivity: 1.0,
    smoothing: 0.85,
    beatDecay: 0.92,
    energyBoost: 1.2,
    bassBoost: 1.5,
    trebleBoost: 1.3
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

  // Apply beat sync CSS variables to document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(beatSyncData.cssVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }, [beatSyncData.cssVars]);

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
    handleDeleteCancel,
    audioAnalysisData: analysisData,
    beatSyncData,
    isAudioAnalyzing: isAnalyzing
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}
