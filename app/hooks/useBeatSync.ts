import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioAnalysisData } from './useAudioAnalyzer';

export interface BeatSyncData {
  // Animation intensities (0-1, smoothed for animations)
  bassIntensity: number;     // Bass-driven animations (bass thump, etc.)
  midIntensity: number;      // Mid-frequency driven animations
  trebleIntensity: number;   // High-frequency driven animations (sparkle effects)
  
  // Beat-triggered effects
  beatPulse: number;         // 0-1, spikes on beats then decays
  beatScale: number;         // 0.8-1.2, scale factor for beat scaling
  beatGlow: number;          // 0-1, glow intensity on beats
  
  // Energy-based effects
  energyLevel: number;       // 0-1, overall energy for background effects
  volumeLevel: number;       // 0-1, volume for size-based animations
  
  // Tempo-based effects  
  tempoMultiplier: number;   // Animation speed multiplier based on BPM
  isHighEnergy: boolean;     // True when song is high energy
  
  // Visual effects data
  bassBoost: number;         // 0-2, bass boost for visual effects
  trebleSparkle: number;     // 0-1, treble sparkle intensity
  midMotion: number;         // 0-1, mid-frequency motion effects
  
  // CSS custom properties object for easy application
  cssVars: {
    '--beat-intensity': string;
    '--bass-level': string;
    '--mid-level': string;
    '--treble-level': string;
    '--energy-level': string;
    '--beat-scale': string;
    '--beat-glow': string;
    '--tempo-speed': string;
  };
}

interface UseBeatSyncOptions {
  enabled?: boolean;           // Whether beat sync is enabled (default: true)
  sensitivity?: number;        // Animation sensitivity multiplier (default: 1.0)
  smoothing?: number;          // Smoothing factor for animations (default: 0.85)
  beatDecay?: number;          // How quickly beat effects decay (default: 0.92)
  energyBoost?: number;        // Energy boost multiplier (default: 1.2)
  bassBoost?: number;          // Bass boost multiplier (default: 1.5)
  trebleBoost?: number;        // Treble boost multiplier (default: 1.3)
}

const DEFAULT_OPTIONS: Required<UseBeatSyncOptions> = {
  enabled: true,
  sensitivity: 1.0,
  smoothing: 0.85,
  beatDecay: 0.92,
  energyBoost: 1.2,
  bassBoost: 1.5,
  trebleBoost: 1.3
};

