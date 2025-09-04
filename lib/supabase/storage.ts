import { supabase } from './client'

export const AUDIO_BUCKET = 'audio-files'

// Upload audio file to Supabase Storage
export async function uploadAudioFile(
  file: File,
  userId: string,
  filename: string
): Promise<{ url: string; path: string } | null> {
  try {
    const filePath = `${userId}/${filename}`
    
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

// Delete audio file from Supabase Storage
export async function deleteAudioFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Get signed URL for audio file (for private access)
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
}

// Get file info
export async function getFileInfo(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      })

    if (error) {
      console.error('File info error:', error)
      return null
    }

    return data[0] || null
  } catch (error) {
    console.error('Error getting file info:', error)
    return null
  }
}