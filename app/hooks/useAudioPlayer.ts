import { useState, useRef, useCallback, useEffect } from 'react';
import { Track } from '../types/track';

interface AudioError {
  type: 'unsupported' | 'network' | 'decode' | 'aborted' | 'unknown';
  message: string;
}

interface UseAudioPlayerProps {
  onAudioElement?: (element: HTMLAudioElement | null) => void;
}

// Create a singleton audio instance that will be shared across all hook instances
let globalAudioElement: HTMLAudioElement | null = null;

export function useAudioPlayer({ onAudioElement }: UseAudioPlayerProps = {}) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AudioError | null>(null);
  
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize or get the global audio element
  useEffect(() => {
    if (!globalAudioElement) {
      globalAudioElement = new Audio();
      
      // Enable audio context if needed (for browsers that require user interaction)
      const enableAudio = () => {
        type AudioContextType = typeof window.AudioContext;
        const AudioContext: AudioContextType = (window.AudioContext || 
          (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext);
        
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        document.removeEventListener('click', enableAudio);
      };
      document.addEventListener('click', enableAudio);
    }

    onAudioElement?.(globalAudioElement);

    return () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
      }
      onAudioElement?.(null);
    };
  }, [onAudioElement]);

  // Setup basic audio event listeners
  useEffect(() => {
    const audio = globalAudioElement;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    const onLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };
    
    const onCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  // Safe play function that handles promises properly
  const safePlay = useCallback(async (audio: HTMLAudioElement) => {
    try {
      // Cancel any existing play promise
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
        playPromiseRef.current = null;
      }

      // Start new playback
      if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
        playPromiseRef.current = null;
      } else {
        // Wait for enough data before playing
        await new Promise((resolve) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            resolve(undefined);
          };
          audio.addEventListener('canplay', onCanPlay);
        });
        
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
        playPromiseRef.current = null;
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Playback error:', error);
        setIsPlaying(false);
        setError({
          type: 'unknown',
          message: error.message
        });
      }
    }
  }, []);

  // Handle track changes
  useEffect(() => {
    const audio = globalAudioElement;
    if (!audio || !currentTrack?.url) return;

    const cleanup = () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
        playPromiseRef.current = null;
      }
    };

    try {
      // Always work with absolute URLs
      let fullUrl = currentTrack.url;
      if (!fullUrl.startsWith('http') && !fullUrl.startsWith('/')) {
        fullUrl = '/' + fullUrl;
      }

      // Reset state and cancel any pending playback
      cleanup();
      audio.pause();
      setCurrentTime(0);
      setDuration(0);
      setError(null);

      // Set crossOrigin for audio element
      audio.crossOrigin = 'anonymous';
      audio.src = fullUrl;
      audio.load();
        
      if (isPlaying) {
        safePlay(audio).catch(error => {
          console.error('Error playing audio:', error);
          setError({
            type: 'unknown',
            message: error instanceof Error ? error.message : 'Failed to play audio'
          });
        });
      }

    } catch (error) {
      console.error('Error setting track:', error);
      setError({
        type: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to set track'
      });
    }

    return cleanup;
  }, [currentTrack, isPlaying, safePlay]);

  // Handle play/pause
  useEffect(() => {
    const audio = globalAudioElement;
    if (!audio) return;

    if (isPlaying && audio.paused) {
      safePlay(audio);
    } else if (!isPlaying && !audio.paused) {
      // Cancel any pending play promise before pausing
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
        playPromiseRef.current = null;
      }
      audio.pause();
    }
  }, [isPlaying, safePlay]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);

  const seek = useCallback((time: number) => {
    const audio = globalAudioElement;
    if (!audio) return;
    
    const clampedTime = Math.min(Math.max(0, time), audio.duration || 0);
    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }, []);

  return {
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
  };
}
