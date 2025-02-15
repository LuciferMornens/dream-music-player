'use client';
import { useContext, useCallback } from 'react';
import Image from 'next/image';
import { PlayerContext } from './PlayerContext';
import { Track } from '../types/track';

export default function TrackCard({ id, title, artist, coverArt = '/images/dw.png', url, genre, duration: trackDuration }: Track) {
  const { playTrack, currentTrack, isPlaying, showDeleteConfirmation, currentTime, duration: playbackDuration, seek } = useContext(PlayerContext);
  const isCurrentTrack = currentTrack?.id === id;

  const handlePlay = () => {
    // If this track is currently playing, do nothing
    if (isCurrentTrack && isPlaying) return;
    
    playTrack({ id, title, artist, url, coverArt, genre, duration: trackDuration });
  };

  const handleDelete = () => {
    showDeleteConfirmation({ id, title, artist, url, coverArt, genre, duration: trackDuration });
  };

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = playbackDuration * percentage;
    seek(newTime);
  }, [playbackDuration, seek]);

  const handleProgressKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5; // Larger step with shift key
    let newTime = currentTime;

    switch (e.key) {
      case 'ArrowRight':
        newTime = Math.min(currentTime + step, playbackDuration);
        break;
      case 'ArrowLeft':
        newTime = Math.max(currentTime - step, 0);
        break;
      default:
        return;
    }

    e.preventDefault();
    seek(newTime);
  }, [currentTime, playbackDuration, seek]);

  return (
    <div 
      className={`
        glass relative overflow-hidden group
        ${isCurrentTrack 
          ? 'ring-2 ring-primary-500 ring-offset-4 ring-offset-surface-950' 
          : 'hover:ring-1 hover:ring-primary-500/50 hover:ring-offset-2 hover:ring-offset-surface-950'
        }
        rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1
      `}
      role="article"
      aria-label={`Track: ${title} by ${artist}`}
    >
      <div className="relative p-3 md:p-4 flex items-center gap-3 md:gap-4">
        {/* Cover Art */}
        <div className="relative">
          <Image 
            src={coverArt}
            alt={`Album art for ${title}`}
            width={64}
            height={64}
            className={`
              w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg shadow-lg transition-all duration-500
              ${isCurrentTrack && isPlaying ? 'shadow-neon animate-pulse-subtle' : 'group-hover:shadow-neon'}
            `}
          />
          
          {/* Play overlay */}
          <div 
            className={`
              absolute inset-0 bg-surface-900/0 rounded-lg
              flex items-center justify-center
              transition-all duration-300
              ${isCurrentTrack && isPlaying 
                ? 'bg-surface-900/40' 
                : 'group-hover:bg-surface-900/40'
              }
            `}
            aria-hidden="true"
          >
            <span className={`
              text-white transform transition-all duration-300
              ${isCurrentTrack && isPlaying
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
              }
            `}>
              {isCurrentTrack && isPlaying ? '▶️' : '▶'}
            </span>
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base md:text-lg text-surface-50 truncate group-hover:text-primary-400 transition-colors duration-300">
            {title}
          </h3>
          <div className="flex flex-col space-y-0.5 md:space-y-1">
            <p className="text-xs md:text-sm text-surface-400 truncate group-hover:text-surface-300 transition-colors duration-300">
              {artist}
            </p>
            <div 
              className="hidden md:flex items-center space-x-2 text-xs text-surface-500"
              role="list"
              aria-label="Track details"
            >
              {genre && (
                <span role="listitem">
                  Genre: {genre}
                </span>
              )}
              {trackDuration && (
                <>
                  <span aria-hidden="true">•</span>
                  <span role="listitem">
                    Duration: {trackDuration}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2" role="group" aria-label="Track controls">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className={`
              relative overflow-hidden rounded-full px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base
              transition-all duration-300 transform hover:scale-105
              ${isCurrentTrack 
                ? 'bg-gradient-neon text-white shadow-neon' 
                : 'bg-surface-800 text-surface-300 hover:text-white hover:shadow-neon'
              }
            `}
            aria-label={isCurrentTrack && isPlaying ? `Now playing: ${title}` : `Play ${title}`}
            aria-pressed={isCurrentTrack && isPlaying}
          >
            <span className="relative z-10">
              {isCurrentTrack && isPlaying ? 'Playing' : 'Play'}
            </span>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="relative overflow-hidden rounded-full p-2 text-sm bg-red-900/50 text-red-400 hover:bg-red-900 hover:text-red-300 transition-all duration-300 transform hover:scale-105"
            aria-label={`Delete ${title}`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar for current track */}
      {isCurrentTrack && (
        <div 
          className="h-0.5 w-full bg-surface-800 cursor-pointer relative"
          onClick={handleProgressClick}
          onKeyDown={handleProgressKeyDown}
          role="slider"
          aria-label="Track progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={playbackDuration > 0 ? Math.round((currentTime / playbackDuration) * 100) : 0}
          aria-valuetext={`${Math.round((currentTime / playbackDuration) * 100)}% complete`}
          tabIndex={0}
        >
          <div 
            className="h-full bg-gradient-neon transition-all duration-200" 
            style={{ 
              width: `${playbackDuration > 0 ? (currentTime / playbackDuration) * 100 : 0}%` 
            }}
            role="presentation"
          />
        </div>
      )}
    </div>
  );
}
