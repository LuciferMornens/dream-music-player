'use client';
import { useContext, useCallback } from 'react';
import Image from 'next/image';
import { PlayerContext } from './PlayerContext';

function formatTime(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function PlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    duration, 
    currentTime, 
    seek,
    isLoading,
    error,
    volume,
    isMuted,
    adjustVolume,
    toggleMute
  } = useContext(PlayerContext);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleProgressKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 10 : 5; // Larger step with shift key
    let newTime = currentTime;

    switch (e.key) {
      case 'ArrowRight':
        newTime = Math.min(currentTime + step, duration);
        break;
      case 'ArrowLeft':
        newTime = Math.max(currentTime - step, 0);
        break;
      default:
        return;
    }

    e.preventDefault();
    seek(newTime);
  }, [currentTime, duration, seek]);

  const handleVolumeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = 0.1;
    let newVolume = volume;

    switch (e.key) {
      case 'ArrowUp':
        newVolume = Math.min(volume + step, 1);
        break;
      case 'ArrowDown':
        newVolume = Math.max(volume - step, 0);
        break;
      case 'M':
      case 'm':
        toggleMute();
        return;
      default:
        return;
    }

    e.preventDefault();
    adjustVolume(newVolume);
  }, [volume, adjustVolume, toggleMute]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formattedCurrentTime = formatTime(currentTime);
  const formattedDuration = formatTime(duration);
  const volumePercentage = Math.round(volume * 100);

  return (
    <div className="h-full w-full relative" role="region" aria-label="Audio player">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-accent-900/20 to-primary-900/20 animate-pulse opacity-30" />
      </div>

      <div className="container h-full mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-full relative z-10 gap-2 md:gap-4">
          {/* Track Info */}
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0" role="complementary" aria-label="Now playing">
            <div className="relative group">
              <Image 
                src={currentTrack.coverArt || '/images/dw.png'} 
                alt={`Album art for ${currentTrack.title}`}
                width={48}
                height={48}
                className={`w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg shadow-lg transition-all duration-300
                  ${isPlaying ? 'animate-pulse-subtle shadow-neon' : 'hover:shadow-neon'}
                `}
              />
              <div className="absolute inset-0 bg-gradient-neon opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs md:text-sm text-surface-50 hover:text-primary-400 transition-colors duration-300 truncate max-w-[120px] md:max-w-none">
                {currentTrack.title}
              </span>
              <span className="text-surface-400 text-[10px] md:text-xs hover:text-primary-400 transition-colors duration-300 truncate max-w-[120px] md:max-w-none">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Controls and Progress */}
          <div className="flex-1 flex flex-col items-center max-w-xl px-2 md:px-8">
            <div className="flex items-center justify-center w-full mb-1 md:mb-2">
              <button
                onClick={togglePlay}
                disabled={isLoading}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                aria-disabled={isLoading}
                aria-busy={isLoading}
                className={`
                  relative w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden
                  transition-all duration-300 transform hover:scale-105
                  ${isLoading ? 'cursor-wait' : 'hover:shadow-neon'}
                `}
              >
                <div className="absolute inset-0 bg-gradient-neon opacity-90" />
                <div className="relative z-10 w-full h-full flex items-center justify-center text-white">
                  {isLoading ? (
                    <svg className="w-4 h-4 md:w-6 md:h-6 animate-spin" viewBox="0 0 24 24" role="progressbar" aria-label="Loading audio">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : isPlaying ? (
                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 md:w-6 md:h-6 transform translate-x-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            <div className="w-full flex items-center space-x-2" role="group" aria-label="Playback progress">
              <span className="text-[10px] md:text-xs text-surface-400 w-8 md:w-12 text-right font-medium" aria-hidden="true">
                {formattedCurrentTime}
              </span>
              <div className="relative flex-1 h-1.5 md:h-2 group">
                <div className="absolute inset-0 rounded-full bg-surface-800 overflow-hidden">
                  {isLoading ? (
                    <div className="absolute inset-0 bg-gradient-neon animate-loading-progress opacity-50" role="progressbar" aria-label="Loading progress" />
                  ) : (
                    <>
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-neon transition-all duration-150"
                        style={{ width: `${progress}%` }}
                        role="presentation"
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-surface-950 rounded-full shadow-neon
                          transform scale-0 group-hover:scale-100 transition-transform duration-150"
                        style={{ left: `calc(${progress}% - 6px)` }}
                        role="presentation"
                      >
                        <div className="absolute inset-1 bg-gradient-neon rounded-full" />
                      </div>
                    </>
                  )}
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleProgressChange}
                  onKeyDown={handleProgressKeyDown}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                  style={{ touchAction: 'none' }}
                  disabled={isLoading}
                  aria-label="Seek"
                  aria-valuemin={0}
                  aria-valuemax={duration || 0}
                  aria-valuenow={currentTime}
                  aria-valuetext={`${formattedCurrentTime} of ${formattedDuration}`}
                />
              </div>
              <span className="text-[10px] md:text-xs text-surface-400 w-8 md:w-12 font-medium" aria-hidden="true">
                {formattedDuration}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {error && (
              <span 
                role="alert" 
                aria-live="assertive" 
                className="text-accent-400 text-sm animate-pulse mr-4"
              >
                {error.message}
              </span>
            )}
            <div className="flex items-center space-x-2 group" role="group" aria-label="Volume controls">
              <button
                onClick={toggleMute}
                className="text-surface-400 hover:text-primary-400 transition-colors duration-300"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                aria-pressed={isMuted}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : volume > 0.5 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : volume > 0 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM15.536 8.464a5 5 0 010 7.072" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <div className="w-24 relative group">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                  onKeyDown={handleVolumeKeyDown}
                  className="w-full h-1.5 rounded-full bg-surface-800 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-neon
                    [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-neon
                    [&::-moz-range-thumb]:shadow-neon [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-track]:bg-surface-800 [&::-moz-range-track]:rounded-full
                    hover:shadow-neon transition-shadow duration-300"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={volume}
                  aria-valuetext={`Volume ${volumePercentage}%`}
                />
                <div 
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-surface-800 text-surface-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 rounded-md"
                  role="tooltip"
                  aria-hidden="true"
                >
                  {volumePercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
