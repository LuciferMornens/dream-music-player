import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioAnalysisData {
  // Frequency data
  bass: number;        // 0-1, bass frequency level
  mid: number;         // 0-1, mid frequency level  
  treble: number;      // 0-1, treble frequency level
  
  // Beat detection
  beatStrength: number; // 0-1, overall beat intensity
  isBeat: boolean;     // true when beat is detected
  beatTempo: number;   // BPM estimate
  
  // Visual data
  frequencyData: Uint8Array; // Full frequency spectrum for visualizations
  waveformData: Uint8Array;  // Waveform data
  
  // Overall metrics
  volume: number;      // 0-1, overall volume level
  energy: number;      // 0-1, overall energy level
}

interface UseAudioAnalyzerOptions {
  fftSize?: number;           // FFT size for frequency analysis (default: 2048)
  smoothingTimeConstant?: number; // Smoothing for frequency data (default: 0.8)
  beatThreshold?: number;     // Threshold for beat detection (default: 1.3)
  beatDecayRate?: number;     // How quickly beat detection decays (default: 0.95)
  enabled?: boolean;          // Whether analysis is enabled (default: true)
}

const DEFAULT_OPTIONS: Required<UseAudioAnalyzerOptions> = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  beatThreshold: 1.3,
  beatDecayRate: 0.95,
  enabled: true
};

