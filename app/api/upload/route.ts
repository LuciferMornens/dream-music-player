import { writeFile, readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import lockfile from 'proper-lockfile';
import { v4 as uuidv4 } from 'uuid';
import { Track } from '../../types/track';
import { uploadRequestSchema, tracksDataSchema, trackSchema, formatZodError } from '../../lib/validations';

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];
const MAX_FILENAME_LENGTH = 100;

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

// Parse duration with fallback
function parseDuration(duration: string): string {
  try {
    // Try parsing M:SS format
    const match = duration.match(/^(\d+):([0-5]\d)$/);
    if (match) {
      const [, minutes, seconds] = match;
      return `${minutes}:${seconds}`;
    }

    // Try parsing as seconds and convert to M:SS
    const totalSeconds = Math.round(parseFloat(duration));
    if (!isNaN(totalSeconds) && totalSeconds > 0) {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Default fallback
    return '0:00';
  } catch {
    return '0:00';
  }
}

interface TracksData {
  tracks: Track[];
}

export async function POST(request: NextRequest) {
  let release: (() => Promise<void>) | undefined;

  try {
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

    // Sanitize and validate filename
    const sanitizedFilename = sanitizeFilename(file.name);
    if (!sanitizedFilename) {
      return NextResponse.json(
        { error: 'Invalid filename or unsupported file type' },
        { status: 400 }
      );
    }

    // Try to use sanitized filename first, append UUID only if needed
    const ext = path.extname(sanitizedFilename);
    const baseFilename = sanitizedFilename.slice(0, -ext.length);
    
    // Ensure audio directory exists and is within public directory
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    
    // Try original sanitized name first
    let uniqueFilename = sanitizedFilename;
    let filepath = path.join(audioDir, uniqueFilename);
    
    // If file exists, append shortened UUID
    try {
      await readFile(filepath);
      // File exists, generate unique name
      const shortId = uuidv4().slice(0, 8);
      uniqueFilename = `${baseFilename}-${shortId}${ext}`;
      filepath = path.join(audioDir, uniqueFilename);
    } catch {
      // File doesn't exist, we can use the original name
    }

    // Verify the resolved path is within the audio directory (prevent directory traversal)
    if (!filepath.startsWith(audioDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save the audio file
    await writeFile(filepath, buffer);

    // Get the tracks.json file path
    const tracksPath = path.join(process.cwd(), 'app', 'data', 'tracks.json');
    
    // Acquire a lock before reading/writing
    release = await lockfile.lock(tracksPath, { 
      retries: 5,
      stale: 10000
    });

    // Read and validate existing tracks
    let tracks: Track[] = [];
    
    try {
      const tracksData = await readFile(tracksPath, 'utf-8');
      const data = JSON.parse(tracksData) as TracksData;
      
      // Validate the existing tracks data
      const tracksValidation = tracksDataSchema.safeParse(data);
      if (tracksValidation.success) {
        tracks = tracksValidation.data.tracks;
      } else {
        console.error({
          operation: 'upload_track',
          error: 'invalid_tracks_data',
          details: tracksValidation.error
        });
        // If validation fails, start with empty array
        tracks = [];
      }
    } catch (error) {
      console.error({
        operation: 'upload_track',
        error: 'tracks_read_error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      // If file doesn't exist or is invalid JSON, start with empty array
      tracks = [];
    }

    // Generate track ID by incrementing the highest existing ID
    let maxId = 0;
    for (const track of tracks) {
      const match = track.id.match(/^track(\d+)$/);
      if (match) {
        maxId = Math.max(maxId, parseInt(match[1], 10));
      }
    }
    const id = `track${maxId + 1}`;

    // Extract title from original filename (remove extension and replace hyphens with spaces)
    const title = sanitizedFilename.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');

    // Create and validate the new track object
    const newTrack = {
      id,
      title: title.charAt(0).toUpperCase() + title.slice(1), // Capitalize first letter
      artist: 'Dream Artist',
      url: `/audio/${uniqueFilename}`,
      coverArt: '/images/dw.png',
      genre: genre || 'Uncategorized',
      duration: parseDuration(duration) // Parse and validate duration
    };

    // Validate the new track object
    const trackValidation = trackSchema.safeParse(newTrack);
    if (!trackValidation.success) {
      return NextResponse.json(
        formatZodError(trackValidation.error),
        { status: 400 }
      );
    }

    // Add new track to beginning of array
    tracks.unshift(trackValidation.data);

    // Validate the final tracks data before saving
    const finalValidation = tracksDataSchema.safeParse({ tracks });
    if (!finalValidation.success) {
      return NextResponse.json(
        formatZodError(finalValidation.error),
        { status: 500 }
      );
    }

    // Save updated tracks
    await writeFile(tracksPath, JSON.stringify(finalValidation.data, null, 2));

    // Return success response with track data and full tracks list
    return NextResponse.json({
      success: true,
      track: newTrack,
      tracks // Return all tracks to avoid additional fetch
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
  } finally {
    if (release) {
      try {
        await release();
      } catch (releaseError) {
        console.error({
          operation: 'upload_track',
          error: 'lock_release_error',
          details: releaseError instanceof Error ? releaseError.message : 'Unknown error'
        });
      }
    }
  }
}
