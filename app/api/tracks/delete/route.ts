import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { deleteAudioFile } from '@/lib/supabase/storage';
import { deleteRequestSchema, formatZodError } from '../../../lib/validations';

export async function DELETE(request: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient<Database>({ 
            cookies: () => cookieStore 
        });

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

        // Find the track and verify ownership
        const { data: track, error: trackError } = await supabase
            .from('tracks')
            .select('*')
            .eq('id', trackId)
            .eq('user_id', user.id)
            .single();

        if (trackError || !track) {
            return NextResponse.json(
                { error: 'Track not found or unauthorized' },
                { status: 404 }
            );
        }

        // Delete the audio file from Supabase Storage
        const storageDeleted = await deleteAudioFile(track.file_path);
        if (!storageDeleted) {
            console.warn({
                operation: 'delete_track',
                warning: 'storage_delete_failed',
                trackId,
                filePath: track.file_path
            });
        }

        // Delete the track from database
        const { error: deleteError } = await supabase
            .from('tracks')
            .delete()
            .eq('id', trackId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error({
                operation: 'delete_track',
                error: 'database_delete_error',
                details: deleteError,
                trackId
            });
            return NextResponse.json(
                { error: 'Failed to delete track from database' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Track deleted successfully' 
        }, { status: 200 });

    } catch (error) {
        console.error({
            operation: 'delete_track',
            error: 'unhandled_error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json({ 
            error: 'Failed to delete track' 
        }, { status: 500 });
    }
}
