import { useState, useEffect, useRef, useCallback } from "react";

export const useAudioEngine = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const audioContextRef = useRef(null);

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100,
        latencyHint: "interactive"
      });
      
      if (context.state === "suspended") {
        await context.resume();
      }
      
      audioContextRef.current = context;
      setAudioContext(context);
      setIsInitialized(true);
      setError(null);
      
      return context;
    } catch (err) {
      setError(`Failed to initialize audio: ${err.message}`);
      return null;
    }
  }, []);

  // Get user media for recording
  const getUserMedia = useCallback(async (constraints = { audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 44100,
          ...constraints.audio
        }
      });
      return stream;
    } catch (err) {
      setError(`Microphone access denied: ${err.message}`);
      throw err;
    }
  }, []);

  // Create audio buffer from array buffer
  const createAudioBuffer = useCallback(async (arrayBuffer) => {
    if (!audioContext) return null;
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (err) {
      setError(`Failed to decode audio: ${err.message}`);
      return null;
    }
  }, [audioContext]);

  // Create audio source from buffer
  const createBufferSource = useCallback((audioBuffer) => {
    if (!audioContext || !audioBuffer) return null;
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    return source;
  }, [audioContext]);

  // Create analyzer node for visualization
  const createAnalyzer = useCallback((fftSize = 2048) => {
    if (!audioContext) return null;
    
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = fftSize;
    analyzer.smoothingTimeConstant = 0.8;
    return analyzer;
  }, [audioContext]);

  // Create gain node
  const createGain = useCallback((initialValue = 1) => {
    if (!audioContext) return null;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = initialValue;
    return gainNode;
  }, [audioContext]);

  // Create biquad filter
  const createFilter = useCallback((type = "lowpass", frequency = 1000, Q = 1) => {
    if (!audioContext) return null;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    return filter;
  }, [audioContext]);

  // Create compressor
  const createCompressor = useCallback((settings = {}) => {
    if (!audioContext) return null;
    
    const compressor = audioContext.createDynamicsCompressor();
    
    if (settings.threshold !== undefined) {
      compressor.threshold.value = settings.threshold;
    }
    if (settings.knee !== undefined) {
      compressor.knee.value = settings.knee;
    }
    if (settings.ratio !== undefined) {
      compressor.ratio.value = settings.ratio;
    }
    if (settings.attack !== undefined) {
      compressor.attack.value = settings.attack;
    }
    if (settings.release !== undefined) {
      compressor.release.value = settings.release;
    }
    
    return compressor;
  }, [audioContext]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setAudioContext(null);
    setIsInitialized(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAudioContext();
    
    return cleanup;
  }, [initializeAudioContext, cleanup]);

  return {
    audioContext,
    isInitialized,
    error,
    initializeAudioContext,
    getUserMedia,
    createAudioBuffer,
    createBufferSource,
    createAnalyzer,
    createGain,
    createFilter,
    createCompressor,
    cleanup
  };
};

export default useAudioEngine;