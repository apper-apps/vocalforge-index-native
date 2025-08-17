import { useState, useEffect, useRef, useCallback } from "react";

export const useAudioEngine = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true);
  const audioContextRef = useRef(null);

  // Initialize audio context (requires user gesture)
  const initializeAudioContext = useCallback(async () => {
    try {
      setError(null);
      
      // Check if we already have a context
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }
        setAudioContext(audioContextRef.current);
        setIsInitialized(true);
        setNeedsUserInteraction(false);
        return audioContextRef.current;
      }

      const context = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100,
        latencyHint: "interactive"
      });
      
      // Handle suspended state (requires user interaction)
      if (context.state === "suspended") {
        setNeedsUserInteraction(true);
        // Don't resume here - wait for user interaction
      }
      
      audioContextRef.current = context;
      setAudioContext(context);
      setIsInitialized(context.state === "running");
      setNeedsUserInteraction(context.state === "suspended");
      
      return context;
    } catch (err) {
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Microphone access denied. Please allow microphone access and try again.'
        : `Failed to initialize audio: ${err.message}`;
      setError(errorMessage);
      return null;
    }
  }, []);

  // Resume audio context after user interaction
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
        setIsInitialized(true);
        setNeedsUserInteraction(false);
        setError(null);
        return true;
      } catch (err) {
        setError(`Failed to resume audio: ${err.message}`);
        return false;
      }
    }
    return true;
  }, []);

// Get user media for recording
  const getUserMedia = useCallback(async (constraints = { audio: true }) => {
    try {
      // Ensure audio context is ready first
      if (needsUserInteraction && audioContextRef.current?.state === "suspended") {
        await resumeAudioContext();
      }

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
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Microphone access denied. Please allow microphone access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No microphone found. Please connect a microphone and try again.'
        : `Microphone error: ${err.message}`;
      setError(errorMessage);
      throw err;
    }
  }, [needsUserInteraction, resumeAudioContext]);

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

// Initialize on mount (but don't resume until user interaction)
  useEffect(() => {
    initializeAudioContext();
    
    return cleanup;
  }, [initializeAudioContext, cleanup]);

  return {
    audioContext,
    isInitialized,
    error,
    needsUserInteraction,
    initializeAudioContext,
    resumeAudioContext,
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