export function useAudioAnalyzer(
  audioElement: HTMLAudioElement | null,
  options: UseAudioAnalyzerOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [analysisData, setAnalysisData] = useState<AudioAnalysisData>({
    bass: 0,
    mid: 0,
    treble: 0,
    beatStrength: 0,
    isBeat: false,
    beatTempo: 0,
    frequencyData: new Uint8Array(0),
    waveformData: new Uint8Array(0),
    volume: 0,
    energy: 0
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Audio analysis refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Beat detection refs
  const beatHistoryRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef<number>(0);
  const energyHistoryRef = useRef<number[]>([]);
  const tempoHistoryRef = useRef<number[]>([]);
  
  // Analysis buffers
  const frequencyBufferRef = useRef<Uint8Array>();
  const waveformBufferRef = useRef<Uint8Array>();
  
  // Initialize audio context and analyser
  const initializeAnalyzer = useCallback(async () => {
    if (!audioElement || !opts.enabled) return;
    
    try {
      // Create or resume audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || 
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = opts.fftSize;
      analyser.smoothingTimeConstant = opts.smoothingTimeConstant;
      
      // Create source if it doesn't exist
      if (!sourceRef.current) {
        const source = audioContext.createMediaElementSource(audioElement);
        sourceRef.current = source;
        
        // Connect the audio pipeline: source -> analyser -> destination
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      
      analyserRef.current = analyser;
      
      // Initialize buffers
      const bufferLength = analyser.frequencyBinCount;
      frequencyBufferRef.current = new Uint8Array(bufferLength);
      waveformBufferRef.current = new Uint8Array(bufferLength);
      
      setIsAnalyzing(true);
      
    } catch (error) {
      console.error('Error initializing audio analyzer:', error);
      setIsAnalyzing(false);
    }
  }, [audioElement, opts.enabled, opts.fftSize, opts.smoothingTimeConstant]);
  
  // Calculate frequency band values (bass, mid, treble)
  const calculateFrequencyBands = useCallback((frequencyData: Uint8Array) => {
    const dataLength = frequencyData.length;
    
    // Frequency ranges (approximated)
    const bassEnd = Math.floor(dataLength * 0.1);      // ~0-200Hz
    const midEnd = Math.floor(dataLength * 0.4);       // ~200-2kHz  
    const trebleStart = Math.floor(dataLength * 0.4);  // ~2kHz+
    
    // Calculate averages for each band
    let bassSum = 0, midSum = 0, trebleSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += frequencyData[i];
    }
    
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += frequencyData[i];
    }
    
    for (let i = trebleStart; i < dataLength; i++) {
      trebleSum += frequencyData[i];
    }
    
    return {
      bass: (bassSum / bassEnd) / 255,
      mid: (midSum / (midEnd - bassEnd)) / 255,
      treble: (trebleSum / (dataLength - trebleStart)) / 255
    };
  }, []);
  
  // Beat detection algorithm
  const detectBeat = useCallback((energy: number, currentTime: number) => {
    const history = energyHistoryRef.current;
    history.push(energy);
    
    // Keep only recent history (about 1 second worth)
    if (history.length > 60) {
      history.shift();
    }
    
    // Calculate average energy over recent history
    const avgEnergy = history.reduce((sum, val) => sum + val, 0) / history.length;
    
    // Beat is detected when current energy significantly exceeds recent average
    const beatStrength = avgEnergy > 0 ? energy / avgEnergy : 0;
    const isBeat = beatStrength > opts.beatThreshold && 
                   (currentTime - lastBeatTimeRef.current) > 200; // Min 200ms between beats
    
    if (isBeat) {
      lastBeatTimeRef.current = currentTime;
      
      // Update tempo history
      const beatHistory = beatHistoryRef.current;
      beatHistory.push(currentTime);
      
      // Keep only recent beats (last 10 seconds)
      const tenSecondsAgo = currentTime - 10000;
      const recentBeats = beatHistory.filter(time => time > tenSecondsAgo);
      beatHistoryRef.current = recentBeats;
      
      // Calculate BPM from recent beats
      if (recentBeats.length > 1) {
        const intervals = [];
        for (let i = 1; i < recentBeats.length; i++) {
          intervals.push(recentBeats[i] - recentBeats[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const bpm = 60000 / avgInterval; // Convert ms to BPM
        
        tempoHistoryRef.current.push(bpm);
        if (tempoHistoryRef.current.length > 10) {
          tempoHistoryRef.current.shift();
        }
      }
    }
    
    // Calculate average tempo from recent history
    const tempoHistory = tempoHistoryRef.current;
    const avgTempo = tempoHistory.length > 0 
      ? tempoHistory.reduce((sum, val) => sum + val, 0) / tempoHistory.length 
      : 0;
    
    return {
      beatStrength: Math.min(beatStrength, 2), // Cap at 2x
      isBeat,
      beatTempo: Math.round(avgTempo)
    };
  }, [opts.beatThreshold]);
  
  // Main analysis loop
  const analyze = useCallback(() => {
    if (!analyserRef.current || !frequencyBufferRef.current || !waveformBufferRef.current) {
      return;
    }
    
    const analyser = analyserRef.current;
    const frequencyData = frequencyBufferRef.current;
    const waveformData = waveformBufferRef.current;
    
    // Get frequency and waveform data
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(waveformData);
    
    // Calculate frequency bands
    const bands = calculateFrequencyBands(frequencyData);
    
    // Calculate overall volume and energy
    let volumeSum = 0;
    let energySum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const value = frequencyData[i] / 255;
      volumeSum += value;
      energySum += value * value; // Energy is sum of squares
    }
    
    const volume = volumeSum / frequencyData.length;
    const energy = Math.sqrt(energySum / frequencyData.length);
    
    // Beat detection
    const currentTime = Date.now();
    const beatData = detectBeat(energy, currentTime);
    
    // Update analysis data
    setAnalysisData({
      bass: bands.bass,
      mid: bands.mid,
      treble: bands.treble,
      beatStrength: beatData.beatStrength,
      isBeat: beatData.isBeat,
      beatTempo: beatData.beatTempo,
      frequencyData: new Uint8Array(frequencyData),
      waveformData: new Uint8Array(waveformData),
      volume,
      energy
    });
    
    // Schedule next frame
    if (isAnalyzing) {
      animationFrameRef.current = requestAnimationFrame(analyze);
    }
  }, [isAnalyzing, calculateFrequencyBands, detectBeat]);
  
  // Start/stop analysis
  useEffect(() => {
    if (isAnalyzing && opts.enabled) {
      analyze();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, analyze, opts.enabled]);
  
  // Initialize when audio element is available
  useEffect(() => {
    if (audioElement && opts.enabled) {
      initializeAnalyzer();
    } else {
      setIsAnalyzing(false);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsAnalyzing(false);
    };
  }, [audioElement, initializeAnalyzer, opts.enabled]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Note: We don't disconnect the audio source here because it's shared
      // The audio element will handle its own cleanup
    };
  }, []);
  
  return {
    analysisData,
    isAnalyzing
  };
}