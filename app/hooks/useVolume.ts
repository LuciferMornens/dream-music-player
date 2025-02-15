import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVolumeOptions {
  defaultVolume?: number;
  defaultMuted?: boolean;
}

export function useVolume({ defaultVolume = 0.7, defaultMuted = false }: UseVolumeOptions = {}) {
  const [volume, setVolume] = useState(() => {
    try {
      const savedVolume = localStorage.getItem('volume');
      return savedVolume ? parseFloat(savedVolume) : defaultVolume;
    } catch {
      return defaultVolume;
    }
  });

  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('isMuted') === 'true' || defaultMuted;
    } catch {
      return defaultMuted;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update audio volume whenever volume or mute state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const effectiveVolume = isMuted ? 0 : volume;
      audio.volume = effectiveVolume;
      console.log('Setting audio volume:', { effectiveVolume, isMuted, volume });
    }
  }, [volume, isMuted]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('volume', volume.toString());
      localStorage.setItem('isMuted', isMuted.toString());
    } catch {
      // Ignore storage errors
    }
  }, [volume, isMuted]);

  const setAudioElement = useCallback((element: HTMLAudioElement | null) => {
    console.log('Setting audio element:', element);
    audioRef.current = element;
    
    // Initialize volume on new audio element
    if (element) {
      const effectiveVolume = isMuted ? 0 : volume;
      element.volume = effectiveVolume;
      console.log('Initializing audio volume:', { effectiveVolume, isMuted, volume });
    }
  }, [volume, isMuted]);

  const adjustVolume = useCallback((newVolume: number) => {
    console.log('Adjusting volume:', newVolume);
    const clampedVolume = Math.min(Math.max(0, newVolume), 1);
    setVolume(clampedVolume);
  }, []);

  const toggleMute = useCallback(() => {
    console.log('Toggling mute');
    setIsMuted(prev => !prev);
  }, []);

  return {
    volume,
    isMuted,
    adjustVolume,
    toggleMute,
    setAudioElement
  };
}
