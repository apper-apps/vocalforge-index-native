import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Knob from "@/components/atoms/Knob";
import Slider from "@/components/atoms/Slider";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";

const MasteringPanel = ({ 
  audioBuffer,
  onProcessedAudio,
  settings = {},
  onSettingsChange,
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [localSettings, setLocalSettings] = useState({
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    compThreshold: -18,
    compRatio: 4,
    compAttack: 3,
    compRelease: 50,
    limiterThreshold: -1,
    limiterRelease: 5,
    stereoWidth: 100,
    volume: 0,
    enabled: false,
    ...settings
  });

  const eqPresets = [
    { name: "Vocal Presence", eqLow: -2, eqMid: 3, eqHigh: 2 },
    { name: "Warm & Rich", eqLow: 2, eqMid: 1, eqHigh: -1 },
    { name: "Bright & Airy", eqLow: -1, eqMid: 0, eqHigh: 4 },
    { name: "Modern Pop", eqLow: 1, eqMid: 2, eqHigh: 3 },
    { name: "Flat", eqLow: 0, eqMid: 0, eqHigh: 0 }
  ];

  const compressionPresets = [
    { name: "Gentle", compThreshold: -12, compRatio: 2, compAttack: 5, compRelease: 100 },
    { name: "Medium", compThreshold: -18, compRatio: 4, compAttack: 3, compRelease: 50 },
    { name: "Heavy", compThreshold: -24, compRatio: 8, compAttack: 1, compRelease: 25 },
    { name: "Vocal", compThreshold: -15, compRatio: 6, compAttack: 2, compRelease: 75 }
  ];

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(localSettings);
    }
  }, [localSettings, onSettingsChange]);

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const loadEqPreset = (preset) => {
    setLocalSettings(prev => ({
      ...prev,
      ...preset,
      enabled: true
    }));
    toast.success(`${preset.name} EQ preset loaded`);
  };

  const loadCompressionPreset = (preset) => {
    setLocalSettings(prev => ({
      ...prev,
      ...preset,
      enabled: true
    }));
    toast.success(`${preset.name} compression preset loaded`);
  };

  const resetSettings = () => {
    setLocalSettings({
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      compThreshold: -18,
      compRatio: 4,
      compAttack: 3,
      compRelease: 50,
      limiterThreshold: -1,
      limiterRelease: 5,
      stereoWidth: 100,
      volume: 0,
      enabled: false
    });
    toast.info("Mastering settings reset");
  };

  const applyMastering = async () => {
    if (!audioBuffer) {
      toast.error("No audio to process");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const steps = [
        { name: "Applying EQ...", duration: 800 },
        { name: "Processing compression...", duration: 1000 },
        { name: "Applying limiter...", duration: 600 },
        { name: "Finalizing output...", duration: 400 }
      ];

      let totalProgress = 0;
      const stepSize = 100 / steps.length;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setProcessingStep(step.name);
        
        // Simulate processing time with progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, step.duration / 10));
          setProcessingProgress(totalProgress + (stepSize * progress / 100));
        }
        
        totalProgress += stepSize;
      }
      
      setProcessingStep("Complete!");
      setProcessingProgress(100);
      
      // In a real implementation, this would apply actual audio processing
      const processedBuffer = {
        ...audioBuffer,
        processed: true,
        masteringSettings: localSettings
      };
      
      if (onProcessedAudio) {
        onProcessedAudio(processedBuffer);
      }
      
      toast.success("Mastering applied successfully!");
      
    } catch (error) {
      console.error("Error applying mastering:", error);
      toast.error("Failed to apply mastering");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
      setProcessingProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-surface-800/50 backdrop-blur-sm rounded-xl border border-surface-600 p-6 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-display font-semibold gradient-text">
            Mastering
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateSetting("enabled", !localSettings.enabled)}
            className={localSettings.enabled ? "text-accent-500" : "text-surface-400"}
          >
            <ApperIcon name={localSettings.enabled ? "Power" : "PowerOff"} size={16} />
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={resetSettings}
          icon="RotateCcw"
        >
          Reset
        </Button>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="space-y-3">
          <ProgressBar
            value={processingProgress}
            max={100}
            showLabel
            label={processingStep}
            animated
            color="primary"
          />
        </div>
      )}

      {/* EQ Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-surface-200 flex items-center gap-2">
            <ApperIcon name="BarChart3" size={16} />
            3-Band EQ
          </h3>
          <div className="flex gap-1">
            {eqPresets.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant="ghost"
                onClick={() => loadEqPreset(preset)}
                className="text-xs px-2"
                disabled={!localSettings.enabled}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Knob
            label="Low (60Hz)"
            value={localSettings.eqLow}
            min={-12}
            max={12}
            step={0.1}
            onChange={(value) => updateSetting("eqLow", value)}
            size="md"
            color="accent"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
          
          <Knob
            label="Mid (1kHz)"
            value={localSettings.eqMid}
            min={-12}
            max={12}
            step={0.1}
            onChange={(value) => updateSetting("eqMid", value)}
            size="md"
            color="primary"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
          
          <Knob
            label="High (12kHz)"
            value={localSettings.eqHigh}
            min={-12}
            max={12}
            step={0.1}
            onChange={(value) => updateSetting("eqHigh", value)}
            size="md"
            color="secondary"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
        </div>
      </div>

      {/* Compression Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-surface-200 flex items-center gap-2">
            <ApperIcon name="Waves" size={16} />
            Compressor
          </h3>
          <div className="flex gap-1">
            {compressionPresets.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant="ghost"
                onClick={() => loadCompressionPreset(preset)}
                className="text-xs px-2"
                disabled={!localSettings.enabled}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Slider
              label="Threshold (dB)"
              value={localSettings.compThreshold}
              min={-40}
              max={0}
              step={0.5}
              onChange={(value) => updateSetting("compThreshold", value)}
              showValue
              color="primary"
              className={!localSettings.enabled ? "opacity-50" : ""}
            />
            
            <Slider
              label="Ratio"
              value={localSettings.compRatio}
              min={1}
              max={20}
              step={0.5}
              onChange={(value) => updateSetting("compRatio", value)}
              showValue
              color="secondary"
              className={!localSettings.enabled ? "opacity-50" : ""}
            />
          </div>
          
          <div className="space-y-3">
            <Slider
              label="Attack (ms)"
              value={localSettings.compAttack}
              min={0.1}
              max={100}
              step={0.1}
              onChange={(value) => updateSetting("compAttack", value)}
              showValue
              color="accent"
              className={!localSettings.enabled ? "opacity-50" : ""}
            />
            
            <Slider
              label="Release (ms)"
              value={localSettings.compRelease}
              min={1}
              max={1000}
              step={1}
              onChange={(value) => updateSetting("compRelease", value)}
              showValue
              color="primary"
              className={!localSettings.enabled ? "opacity-50" : ""}
            />
          </div>
        </div>
      </div>

      {/* Limiter & Output Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-surface-200 flex items-center gap-2">
            <ApperIcon name="Shield" size={16} />
            Limiter
          </h3>
          
          <Slider
            label="Threshold (dB)"
            value={localSettings.limiterThreshold}
            min={-6}
            max={0}
            step={0.1}
            onChange={(value) => updateSetting("limiterThreshold", value)}
            showValue
            color="danger"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
          
          <Slider
            label="Release (ms)"
            value={localSettings.limiterRelease}
            min={1}
            max={100}
            step={1}
            onChange={(value) => updateSetting("limiterRelease", value)}
            showValue
            color="warning"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-surface-200 flex items-center gap-2">
            <ApperIcon name="Volume2" size={16} />
            Output
          </h3>
          
          <Slider
            label="Volume (dB)"
            value={localSettings.volume}
            min={-20}
            max={20}
            step={0.5}
            onChange={(value) => updateSetting("volume", value)}
            showValue
            color="primary"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
          
          <Slider
            label="Stereo Width"
            value={localSettings.stereoWidth}
            min={0}
            max={200}
            step={5}
            onChange={(value) => updateSetting("stereoWidth", value)}
            showValue
            color="secondary"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
        </div>
      </div>

      {/* Process Button */}
      <div className="pt-4">
        <Button
          onClick={applyMastering}
          size="lg"
          variant="primary"
          className="w-full"
          disabled={!audioBuffer || !localSettings.enabled || isProcessing}
          isLoading={isProcessing}
          icon="Sparkles"
        >
          {isProcessing ? processingStep : "Apply Mastering"}
        </Button>
      </div>
    </motion.div>
  );
};

export default MasteringPanel;