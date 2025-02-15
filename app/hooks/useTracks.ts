import { useState, useCallback, useEffect } from 'react';
import { Track } from '../types/track';

interface UseTracksOptions {
  onTrackDeleted?: (track: Track) => void;
}

export function useTracks({ onTrackDeleted }: UseTracksOptions = {}) {
  const [tracks, setTracks] = useState<Track[]>(() => {
    // Try to get initial tracks from localStorage to prevent flash
    try {
      const cached = localStorage.getItem('tracks');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Cache tracks in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tracks', JSON.stringify(tracks));
    } catch {
      // Ignore storage errors
    }
  }, [tracks]);

  const deleteTrack = useCallback(async (track: Track) => {
    try {
      const response = await fetch('/api/tracks/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }

      // Update tracks list by removing the deleted track
      setTracks(prevTracks => prevTracks.filter(t => t.id !== track.id));
      
      // Notify parent about deletion
      if (onTrackDeleted) {
        onTrackDeleted(track);
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      throw error; // Re-throw to let parent handle error notification
    }
  }, [onTrackDeleted]);

  const addTracks = useCallback((newTracks: Track[]) => {
    setTracks(prevTracks => {
      // Filter out any tracks that already exist (by id)
      const uniqueNewTracks = newTracks.filter(
        newTrack => !prevTracks.some(existingTrack => existingTrack.id === newTrack.id)
      );
      return [...prevTracks, ...uniqueNewTracks];
    });
  }, []);

  return {
    tracks,
    setTracks,
    deleteTrack,
    addTracks
  };
}
