import type { Database } from '@/types/database';

// Legacy track interface for compatibility
export interface LegacyTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverArt?: string;
  genre?: string;
  duration?: string;
}

// Modern track interface compatible with Supabase
export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string; // This will be file_url from Supabase
  coverArt?: string;
  genre?: string;
  duration?: string; // This will be formatted from duration (seconds) in Supabase
  // Additional fields for Supabase compatibility
  user_id?: string;
  file_path?: string;
  file_size?: number;
  upload_date?: string;
  metadata?: Record<string, unknown>;
}

// Helper function to convert Supabase track to frontend Track
export function formatSupabaseTrack(supabaseTrack: Database['public']['Tables']['tracks']['Row']): Track {
  const duration = Number(supabaseTrack.duration) || 0;
  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = duration % 60;
  const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  const meta: Record<string, unknown> =
    typeof supabaseTrack.metadata === 'object' && supabaseTrack.metadata !== null
      ? (supabaseTrack.metadata as Record<string, unknown>)
      : {};

  return {
    id: supabaseTrack.id,
    title: supabaseTrack.title,
    artist: supabaseTrack.artist,
    url: supabaseTrack.file_url,
    coverArt: supabaseTrack.cover_art || '/images/dw.png',
    genre: supabaseTrack.genre || 'Uncategorized',
    duration: formattedDuration,
    user_id: supabaseTrack.user_id ?? undefined,
    file_path: supabaseTrack.file_path,
    file_size: supabaseTrack.file_size,
    upload_date: supabaseTrack.upload_date ?? undefined,
    metadata: meta
  };
}

// Helper function to convert frontend track to Supabase format
export function formatTrackForSupabase(track: Track, userId: string, filePath: string): Record<string, unknown> {
  const [minutes, seconds] = (track.duration || '0:00').split(':').map(Number);
  const totalSeconds = (minutes * 60) + seconds;

  return {
    title: track.title,
    artist: track.artist,
    duration: totalSeconds,
    file_url: track.url,
    file_path: filePath,
    genre: track.genre || 'Uncategorized',
    cover_art: track.coverArt || '/images/dw.png',
    user_id: userId,
    file_size: track.file_size || 0,
    metadata: track.metadata || {}
  };
}