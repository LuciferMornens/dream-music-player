'use client';
import { useState, useCallback, useContext, ReactElement } from 'react';
import { PlayerContext } from './PlayerContext';
import { Track } from '../types/track';
import GenreConfirmation from './GenreConfirmation';

interface UploadTrackProps {
  onUploadComplete: (tracks: Track[]) => void;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getAudioDuration(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(formatDuration(audio.duration));
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load audio file'));
    });

    audio.src = objectUrl;
  });
}

export default function UploadTrack({ onUploadComplete }: UploadTrackProps): ReactElement {
  type UploadState = 'idle' | 'dragging' | 'genre_confirmation' | 'genre_input' | 'uploading';
  
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [genre, setGenre] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const { showNotification } = useContext(PlayerContext);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('dragging');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('idle');
  }, []);

  const processUpload = useCallback(async (files: File[], uploadGenre: string) => {
    if (uploadState === 'uploading') return;
    
    setUploadState('uploading');
    setUploadProgress({ current: 0, total: files.length });
    showNotification('Processing audio file(s)...');

    try {
      let uploadedCount = 0;
      const totalFiles = files.length;

      for (const file of files) {
        showNotification(`Processing track ${uploadedCount + 1} of ${totalFiles}...`);
        
        // Get audio duration before uploading
        let duration;
        try {
          duration = await getAudioDuration(file);
        } catch (error) {
          console.error('Error getting audio duration:', error);
          duration = '0:00'; // Fallback if duration calculation fails
        }

        showNotification(`Uploading track ${uploadedCount + 1} of ${totalFiles}...`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('genre', uploadGenre || 'Uncategorized');
        formData.append('duration', duration); // Send duration to server

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Upload failed');
        }

        // Upload successful
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        uploadedCount++;
        showNotification(`Track ${uploadedCount} of ${totalFiles} uploaded successfully!`);
        
        // Update tracks list with the latest data
        if (data.tracks) {
          onUploadComplete(data.tracks);
        }
        
        // Wait between uploads
        if (uploadedCount < totalFiles) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // All uploads completed
      if (uploadedCount > 0) {
        showNotification(`Successfully uploaded ${uploadedCount} track${uploadedCount > 1 ? 's' : ''}!`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Clear genre after successful upload
        setGenre('');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to upload file(s)');
    } finally {
      setUploadState('idle');
      setPendingFiles([]);
      setUploadProgress({ current: 0, total: 0 });
    }
  }, [onUploadComplete, showNotification, uploadState]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (uploadState === 'uploading') return;
    
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      showNotification('Please upload audio files only');
      return;
    }

    // If no genre is set, show confirmation dialog
    if (!genre.trim()) {
      setPendingFiles(audioFiles);
      setUploadState('genre_confirmation');
      return;
    }

    await processUpload(audioFiles, genre);
  }, [genre, processUpload, showNotification, uploadState]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('idle');

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  }, [handleFiles]);

  const handleGenreSkip = useCallback(async () => {
    setUploadState('idle');
    if (pendingFiles.length > 0) {
      await processUpload(pendingFiles, 'Uncategorized');
    }
  }, [pendingFiles, processUpload]);

  const handleGenreSubmit = useCallback(async () => {
    if (pendingFiles.length > 0 && genre.trim()) {
      await processUpload(pendingFiles, genre);
    }
  }, [genre, pendingFiles, processUpload]);

  const handleGenreConfirm = useCallback(() => {
    setUploadState('genre_input');
    // Focus the genre input
    document.getElementById('genre')?.focus();
  }, []);

  const handleGenreKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && uploadState === 'genre_input') {
      handleGenreSubmit();
    }
  }, [handleGenreSubmit, uploadState]);

  return (
    <>
      <div className={`
        glass rounded-xl p-6 mb-8
        ${uploadState === 'dragging' ? 'ring-2 ring-primary-500' : ''}
        ${uploadState === 'uploading' ? 'opacity-50 pointer-events-none' : ''}
      `}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg
            p-8 text-center cursor-pointer
            transition-all duration-300
            ${uploadState === 'dragging'
              ? 'border-primary-500 bg-surface-900/50 scale-105'
              : uploadState === 'uploading'
                ? 'border-accent-500 bg-surface-900/30'
                : 'border-surface-700 hover:border-surface-600 hover:scale-[1.02]'
            }
          `}
        >
          {/* Loading spinner */}
          {uploadState === 'uploading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-950/50 rounded-lg">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            multiple
          />
          <div className="flex flex-col items-center space-y-4">
            <label htmlFor="file-upload" className="cursor-pointer flex-1 w-full">
              {/* Upload icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${uploadState === 'dragging'
                  ? 'bg-primary-500/20 text-primary-400'
                  : uploadState === 'uploading'
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'bg-surface-800/50 text-surface-400'
                }
              `}>
                <svg
                className={`w-6 h-6 transition-transform duration-300 ${uploadState === 'dragging' ? 'scale-110' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 11v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Upload text */}
              <div className="text-surface-400">
                {uploadState === 'uploading' ? (
                  <span className="animate-pulse">
                    Uploading track {uploadProgress.current + 1} of {uploadProgress.total}...
                  </span>
                ) : uploadState === 'dragging' ? (
                  <span className="text-primary-400">Drop it here!</span>
                ) : (
                  <>
                    <span className="text-primary-500">Drop audio files here</span>
                    <span className="mx-2">or</span>
                    <span className="text-primary-500 hover:text-primary-400">click to upload</span>
                  </>
                )}
              </div>

              {/* File format info */}
              <p className="text-surface-500 text-sm">
                Supported formats: MP3, WAV, OGG
              </p>

              {/* Additional info */}
              <p className="text-surface-600 text-xs mb-4">
                Your track will be automatically added to the library
              </p>

            </label>

            {/* Genre Input - Outside the file upload label */}
            {uploadState === 'genre_input' && (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <label htmlFor="genre" className="text-surface-400 text-sm">
                    Genre:
                  </label>
                  <input
                    type="text"
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    onKeyPress={handleGenreKeyPress}
                    placeholder="Enter genre"
                    className="bg-surface-800 text-surface-200 rounded px-2 py-1 text-sm border border-surface-700 focus:border-primary-500 focus:outline-none"
                  />
                  <button
                    onClick={handleGenreSubmit}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-500 transition-colors duration-200"
                  >
                    Upload
                  </button>
                </div>
                <p className="text-surface-400 text-xs">
                  Press Enter or click Upload when ready
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Genre Confirmation Dialog */}
      {uploadState === 'genre_confirmation' && (
        <GenreConfirmation
          onConfirm={handleGenreConfirm}
          onCancel={handleGenreSkip}
        />
      )}
    </>
  );
}