import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { formatSupabaseTrack } from '@/types/track';

export async function GET() {
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

    // Fetch tracks for the authenticated user
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    if (error) {
      console.error({
        operation: 'get_tracks',
        error: 'supabase_error',
        details: error
      });
      return NextResponse.json(
        { error: 'Failed to fetch tracks' },
        { status: 500 }
      );
    }

    // Format tracks for frontend compatibility
    const formattedTracks = tracks.map(formatSupabaseTrack);

    return NextResponse.json({ tracks: formattedTracks });
  } catch (error) {
    const errorDetails = {
      operation: 'get_tracks',
      error: 'unhandled_error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    console.error(errorDetails);

    return NextResponse.json(
      { error: 'Failed to load tracks', details: errorDetails.details },
      { status: 500 }
    );
  }
}
