import { z } from 'zod';

// Track schema for validating individual track objects
export const trackSchema = z.object({
  id: z.string()
    .min(1, "Track ID is required")
    .uuid("Invalid track ID format"),
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  artist: z.string()
    .min(1, "Artist is required")
    .max(100, "Artist must be less than 100 characters"),
  url: z.string()
    .url("Invalid URL format")
    .max(500, "URL must be less than 500 characters"),
  coverArt: z.string()
    .max(500, "Cover art URL must be less than 500 characters")
    .optional(),
  genre: z.string()
    .min(1, "Genre is required")
    .max(50, "Genre must be less than 50 characters")
    .optional(),
  duration: z.string()
    .regex(/^\d+:\d{2}$/, "Duration must be in format M:SS or MM:SS")
    .optional()
});

// Tracks data schema for validating the entire tracks.json file
export const tracksDataSchema = z.object({
  tracks: z.array(trackSchema)
});

// Upload request schema for validating file uploads
export const uploadRequestSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine(file => file.size <= 20 * 1024 * 1024, "File size must be less than 20MB")
    .refine(
      file => file.type.startsWith('audio/'),
      "File must be an audio file"
    ),
  genre: z.string()
    .min(1, "Genre is required")
    .max(50, "Genre must be less than 50 characters")
    .optional(),
  duration: z.string()
    .regex(/^\d+:\d{2}$/, "Duration must be in format M:SS or MM:SS")
    .optional()
    .default('0:00')
});

// Delete request schema for validating track deletion
export const deleteRequestSchema = z.object({
  trackId: z.string()
    .min(1, "Track ID is required")
    .uuid("Invalid track ID format")
});

// Custom error formatter
export const formatZodError = (error: z.ZodError) => {
  return {
    error: "Validation failed",
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
};
