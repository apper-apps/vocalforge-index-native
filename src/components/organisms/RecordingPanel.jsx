import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import LevelMeter from "@/components/molecules/LevelMeter";
import ApperIcon from "@/components/ApperIcon";

const RecordingPanel = ({ 
  onRecordingComplete,
  isRecording,
  onRecordingStateChange,
  className = ""
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  // Initialize audio context and get user media
  useEffect(() => {
    let intervalId;

    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
            sampleRate: 44100
          } 
        });
        
        setAudioStream(stream);
        
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = context.createAnalyser();
        analyserNode.fftSize = 512;
        
        const source = context.createMediaStreamSource(stream);
        source.connect(analyserNode);
        
        setAudioContext(context);
        setAnalyser(analyserNode);
        
        // Create media recorder
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
        });
        setMediaRecorder(recorder);
        
        // Start level monitoring
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        
        const updateLevels = () => {
          analyserNode.getByteFrequencyData(dataArray);
          
          let sum = 0;
          let max = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i] / 255;
            sum += value;
            max = Math.max(max, value);
          }
          
          const average = sum / dataArray.length;
          setAudioLevel(average);
          setPeakLevel(prev => Math.max(prev * 0.95, max)); // Slow decay for peak
          
          intervalId = requestAnimationFrame(updateLevels);
        };
        
        updateLevels();
        
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast.error("Could not access microphone. Please check permissions.");
      }
    };

    initializeAudio();

    return () => {
      if (intervalId) {
        cancelAnimationFrame(intervalId);
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let intervalId;
    
    if (isRecording) {
      intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (!mediaRecorder || mediaRecorder.state !== "inactive") return;
    
    try {
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBuffer);
        }
        
        toast.success("Recording completed successfully!");
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      onRecordingStateChange(true);
      toast.success("Recording started");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      onRecordingStateChange(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-surface-800/50 backdrop-blur-sm rounded-xl border border-surface-600 p-6 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold gradient-text">
          Recording
        </h2>
        <div className="flex items-center gap-2">
          <ApperIcon name="Mic" size={20} className="text-primary-400" />
          <span className="text-sm text-surface-300">Live Input</span>
        </div>
      </div>

      {/* Recording Status */}
      <div className="text-center space-y-4">
        <div className={`text-3xl font-mono font-bold ${isRecording ? "text-red-400" : "text-surface-300"}`}>
          {formatTime(recordingTime)}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-surface-600"}`} />
          <span className="text-sm text-surface-300">
            {isRecording ? "Recording..." : "Ready to record"}
          </span>
        </div>
      </div>

      {/* Level Meters */}
      <div className="flex justify-center gap-6">
        <LevelMeter 
          level={audioLevel}
          peak={peakLevel}
          label="Input"
          size="lg"
        />
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center">
        {!isRecording ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={startRecording}
              size="xl"
              variant="primary"
              icon="Mic"
              className="px-12 py-6 text-xl font-display"
              disabled={!mediaRecorder}
            >
              Start Recording
            </Button>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={stopRecording}
              size="xl"
              variant="danger"
              icon="Square"
              className="px-12 py-6 text-xl font-display recording-glow"
            >
              Stop Recording
            </Button>
          </motion.div>
        )}
      </div>

      {/* Recording Tips */}
      <div className="bg-surface-700/30 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-surface-200 flex items-center gap-2">
          <ApperIcon name="Lightbulb" size={16} />
          Recording Tips
        </h4>
        <ul className="text-sm text-surface-300 space-y-1">
          <li>• Position microphone 6-8 inches from your mouth</li>
          <li>• Keep input levels in the green/yellow range</li>
          <li>• Record in a quiet environment for best results</li>
          <li>• Speak clearly and maintain consistent distance</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default RecordingPanel;