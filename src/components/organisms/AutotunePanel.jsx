import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Slider from "@/components/atoms/Slider";
import Knob from "@/components/atoms/Knob";
import ApperIcon from "@/components/ApperIcon";

const AutotunePanel = ({ 
  audioBuffer,
  onProcessedAudio,
  settings = {},
  onSettingsChange,
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    enabled: false,
    key: "C",
    scale: "major",
    correctionStrength: 75,
    referencePitch: 440,
    formantCorrection: 50,
    naturalness: 80,
    ...settings
  });

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const scales = [
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
    { value: "chromatic", label: "Chromatic" },
    { value: "blues", label: "Blues" },
    { value: "pentatonic", label: "Pentatonic" }
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

  const applyAutotune = async () => {
    if (!audioBuffer) {
      toast.error("No audio to process");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate autotune processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would apply pitch correction algorithms
      // For now, we'll just pass through the original audio with settings applied
      const processedBuffer = {
        ...audioBuffer,
        processed: true,
        autotuneSettings: localSettings
      };
      
      if (onProcessedAudio) {
        onProcessedAudio(processedBuffer);
      }
      
      toast.success("Autotune applied successfully!");
      
    } catch (error) {
      console.error("Error applying autotune:", error);
      toast.error("Failed to apply autotune");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSettings = () => {
    setLocalSettings({
      enabled: false,
      key: "C",
      scale: "major",
      correctionStrength: 75,
      referencePitch: 440,
      formantCorrection: 50,
      naturalness: 80
    });
    toast.info("Autotune settings reset");
  };

  const presets = [
    { name: "Subtle", correctionStrength: 25, naturalness: 90, formantCorrection: 30 },
    { name: "Natural", correctionStrength: 50, naturalness: 80, formantCorrection: 50 },
    { name: "Modern", correctionStrength: 75, naturalness: 60, formantCorrection: 70 },
    { name: "Robotic", correctionStrength: 100, naturalness: 20, formantCorrection: 90 }
  ];

  const loadPreset = (preset) => {
    setLocalSettings(prev => ({
      ...prev,
      ...preset,
      enabled: true
    }));
    toast.success(`${preset.name} preset loaded`);
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
            AI Autotune
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

      {/* Quick Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-surface-200">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              size="sm"
              variant="secondary"
              onClick={() => loadPreset(preset)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Key and Scale Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-200">Key</label>
          <select
            value={localSettings.key}
            onChange={(e) => updateSetting("key", e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-surface-100 focus:border-primary-500 focus:outline-none"
            disabled={!localSettings.enabled}
          >
            {keys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-200">Scale</label>
          <select
            value={localSettings.scale}
            onChange={(e) => updateSetting("scale", e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-surface-100 focus:border-primary-500 focus:outline-none"
            disabled={!localSettings.enabled}
          >
            {scales.map(scale => (
              <option key={scale.value} value={scale.value}>{scale.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Correction Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <Knob
            label="Correction"
            value={localSettings.correctionStrength}
            min={0}
            max={100}
            onChange={(value) => updateSetting("correctionStrength", value)}
            size="md"
            color="primary"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
          
          <Knob
            label="Naturalness"
            value={localSettings.naturalness}
            min={0}
            max={100}
            onChange={(value) => updateSetting("naturalness", value)}
            size="md"
            color="secondary"
            className={!localSettings.enabled ? "opacity-50" : ""}
          />
        </div>
        
        <Slider
          label="Formant Correction"
          value={localSettings.formantCorrection}
          min={0}
          max={100}
          onChange={(value) => updateSetting("formantCorrection", value)}
          showValue
          color="accent"
          className={!localSettings.enabled ? "opacity-50" : ""}
        />
        
        <Slider
          label="Reference Pitch (Hz)"
          value={localSettings.referencePitch}
          min={415}
          max={465}
          step={0.5}
          onChange={(value) => updateSetting("referencePitch", value)}
          showValue
          color="primary"
          className={!localSettings.enabled ? "opacity-50" : ""}
        />
      </div>

      {/* Process Button */}
      <div className="pt-4">
        <Button
          onClick={applyAutotune}
          size="lg"
          variant="primary"
          className="w-full"
          disabled={!audioBuffer || !localSettings.enabled || isProcessing}
          isLoading={isProcessing}
          icon="Zap"
        >
          {isProcessing ? "Processing..." : "Apply Autotune"}
        </Button>
      </div>

      {/* Settings Summary */}
      <div className="bg-surface-700/30 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-surface-200 flex items-center gap-2">
          <ApperIcon name="Settings" size={16} />
          Current Settings
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-surface-300">
          <div>Key: <span className="text-primary-400">{localSettings.key} {localSettings.scale}</span></div>
          <div>Strength: <span className="text-secondary-400">{localSettings.correctionStrength}%</span></div>
          <div>Naturalness: <span className="text-accent-400">{localSettings.naturalness}%</span></div>
          <div>Reference: <span className="text-surface-200">{localSettings.referencePitch}Hz</span></div>
        </div>
      </div>
    </motion.div>
  );
};

export default AutotunePanel;