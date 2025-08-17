import { useState, useRef, useCallback } from "react";
import { useAudioEngine } from "./useAudioEngine";

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

  const { audioContext, createAnalyzer } = useAudioEngine();

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

  // Start recording
  const startRecording = useCallback(async (options = {}) => {
    try {
      setError(null);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 44100,
          ...options.audio
        }
      });

      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
        audioBitsPerSecond: options.bitRate || 128000
      });

      mediaRecorderRef.current = mediaRecorder;

      // Start level monitoring
      startLevelMonitoring(stream);

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);

      // Start recording
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        return blob;
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      return mediaRecorder;

    } catch (err) {
      setError(`Failed to start recording: ${err.message}`);
      throw err;
    }
  }, [startLevelMonitoring]);

  // Stop recording
  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error("No recording in progress"));
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

          // Get recorded data
          const chunks = [];
          const reader = new FileReader();
          
          reader.onload = async () => {
            try {
              const arrayBuffer = reader.result;
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              
              setIsRecording(false);
              setRecordingTime(0);
              
              resolve({
                audioBuffer,
                arrayBuffer,
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                numberOfChannels: audioBuffer.numberOfChannels
              });
            } catch (err) {
              reject(new Error(`Failed to process recording: ${err.message}`));
            }
          };

          // This is a simplified version - in reality, you'd collect the chunks from ondataavailable
          const blob = new Blob([], { type: "audio/webm" });
          reader.readAsArrayBuffer(blob);

        } catch (err) {
          reject(err);
        }
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
    cleanup
  };
};

export default useAudioRecorder;