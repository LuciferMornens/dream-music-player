'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-float" 
             style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 -right-10 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl animate-float" 
             style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative z-10">
        {/* Main loading animation */}
        <div className="relative w-32 h-32 mx-auto mb-12">
          {/* Rotating gradient border */}
          <div className="absolute inset-0 rounded-full bg-gradient-neon animate-rotate-gradient opacity-50" />
          
          {/* Pulsing inner circle */}
          <div className="absolute inset-2 rounded-full bg-surface-950 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-cosmic animate-pulse-subtle flex items-center justify-center">
              <span className="text-4xl animate-bounce-subtle neon-text">♪</span>
            </div>
          </div>

          {/* Orbiting dots */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary-400"
              style={{
                animation: 'orbit 2s linear infinite',
                animationDelay: `${-i * 0.3}s`,
                transformOrigin: '50% 50%',
              }}
            />
          ))}
        </div>

        {/* Text and progress indicators */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold cosmic-text animate-glow">
            Loading Your Experience
          </h2>
          
          {/* Audio wave animation */}
          <div className="loading-wave">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  width: '4px'
                }}
              />
            ))}
          </div>

          {/* Glowing progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="progress-bar">
              <div className="progress-bar-fill w-2/3" />
              <div className="progress-bar-glow" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating music notes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-primary-400/30 animate-float"
          style={{
            fontSize: `${Math.random() * 20 + 10}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `-${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 4}s`
          }}
        >
          ♪
        </div>
      ))}

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(48px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(48px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
