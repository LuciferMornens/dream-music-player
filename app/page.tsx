'use client';
import { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import TrackCard from './components/TrackCard';
import { PlayerContext } from './components/PlayerContext';
import PageTransition from './components/PageTransition';
import UploadTrack from './components/UploadTrack';
import { useAuth } from './hooks/useAuth';
import { useTracks } from './hooks/useTracks';

export default function HomePage() {
  const context = useContext(PlayerContext);
  const { playTrack, showNotification } = context;
  const { user, loading: authLoading } = useAuth();
  const { tracks, loading: tracksLoading, error: tracksError, addTracks } = useTracks();
  
  const [genres, setGenres] = useState<string[]>(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the component after context is ready
  useEffect(() => {
    if (Object.keys(context).length > 0) {
      setIsInitialized(true);
    }
  }, [context]);

  // Update genres based on available tracks
  useEffect(() => {
    if (tracks.length > 0) {
      const uniqueGenres = ['All', ...new Set(tracks.map(track => track.genre || 'Unknown').filter(Boolean))];
      setGenres(uniqueGenres);
    }
  }, [tracks]);

  // Show error notification if tracks fail to load
  useEffect(() => {
    if (tracksError) {
      showNotification(`Failed to load tracks: ${tracksError}`);
    }
  }, [tracksError, showNotification]);

  // Filter tracks based on selected genre
  const filteredTracks = tracks.filter(track =>
    selectedGenre === 'All' || track.genre === selectedGenre
  );

  const isLoading = authLoading || tracksLoading || !isInitialized;

  // Don't render anything until context is initialized
  if (!isInitialized) {
    return null;
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Loading your music library...</p>
        </div>
      </div>
    );
  }

  // Redirect will be handled by middleware, but show a message just in case
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-400 mb-4">Please sign in to access your music library.</p>
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="relative min-h-screen beat-bg">
        {/* Beat-Responsive Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Primary gradient orb - bass responsive */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-3xl animate-float bass-reactive"
               style={{ animationDelay: '0s' }} />
          {/* Accent gradient orb - treble responsive */}
          <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-accent-500/10 rounded-full blur-3xl animate-float treble-sparkle"
               style={{ animationDelay: '-3s' }} />
          {/* Additional ambient effects - mid responsive */}
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-surface-500/5 rounded-full blur-3xl animate-float mid-sway"
               style={{ animationDelay: '-1.5s' }} />
          <div className="absolute bottom-1/3 right-1/2 w-48 h-48 bg-primary-600/5 rounded-full blur-3xl animate-float beat-responsive"
               style={{ animationDelay: '-4.5s' }} />
          {/* Beat pulse background overlay */}
          <div className="absolute inset-0 beat-pulse-bg" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Enhanced Hero Section */}
          <div className="text-center py-12 md:py-16 animate-fade-in-up">
            <UploadTrack onUploadComplete={(newTracks) => {
              addTracks(newTracks);
              if (newTracks.length > 0) {
                showNotification('Library updated with new tracks!');
              }
            }} />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 relative inline-block px-4 md:px-0">
              <span className="elegant-text music-pulse text-beat-glow">Discover Your Sound</span>
              {/* Decorative underline */}
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-ocean rounded-full transform scale-x-0 animate-scale-up" 
                   style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }} />
            </h1>
            <p className="text-surface-400 text-base md:text-lg max-w-2xl mx-auto mt-4 md:mt-6 animate-fade-in-up px-4" 
               style={{ animationDelay: '0.3s' }}>
              Immerse yourself in a world of beautiful melodies and captivating rhythms
            </p>
          </div>

          {/* Featured Track */}
          {!isLoading && filteredTracks.length > 0 && (
            <div className="mb-12 md:mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-xl md:text-2xl font-semibold text-surface-50 mb-4 md:mb-6 ocean-text px-2 md:px-0">
                {selectedGenre === 'All' ? 'Featured Track' : `Featured ${selectedGenre} Track`}
              </h2>
              <div className="glass-elegant rounded-xl p-4 md:p-6 elegant-card group ocean-border shimmer-effect track-card-beat">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  <div className="w-full sm:w-2/3 md:w-1/3 aspect-square rounded-xl overflow-hidden relative group">
                    <Image
                      src={filteredTracks[0].coverArt || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
                      alt="Featured Track"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-surface-50 mb-3 md:mb-4 shimmer-text">
                      {filteredTracks[0].title}
                    </h3>
                    <p className="text-surface-400 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                      A beautiful melody that captures the essence of dreams, weaving together ethereal sounds
                      and rhythmic patterns that transport you to another world.
                    </p>
                    <button
                      onClick={() => playTrack(filteredTracks[0])}
                      className="btn-ocean px-6 md:px-8 py-2.5 md:py-3 rounded-full bass-thump beat-glow
                        relative overflow-hidden group/btn"
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Play Featured Track
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Genre Filter */}
          {!isLoading && tracks.length > 0 && (
            <div className="mb-8 md:mb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-2 md:px-0">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full glass
                              transition-all duration-300 hover:transform hover:-translate-y-1 text-sm md:text-base
                              ${genre === selectedGenre ? 'ring-2 ring-primary-500 text-primary-400' : 'hover:ring-2 ring-primary-500/50'}`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Track List with Grid Layout */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <h2 className="text-xl md:text-2xl font-semibold treasure-text mb-4 md:mb-6 px-2 md:px-0">
              {selectedGenre === 'All' ? 'All Tracks' : `${selectedGenre} Tracks`}
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-surface-400">No tracks available. Upload some music to get started!</p>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-surface-400">No tracks found in the {selectedGenre} genre.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredTracks.map(track => (
                  <TrackCard
                    key={track.id}
                    id={track.id}
                    title={track.title}
                    artist={track.artist}
                    url={track.url}
                    coverArt={track.coverArt}
                    genre={track.genre}
                    duration={track.duration}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats Section */}
          {!isLoading && (
            <div className="my-12 md:my-16 animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
              <div className="glass-elegant rounded-xl p-6 md:p-8 ocean-border track-card-beat">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold ocean-text text-beat-glow mb-2 tempo-pulse">
                      {selectedGenre === 'All' ? tracks.length : filteredTracks.length}
                    </div>
                    <div className="text-surface-400 text-sm md:text-base">
                      {selectedGenre === 'All'
                        ? `${tracks.length === 1 ? 'Track' : 'Tracks'} Available`
                        : `${selectedGenre} ${filteredTracks.length === 1 ? 'Track' : 'Tracks'}`
                      }
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold treasure-text text-beat-glow mb-2 tempo-bounce">
                      Free
                    </div>
                    <div className="text-surface-400 text-sm md:text-base">Current Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold shimmer-text text-beat-glow mb-2 tempo-sway">24/7</div>
                    <div className="text-surface-400 text-sm md:text-base">Music Access</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="mb-12 md:mb-16 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <div className="glass-elegant rounded-xl p-6 md:p-8 text-center relative overflow-hidden group elegant-card ocean-border">
              {/* Background animation */}
              <div className="absolute inset-0 bg-gradient-depth opacity-0 group-hover:opacity-15 transition-opacity duration-700" />
              <div className="shimmer-effect absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              
              <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                <span className="elegant-text">More Coming Soon</span>
              </h2>
              <p className="text-surface-400 max-w-2xl mx-auto text-sm md:text-base">
                Stay tuned for new tracks and features.
              </p>
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-ocean rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-700" />
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-treasure rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-700" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-shimmer rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
