import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';
import { uploadAudioFile } from '@/lib/supabase/storage';
import { uploadRequestSchema, formatZodError } from '../../lib/validations';
import { createServerClient } from '@/lib/supabase/server';
import path from 'path';

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];
const MAX_FILENAME_LENGTH = 100;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Sanitize and validate filename
function sanitizeFilename(originalName: string): string | null {
  const ext = path.extname(originalName).toLowerCase();
  
  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return null;
  }

  // Remove extension for processing
  const nameWithoutExt = path.basename(originalName, ext).toLowerCase();
  
  // Replace invalid characters and collapse multiple hyphens
  const sanitized = nameWithoutExt
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Check length (accounting for extension)
  if (sanitized.length + ext.length > MAX_FILENAME_LENGTH) {
    return null;
  }
  
  return sanitized + ext;
}

// Parse duration from string to seconds
function parseDurationToSeconds(duration: string): number {
  try {
    // Try parsing M:SS format
    const match = duration.match(/^(\d+):([0-5]\d)$/);
    if (match) {
      const [, minutes, seconds] = match;
      return (parseInt(minutes) * 60) + parseInt(seconds);
    }

    // Try parsing as seconds
    const totalSeconds = Math.round(parseFloat(duration));
    if (!isNaN(totalSeconds) && totalSeconds > 0) {
      return totalSeconds;
    }

    // Default fallback
    return 0;
  } catch {
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Validate the upload request
    const validationResult = uploadRequestSchema.safeParse({
      file: formData.get('file'),
      genre: formData.get('genre'),
      duration: formData.get('duration')
    });

    if (!validationResult.success) {
      return NextResponse.json(
        formatZodError(validationResult.error),
        { status: 400 }
      );
    }

    const { file, genre, duration } = validationResult.data;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Sanitize and validate filename
    const sanitizedFilename = sanitizeFilename(file.name);
    if (!sanitizedFilename) {
      return NextResponse.json(
        { error: 'Invalid filename or unsupported file type' },
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(sanitizedFilename);
    const baseFilename = path.basename(sanitizedFilename, ext);
    const uniqueFilename = `${baseFilename}-${timestamp}${ext}`;

    // Upload file to Supabase Storage
    console.log('Attempting to upload file:', {
      filename: uniqueFilename,
      userId: user.id,
      fileSize: file.size,
      fileType: file.type
    });
    
    const uploadResult = await uploadAudioFile(file, user.id, uniqueFilename);
    if (!uploadResult) {
      console.error('Upload failed - uploadResult is null');
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Extract title from original filename
    const title = baseFilename.replace(/-/g, ' ').charAt(0).toUpperCase() + baseFilename.replace(/-/g, ' ').slice(1);

    // Parse duration to seconds
    const durationSeconds = parseDurationToSeconds(duration);

    // Prepare track data for Supabase
    type TrackInsert = Database['public']['Tables']['tracks']['Insert'];
    const trackData: TrackInsert = {
      user_id: user.id,
      title,
      artist: 'Dream Artist',
      duration: durationSeconds,
      file_url: uploadResult.url,
      file_path: uploadResult.path,
      file_size: file.size,
      genre: genre || 'Uncategorized',
      cover_art: '/images/dw.png',
      metadata: {}
    };

    // Insert track into database
    const { data: newTrack, error: insertError } = await supabase
      .from('tracks')
      .insert(trackData)
      .select()
      .single();

    if (insertError) {
      console.error({
        operation: 'upload_track',
        error: 'database_insert_error',
        details: insertError
      });
      return NextResponse.json(
        { error: 'Failed to save track to database' },
        { status: 500 }
      );
    }

    // Format the track for frontend
    const formattedTrack = {
      id: newTrack.id,
      title: newTrack.title,
      artist: newTrack.artist,
      url: newTrack.file_url,
      coverArt: newTrack.cover_art,
      genre: newTrack.genre,
      duration: `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}`,
      user_id: newTrack.user_id,
      file_path: newTrack.file_path,
      file_size: newTrack.file_size,
      upload_date: newTrack.upload_date,
      metadata: newTrack.metadata
    };

    // Fetch all user tracks for return
    const { data: allTracks, error: fetchError } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    if (fetchError) {
      // Still return success for the upload, just without all tracks
      return NextResponse.json({
        success: true,
        track: formattedTrack,
        tracks: [formattedTrack]
      });
    }

    // Format all tracks for frontend
    const formattedTracks = allTracks?.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.file_url,
      coverArt: track.cover_art,
      genre: track.genre,
      duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`,
      user_id: track.user_id,
      file_path: track.file_path,
      file_size: track.file_size,
      upload_date: track.upload_date,
      metadata: track.metadata
    })) || [];

    // Return success response with track data and full tracks list
    return NextResponse.json({
      success: true,
      track: formattedTrack,
      tracks: formattedTracks
    });
  } catch (error) {
    console.error({
      operation: 'upload_track',
      error: 'unhandled_error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
