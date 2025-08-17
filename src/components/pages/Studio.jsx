import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import WaveformDisplay from "@/components/molecules/WaveformDisplay";
import TransportControls from "@/components/molecules/TransportControls";
import RecordingPanel from "@/components/organisms/RecordingPanel";
import AutotunePanel from "@/components/organisms/AutotunePanel";
import MasteringPanel from "@/components/organisms/MasteringPanel";
import ExportPanel from "@/components/organisms/ExportPanel";
import LevelMeter from "@/components/molecules/LevelMeter";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Studio = () => {
  // Audio state
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [processedAudio, setProcessedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // UI state
  const [activePanel, setActivePanel] = useState("record");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState(null);
  const [outputLevel, setOutputLevel] = useState(0);
  const [outputPeak, setOutputPeak] = useState(0);
  
  // Settings
  const [autotuneSettings, setAutotuneSettings] = useState({});
  const [masteringSettings, setMasteringSettings] = useState({});
  const [projectName, setProjectName] = useState("Untitled Project");

  // Audio context for playback
  const [audioContext, setAudioContext] = useState(null);
  const [audioSource, setAudioSource] = useState(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);
      } catch (err) {
        setError("Failed to initialize audio system");
      }
    };
    
    initAudio();
    
    return () => {
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, []);

  // Handle recording completion
  const handleRecordingComplete = (buffer) => {
    setAudioBuffer(buffer);
    setDuration(buffer.duration || 0);
    setActivePanel("autotune");
    toast.success("Recording completed! Ready for autotune.");
    
    // Generate waveform data simulation
    const waveformData = new Float32Array(buffer.length || 44100);
    for (let i = 0; i < waveformData.length; i++) {
      waveformData[i] = (Math.random() - 0.5) * 0.8;
    }
    setAudioBuffer(prev => ({ ...prev, waveformData }));
  };

  // Handle processed audio from autotune/mastering
  const handleProcessedAudio = (processed) => {
    setProcessedAudio(processed);
    if (processed.autotuneSettings) {
      setActivePanel("master");
      toast.success("Ready for mastering!");
    } else if (processed.masteringSettings) {
      setActivePanel("export");
      toast.success("Ready to export!");
    }
  };

  // Transport controls
  const handlePlay = () => {
    if (!audioBuffer && !processedAudio) {
      toast.warning("No audio to play");
      return;
    }
    
    setIsPlaying(true);
    setIsPaused(false);
    toast.info("Playing audio...");
    
    // Simulate playback time updates
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1;
        if (next >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 100);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  const handleRecord = () => {
    if (!isRecording) {
      setActivePanel("record");
    }
    // Recording state is managed by RecordingPanel
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (isPlaying) {
      // In real implementation, seek the audio source
    }
  };

  // Panel navigation
  const panels = [
    { id: "record", label: "Record", icon: "Mic", disabled: false },
    { id: "autotune", label: "Autotune", icon: "Zap", disabled: !audioBuffer },
    { id: "master", label: "Master", icon: "Sliders", disabled: !audioBuffer },
    { id: "export", label: "Export", icon: "Download", disabled: !audioBuffer }
  ];

  // Show loading state
  if (isLoading) {
    return <Loading />;
  }

  // Show error state
  if (error) {
    return (
      <Error 
        message={error} 
        onRetry={() => {
          setError(null);
          window.location.reload();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Header */}
      <header className="bg-surface-800/50 backdrop-blur-sm border-b border-surface-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center"
            >
              <ApperIcon name="Mic" size={24} className="text-white" />
            </motion.div>
            
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">
                VocalForge
              </h1>
              <p className="text-sm text-surface-400">
                AI-Powered Vocal Production Studio
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Project Name */}
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-surface-100 focus:border-primary-500 focus:outline-none text-sm"
              placeholder="Project name"
            />
            
            {/* Output Level Meter */}
            <LevelMeter 
              level={outputLevel}
              peak={outputPeak}
              label="Output"
              size="sm"
              orientation="vertical"
            />
            
            <Button size="sm" variant="outline" icon="Save">
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Waveform and Transport */}
        <div className="flex-1 flex flex-col p-6">
          {/* Panel Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-surface-800/50 rounded-xl p-1 border border-surface-600">
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => !panel.disabled && setActivePanel(panel.id)}
                  disabled={panel.disabled}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activePanel === panel.id
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                      : panel.disabled
                      ? "text-surface-500 cursor-not-allowed"
                      : "text-surface-200 hover:text-white hover:bg-surface-700"
                    }
                  `}
                >
                  <ApperIcon name={panel.icon} size={16} />
                  {panel.label}
                </button>
              ))}
            </div>
          </div>

          {/* Waveform Display */}
          <div className="flex-1 mb-6">
            {audioBuffer ? (
              <WaveformDisplay
                audioBuffer={audioBuffer.waveformData}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                selection={selection}
                onSelectionChange={setSelection}
                onSeek={handleSeek}
                className="h-full"
                height={300}
              />
            ) : (
              <Empty
                title="No Audio Loaded"
                message="Start recording or load an audio file to see the waveform visualization"
                icon="AudioWaveform"
                actionText="Start Recording"
                onAction={() => setActivePanel("record")}
              />
            )}
          </div>

          {/* Transport Controls */}
          <TransportControls
            isPlaying={isPlaying}
            isRecording={isRecording}
            isPaused={isPaused}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onRecord={handleRecord}
            position={`${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, "0")}`}
            duration={`${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, "0")}`}
          />
        </div>

        {/* Right Panel - Active Tool */}
        <div className="w-96 p-6">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activePanel === "record" && (
              <RecordingPanel
                onRecordingComplete={handleRecordingComplete}
                isRecording={isRecording}
                onRecordingStateChange={setIsRecording}
                className="h-full"
              />
            )}
            
            {activePanel === "autotune" && (
              <AutotunePanel
                audioBuffer={audioBuffer}
                onProcessedAudio={handleProcessedAudio}
                settings={autotuneSettings}
                onSettingsChange={setAutotuneSettings}
                className="h-full"
              />
            )}
            
            {activePanel === "master" && (
              <MasteringPanel
                audioBuffer={processedAudio || audioBuffer}
                onProcessedAudio={handleProcessedAudio}
                settings={masteringSettings}
                onSettingsChange={setMasteringSettings}
                className="h-full"
              />
            )}
            
            {activePanel === "export" && (
              <ExportPanel
                audioBuffer={processedAudio || audioBuffer}
                projectName={projectName}
                className="h-full"
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Studio;