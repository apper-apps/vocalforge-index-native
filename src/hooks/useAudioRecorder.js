import { useCallback, useRef, useState } from "react";
import useAudioEngine from "@/hooks/useAudioEngine";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);

  const { audioContext, createAnalyzer, resumeAudioContext, needsUserInteraction } = useAudioEngine();
  // Start level monitoring
  const startLevelMonitoring = useCallback((stream) => {
    if (!audioContext) return;

    const analyzer = createAnalyzer(512);
    if (!analyzer) return;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);

    analyzerRef.current = analyzer;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const updateLevels = () => {
      analyzer.getByteFrequencyData(dataArray);

      let sum = 0;
      let max = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] / 255;
        sum += value;
        max = Math.max(max, value);
      }

      const average = sum / dataArray.length;
      setAudioLevel(average);
      setPeakLevel(prev => Math.max(prev * 0.95, max));

      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();
  }, [audioContext, createAnalyzer]);

  // Stop level monitoring
  const stopLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
    setPeakLevel(0);
  }, []);

// Check microphone permission status
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (!navigator.permissions || !navigator.permissions.query) {
        return 'unsupported';
      }
      
      const permission = await navigator.permissions.query({ name: 'microphone' });
      return permission.state; // 'granted', 'denied', 'prompt'
    } catch (err) {
      console.warn('Permission API not supported:', err);
      return 'unsupported';
    }
  }, []);

  // Start recording
const startRecording = useCallback(async (options = {}) => {
    try {
      setError(null);

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMessage = 'Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Check microphone permission status
      const permissionStatus = await checkMicrophonePermission();
      
      if (permissionStatus === 'denied') {
        const errorMessage = 'Microphone access is blocked. To enable recording:\n\n' +
          '1. Click the microphone icon in your browser\'s address bar\n' +
          '2. Select "Allow" for microphone access\n' +
          '3. Refresh the page and try recording again\n\n' +
          'Or go to your browser settings and enable microphone access for this site.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Ensure audio context is ready (requires user interaction)
      if (needsUserInteraction) {
        await resumeAudioContext();
      }

      if (!audioContext) {
        const errorMessage = 'Audio system not initialized. Please refresh the page and try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Get user media with enhanced error handling
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
            sampleRate: 44100,
            ...options.audio
          }
        });
      } catch (mediaError) {
        let errorMessage;
        
        switch (mediaError.name) {
          case 'NotAllowedError':
            errorMessage = 'Microphone access denied. Please:\n\n' +
              '1. Click "Allow" when prompted for microphone access\n' +
              '2. Check that no other applications are using your microphone\n' +
              '3. Refresh the page and try again\n\n' +
              'If the problem persists, check your browser\'s microphone settings.';
            break;
          case 'NotFoundError':
            errorMessage = 'No microphone found. Please:\n\n' +
              '1. Connect a microphone to your device\n' +
              '2. Check that your microphone is properly connected\n' +
              '3. Try refreshing the page';
            break;
          case 'NotReadableError':
            errorMessage = 'Microphone is already in use by another application. Please:\n\n' +
              '1. Close other applications using the microphone\n' +
              '2. Restart your browser\n' +
              '3. Try recording again';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Microphone settings are not supported. Please try again with default settings.';
            break;
          case 'SecurityError':
            errorMessage = 'Recording is not allowed on this page. Please ensure you\'re using HTTPS or localhost.';
            break;
          default:
            errorMessage = `Microphone access failed: ${mediaError.message}\n\nPlease check your microphone settings and try again.`;
        }
        
        setError(errorMessage);
        throw mediaError;
      }

      streamRef.current = stream;

      // Create media recorder with better error handling
      let mediaRecorder;
      try {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" :
                        MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" :
                        MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
        
        if (!mimeType) {
          throw new Error('No supported audio format found');
        }

        mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: options.bitRate || 128000
        });
      } catch (recorderError) {
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        const errorMessage = 'Audio recording is not supported in your browser. Please use Chrome, Firefox, or Safari.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      mediaRecorderRef.current = mediaRecorder;
      
      // Initialize chunks array for proper data collection
      const recordedChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        const errorMessage = `Recording error: ${event.error?.message || 'Unknown recording error'}`;
        setError(errorMessage);
        console.error('MediaRecorder error:', event.error);
      };

      // Store chunks reference for stopRecording
      mediaRecorderRef.current.recordedChunks = recordedChunks;

      // Start level monitoring
      startLevelMonitoring(stream);

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      return mediaRecorder;

    } catch (err) {
      // Ensure proper cleanup on any error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      stopLevelMonitoring();
      setIsRecording(false);
      
      // If error message not already set by specific handler, use the caught error
      if (!error) {
        setError(err.message || 'An unexpected error occurred while starting recording.');
      }
      
      throw err;
    }
  }, [startLevelMonitoring, audioContext, needsUserInteraction, resumeAudioContext, checkMicrophonePermission, error, stopLevelMonitoring]);

  // Stop recording
const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error("No recording in progress"));
        return;
      }

      if (!audioContext) {
        reject(new Error("Audio context not available"));
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;
      
      mediaRecorder.onstop = async () => {
        try {
          // Stop level monitoring
          stopLevelMonitoring();

          // Stop timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          // Clean up stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }

          // Get recorded data from collected chunks
          const recordedChunks = mediaRecorder.recordedChunks || [];
          
          if (recordedChunks.length === 0) {
            reject(new Error("No audio data recorded"));
            return;
          }

          const blob = new Blob(recordedChunks, { 
            type: mediaRecorder.mimeType || "audio/webm"
          });

          // Convert blob to array buffer
          const arrayBuffer = await blob.arrayBuffer();
          
          try {
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice());
            
            setIsRecording(false);
            setRecordingTime(0);
            
            resolve({
              audioBuffer,
              arrayBuffer,
              blob,
              duration: audioBuffer.duration,
              sampleRate: audioBuffer.sampleRate,
              numberOfChannels: audioBuffer.numberOfChannels
            });
          } catch (decodeError) {
            // If decoding fails, still return the raw data
            setIsRecording(false);
            setRecordingTime(0);
            
            resolve({
              audioBuffer: null,
              arrayBuffer,
              blob,
              duration: 0,
              sampleRate: 44100,
              numberOfChannels: 1,
              decodeError: decodeError.message
            });
          }

        } catch (err) {
          setIsRecording(false);
          setRecordingTime(0);
          reject(new Error(`Failed to process recording: ${err.message}`));
        }
      };

      mediaRecorder.onerror = (event) => {
        setIsRecording(false);
        setRecordingTime(0);
        reject(new Error(`Recording failed: ${event.error?.message || 'Unknown error'}`));
      };

      mediaRecorder.stop();
    });
  }, [audioContext, stopLevelMonitoring]);
  // Cleanup
  const cleanup = useCallback(() => {
    if (isRecording) {
      stopRecording().catch(console.error);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, [isRecording, stopRecording]);

return {
    isRecording,
    recordingTime,
    audioLevel,
    peakLevel,
    error,
    startRecording,
    stopRecording,
    cleanup,
    checkMicrophonePermission
  };
};

export default useAudioRecorder;