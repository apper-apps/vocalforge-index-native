import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";

const ExportPanel = ({ 
  audioBuffer,
  projectName = "VocalForge Recording",
  className = ""
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState("wav");
  const [exportQuality, setExportQuality] = useState("high");
  const [exportStep, setExportStep] = useState("");

  const formats = [
    { value: "wav", label: "WAV (Uncompressed)", size: "~40MB", quality: "Lossless" },
    { value: "flac", label: "FLAC (Compressed)", size: "~25MB", quality: "Lossless" },
    { value: "mp3-320", label: "MP3 320kbps", size: "~12MB", quality: "High" },
    { value: "mp3-192", label: "MP3 192kbps", size: "~7MB", quality: "Standard" },
    { value: "mp3-128", label: "MP3 128kbps", size: "~5MB", quality: "Good" }
  ];

  const qualities = [
    { value: "high", label: "High Quality", sampleRate: "44.1kHz", bitDepth: "24-bit" },
    { value: "standard", label: "Standard", sampleRate: "44.1kHz", bitDepth: "16-bit" },
    { value: "web", label: "Web Optimized", sampleRate: "22kHz", bitDepth: "16-bit" }
  ];

  const exportAudio = async () => {
    if (!audioBuffer) {
      toast.error("No audio to export");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const steps = [
        { name: "Preparing audio data...", duration: 500 },
        { name: "Applying format conversion...", duration: 1200 },
        { name: "Optimizing quality...", duration: 800 },
        { name: "Generating file...", duration: 600 },
        { name: "Finalizing export...", duration: 300 }
      ];

      let totalProgress = 0;
      const stepSize = 100 / steps.length;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setExportStep(step.name);
        
        // Simulate processing time with progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, step.duration / 5));
          setExportProgress(totalProgress + (stepSize * progress / 100));
        }
        
        totalProgress += stepSize;
      }

      // Create a blob URL for download simulation
      const blob = new Blob([new ArrayBuffer(1024)], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "_")}_${Date.now()}.${exportFormat.split("-")[0]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStep("Complete!");
      setExportProgress(100);
      toast.success("Audio exported successfully!");
      
      // Reset after delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStep("");
      }, 2000);

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export audio");
      setIsExporting(false);
      setExportProgress(0);
      setExportStep("");
    }
  };

  const getSelectedFormat = () => {
    return formats.find(f => f.value === exportFormat);
  };

  const getSelectedQuality = () => {
    return qualities.find(q => q.value === exportQuality);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface-800/50 backdrop-blur-sm rounded-xl border border-surface-600 p-6 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold gradient-text">
          Export Audio
        </h2>
        <div className="flex items-center gap-2 text-sm text-surface-300">
          <ApperIcon name="Download" size={16} />
          <span>Ready to export</span>
        </div>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <ProgressBar
            value={exportProgress}
            max={100}
            showLabel
            label={exportStep}
            animated
            color="primary"
          />
          <div className="text-center text-sm text-surface-400">
            {Math.round(exportProgress)}% complete
          </div>
        </motion.div>
      )}

      {/* Format Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-surface-200">Export Format</h3>
        <div className="grid gap-2">
          {formats.map((format) => (
            <motion.button
              key={format.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExportFormat(format.value)}
              className={`
                p-3 rounded-lg border transition-all duration-200 text-left
                ${exportFormat === format.value
                  ? "border-primary-500 bg-primary-500/10 text-primary-400"
                  : "border-surface-600 bg-surface-700/30 text-surface-200 hover:border-surface-500"
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{format.label}</div>
                  <div className="text-sm opacity-70">
                    Quality: {format.quality} • Size: {format.size}
                  </div>
                </div>
                <div className="text-right text-sm opacity-70">
                  {exportFormat === format.value && (
                    <ApperIcon name="Check" size={16} className="text-primary-500" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quality Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-surface-200">Quality Settings</h3>
        <div className="grid gap-2">
          {qualities.map((quality) => (
            <motion.button
              key={quality.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExportQuality(quality.value)}
              className={`
                p-3 rounded-lg border transition-all duration-200 text-left
                ${exportQuality === quality.value
                  ? "border-secondary-500 bg-secondary-500/10 text-secondary-400"
                  : "border-surface-600 bg-surface-700/30 text-surface-200 hover:border-surface-500"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{quality.label}</div>
                  <div className="text-sm opacity-70">
                    {quality.sampleRate} • {quality.bitDepth}
                  </div>
                </div>
                {exportQuality === quality.value && (
                  <ApperIcon name="Check" size={16} className="text-secondary-500" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-surface-700/30 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-surface-200 flex items-center gap-2">
          <ApperIcon name="Info" size={16} />
          Export Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-surface-400">Format:</div>
            <div className="text-surface-200">{getSelectedFormat()?.label}</div>
          </div>
          <div>
            <div className="text-surface-400">Quality:</div>
            <div className="text-surface-200">{getSelectedQuality()?.label}</div>
          </div>
          <div>
            <div className="text-surface-400">Estimated Size:</div>
            <div className="text-surface-200">{getSelectedFormat()?.size}</div>
          </div>
          <div>
            <div className="text-surface-400">Filename:</div>
            <div className="text-surface-200 font-mono text-xs">
              {projectName.replace(/\s+/g, "_")}.{exportFormat.split("-")[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3">
        <Button
          onClick={exportAudio}
          size="lg"
          variant="primary"
          className="flex-1"
          disabled={!audioBuffer || isExporting}
          isLoading={isExporting}
          icon="Download"
        >
          {isExporting ? "Exporting..." : "Export Audio"}
        </Button>
        
        <Button
          size="lg"
          variant="secondary"
          disabled={isExporting}
          icon="Share2"
        >
          Share
        </Button>
      </div>

      {/* Export Tips */}
      <div className="text-xs text-surface-400 space-y-1">
        <p>💡 <strong>Tip:</strong> WAV format provides the highest quality for professional use</p>
        <p>💡 <strong>Tip:</strong> MP3 320kbps is ideal for sharing while maintaining good quality</p>
        <p>💡 <strong>Tip:</strong> Use standard quality for faster processing and smaller files</p>
      </div>
    </motion.div>
  );
};

export default ExportPanel;