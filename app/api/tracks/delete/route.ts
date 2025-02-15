import { NextResponse } from 'next/server';
import { unlink, readFile, writeFile } from 'fs/promises';
import path from 'path';
import lockfile from 'proper-lockfile';
import { deleteRequestSchema, tracksDataSchema, formatZodError } from '../../../lib/validations';

export async function DELETE(request: Request) {
    let release: (() => Promise<void>) | undefined;
    
    try {
        const body = await request.json();
        
        // Validate the request body
        const validationResult = deleteRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                formatZodError(validationResult.error),
                { status: 400 }
            );
        }

        const { trackId } = validationResult.data;

        // Get the tracks.json file path
        const dataFilePath = path.join(process.cwd(), 'app/data/tracks.json');
        
        // Acquire a lock before reading/writing
        release = await lockfile.lock(dataFilePath, { 
            retries: 5,
            stale: 10000
        });

        // Read and validate the current tracks
        const fileContent = await readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Validate the tracks data structure
        const tracksValidation = tracksDataSchema.safeParse(data);
        if (!tracksValidation.success) {
            console.error({
                operation: 'delete_track',
                error: 'invalid_tracks_data',
                details: tracksValidation.error
            });
            return NextResponse.json(
                formatZodError(tracksValidation.error),
                { status: 500 }
            );
        }
        
        // Find the track
        const trackIndex = tracksValidation.data.tracks.findIndex(track => track.id === trackId);
        
        if (trackIndex === -1) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        // Get the track data before removing it
        const track = data.tracks[trackIndex];
        
        // Extract filename from the URL (e.g., "/audio/song.mp3" -> "song.mp3")
        const filename = track.url.split('/').pop();
        
        if (!filename) {
            return NextResponse.json({ error: 'Invalid track URL' }, { status: 400 });
        }

        // Construct the full path to the audio file
        const audioFilePath = path.join(process.cwd(), 'public', 'audio', filename);

        try {
            // Delete the audio file
            await unlink(audioFilePath);
            
            // Remove the track from the array
            data.tracks.splice(trackIndex, 1);

            // Write back to tracks.json
            await writeFile(dataFilePath, JSON.stringify(data, null, 2));
            
            return NextResponse.json({ message: 'Track deleted successfully' }, { status: 200 });
        } catch (error) {
            console.error({
                operation: 'delete_track',
                error: 'file_deletion_error',
                details: error instanceof Error ? error.message : 'Unknown error',
                trackId,
                filename
            });
            
            // If the error is that the file doesn't exist, we should still remove the track from json
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // Remove the track from the array
                data.tracks.splice(trackIndex, 1);
                // Write back to tracks.json
                await writeFile(dataFilePath, JSON.stringify(data, null, 2));
                
                return NextResponse.json({ 
                    message: 'Track deleted from database (audio file not found)' 
                }, { status: 200 });
            }

            return NextResponse.json({ 
                error: 'Failed to delete audio file' 
            }, { status: 500 });
        }
    } catch (error) {
        console.error({
            operation: 'delete_track',
            error: 'unhandled_error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
    } finally {
        if (release) {
            try {
                await release();
            } catch (releaseError) {
                console.error({
                    operation: 'delete_track',
                    error: 'lock_release_error',
                    details: releaseError instanceof Error ? releaseError.message : 'Unknown error'
                });
            }
        }
    }
}
