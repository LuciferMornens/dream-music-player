import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import { tracksDataSchema, formatZodError } from '../../lib/validations';

export async function GET() {
  try {
    const tracksPath = path.join(process.cwd(), 'app', 'data', 'tracks.json');
    const tracksData = await readFile(tracksPath, 'utf-8');
    const tracks = JSON.parse(tracksData);

    // Validate the tracks data structure
    const validationResult = tracksDataSchema.safeParse(tracks);
    if (!validationResult.success) {
      console.error({
        operation: 'get_tracks',
        error: 'invalid_tracks_data',
        details: validationResult.error
      });
      return NextResponse.json(
        formatZodError(validationResult.error),
        { status: 400 }
      );
    }

    return NextResponse.json(validationResult.data);
  } catch (error) {
    const errorDetails = {
      operation: 'get_tracks',
      error: error instanceof SyntaxError ? 'invalid_json' : 'unhandled_error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    console.error(errorDetails);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format in tracks data' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to load tracks', details: errorDetails.details },
      { status: 500 }
    );
  }
}