export function useBeatSync(
  analysisData: AudioAnalysisData,
  isPlaying: boolean,
  options: UseBeatSyncOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [beatSyncData, setBeatSyncData] = useState<BeatSyncData>({
    bassIntensity: 0,
    midIntensity: 0,
    trebleIntensity: 0,
    beatPulse: 0,
    beatScale: 1,
    beatGlow: 0,
    energyLevel: 0,
    volumeLevel: 0,
    tempoMultiplier: 1,
    isHighEnergy: false,
    bassBoost: 0,
    trebleSparkle: 0,
    midMotion: 0,
    cssVars: {
      '--beat-intensity': '0',
      '--bass-level': '0',
      '--mid-level': '0',
      '--treble-level': '0',
      '--energy-level': '0',
      '--beat-scale': '1',
      '--beat-glow': '0',
      '--tempo-speed': '1s'
    }
  });
  
  // Previous values for smoothing
  const prevValuesRef = useRef({
    bassIntensity: 0,
    midIntensity: 0,
    trebleIntensity: 0,
    beatPulse: 0,
    beatGlow: 0,
    energyLevel: 0,
    volumeLevel: 0
  });
  
  // Beat pulse decay timer
  const beatPulseRef = useRef(0);
  const beatGlowRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  
  // Animation frame for smooth updates
  const animationFrameRef = useRef<number>();
  
  // Smooth interpolation function
  const smoothValue = (current: number, target: number, factor: number) => {
    return current + (target - current) * factor;
  };
  
  // Calculate tempo-based animation speed
  const calculateTempoMultiplier = (bpm: number) => {
    if (bpm === 0) return 1;
    
    // Normalize BPM to reasonable animation speeds
    // 60-180 BPM maps to 0.5x-2x speed
    const normalizedBPM = Math.max(60, Math.min(180, bpm));
    return 0.5 + ((normalizedBPM - 60) / 120) * 1.5;
  };
  
  // Update beat sync data
  const updateBeatSync = useCallback(() => {
    if (!opts.enabled || !isPlaying) {
      // Decay to zero when not playing
      setBeatSyncData(prev => ({
        ...prev,
        bassIntensity: smoothValue(prev.bassIntensity, 0, 0.05),
        midIntensity: smoothValue(prev.midIntensity, 0, 0.05),
        trebleIntensity: smoothValue(prev.trebleIntensity, 0, 0.05),
        beatPulse: smoothValue(prev.beatPulse, 0, 0.05),
        beatGlow: smoothValue(prev.beatGlow, 0, 0.05),
        energyLevel: smoothValue(prev.energyLevel, 0, 0.05),
        volumeLevel: smoothValue(prev.volumeLevel, 0, 0.05),
        beatScale: smoothValue(prev.beatScale, 1, 0.1),
        bassBoost: smoothValue(prev.bassBoost, 0, 0.05),
        trebleSparkle: smoothValue(prev.trebleSparkle, 0, 0.05),
        midMotion: smoothValue(prev.midMotion, 0, 0.05)
      }));
      return;
    }
    
    const prevValues = prevValuesRef.current;
    const currentTime = Date.now();
    
    // Handle beat events
    if (analysisData.isBeat) {
      beatPulseRef.current = 1.0;
      beatGlowRef.current = Math.min(1.0, analysisData.beatStrength * 0.7);
      lastBeatTimeRef.current = currentTime;
    }
    
    // Decay beat effects
    beatPulseRef.current *= opts.beatDecay;
    beatGlowRef.current *= opts.beatDecay;
    
    // Calculate base intensities with sensitivity
    const bassTarget = Math.min(1, analysisData.bass * opts.sensitivity * opts.bassBoost);
    const midTarget = Math.min(1, analysisData.mid * opts.sensitivity);
    const trebleTarget = Math.min(1, analysisData.treble * opts.sensitivity * opts.trebleBoost);
    const energyTarget = Math.min(1, analysisData.energy * opts.sensitivity * opts.energyBoost);
    const volumeTarget = Math.min(1, analysisData.volume * opts.sensitivity);
    
    // Smooth the values
    const smoothedBass = smoothValue(prevValues.bassIntensity, bassTarget, 1 - opts.smoothing);
    const smoothedMid = smoothValue(prevValues.midIntensity, midTarget, 1 - opts.smoothing);
    const smoothedTreble = smoothValue(prevValues.trebleIntensity, trebleTarget, 1 - opts.smoothing);
    const smoothedEnergy = smoothValue(prevValues.energyLevel, energyTarget, 1 - opts.smoothing);
    const smoothedVolume = smoothValue(prevValues.volumeLevel, volumeTarget, 1 - opts.smoothing);
    
    // Calculate derived values
    const tempoMultiplier = calculateTempoMultiplier(analysisData.beatTempo);
    const isHighEnergy = smoothedEnergy > 0.6;
    
    // Beat scale effect (1.0 baseline, scales with beat)
    const beatScale = 1.0 + (beatPulseRef.current * 0.15);
    
    // Calculate enhanced effects
    const bassBoost = smoothedBass * (1 + beatPulseRef.current * 0.5);
    const trebleSparkle = smoothedTreble * (1 + (Math.random() * 0.2 - 0.1)); // Add slight randomness
    const midMotion = smoothedMid * (1 + Math.sin(currentTime * 0.003) * 0.1); // Gentle wave
    
    // Update previous values
    prevValues.bassIntensity = smoothedBass;
    prevValues.midIntensity = smoothedMid;
    prevValues.trebleIntensity = smoothedTreble;
    prevValues.energyLevel = smoothedEnergy;
    prevValues.volumeLevel = smoothedVolume;
    prevValues.beatPulse = beatPulseRef.current;
    prevValues.beatGlow = beatGlowRef.current;
    
    // Create CSS variables object
    const cssVars = {
      '--beat-intensity': beatPulseRef.current.toFixed(3),
      '--bass-level': smoothedBass.toFixed(3),
      '--mid-level': smoothedMid.toFixed(3),
      '--treble-level': smoothedTreble.toFixed(3),
      '--energy-level': smoothedEnergy.toFixed(3),
      '--beat-scale': beatScale.toFixed(3),
      '--beat-glow': beatGlowRef.current.toFixed(3),
      '--tempo-speed': `${(1 / tempoMultiplier).toFixed(2)}s`
    };
    
    // Update state
    setBeatSyncData({
      bassIntensity: smoothedBass,
      midIntensity: smoothedMid,
      trebleIntensity: smoothedTreble,
      beatPulse: beatPulseRef.current,
      beatScale,
      beatGlow: beatGlowRef.current,
      energyLevel: smoothedEnergy,
      volumeLevel: smoothedVolume,
      tempoMultiplier,
      isHighEnergy,
      bassBoost,
      trebleSparkle,
      midMotion,
      cssVars
    });
  }, [opts.enabled, isPlaying, analysisData.bass, analysisData.mid, analysisData.treble, analysisData.energy, 
      analysisData.volume, analysisData.isBeat, analysisData.beatStrength, analysisData.beatTempo, 
      opts.sensitivity, opts.smoothing, opts.beatDecay, opts.energyBoost, opts.bassBoost, opts.trebleBoost]);
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateBeatSync();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    if (opts.enabled) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [opts.enabled, updateBeatSync]);
  
  // Return the beat sync data directly since it's already optimized
  return beatSyncData;
}