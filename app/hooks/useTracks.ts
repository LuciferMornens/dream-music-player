import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { Track, formatSupabaseTrack } from '../types/track';

interface UseTracksOptions {
  onTrackDeleted?: (track: Track) => void;
}

export function useTracks({ onTrackDeleted }: UseTracksOptions = {}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch tracks from API
  const fetchTracks = useCallback(async () => {
    if (!user) {
      setTracks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tracks');
      if (!response.ok) {
        if (response.status === 401) {
          setTracks([]);
          return;
        }
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load tracks when user changes
  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Set up real-time subscription for tracks
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('tracks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Track change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTrack = formatSupabaseTrack(payload.new);
            setTracks(prevTracks => [newTrack, ...prevTracks]);
          } else if (payload.eventType === 'DELETE') {
            setTracks(prevTracks => prevTracks.filter(t => t.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            const updatedTrack = formatSupabaseTrack(payload.new);
            setTracks(prevTracks =>
              prevTracks.map(t => (t.id === updatedTrack.id ? updatedTrack : t))
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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
      return [...uniqueNewTracks, ...prevTracks];
    });
  }, []);

  const refreshTracks = useCallback(() => {
    fetchTracks();
  }, [fetchTracks]);

  return {
    tracks,
    loading,
    error,
    setTracks,
    deleteTrack,
    addTracks,
    refreshTracks
  };
}
