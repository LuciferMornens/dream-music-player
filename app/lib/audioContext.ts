// Singleton AudioContext manager with proper TypeScript types
class AudioContextManager {
  private static instance: AudioContextManager | null = null;
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sources: Map<HTMLAudioElement, MediaElementAudioSourceNode> = new Map();

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.context) return;

    // Properly type and create AudioContext
    const AudioContextClass = window.AudioContext || 
      ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    
    this.context = new AudioContextClass();
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    
    // Set initial volume
    this.setVolume(0.7);
  }

  async connectAudioElement(audio: HTMLAudioElement): Promise<void> {
    if (!this.context || !this.gainNode) {
      await this.initialize();
    }

    if (!this.context || !this.gainNode) {
      throw new Error('Failed to initialize audio context');
    }

    // Remove existing source if any
    this.disconnectAudioElement(audio);

    // Create and connect new source
    const source = this.context.createMediaElementSource(audio);
    source.connect(this.gainNode);
    this.sources.set(audio, source);
  }

  disconnectAudioElement(audio: HTMLAudioElement): void {
    const source = this.sources.get(audio);
    if (source) {
      source.disconnect();
      this.sources.delete(audio);
    }
  }

  setVolume(value: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  getState(): string {
    return this.context?.state || 'uninitialized';
  }
}

export const audioContextManager = AudioContextManager.getInstance();
