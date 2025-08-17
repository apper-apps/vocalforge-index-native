import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const WaveformDisplay = ({
  audioBuffer = null,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  selection = null,
  onSelectionChange,
  onSeek,
  className = "",
  height = 200,
  showGrid = true
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: width * window.devicePixelRatio, height: height * window.devicePixelRatio });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [height]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize.width) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = canvasSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set high DPI scaling
    canvas.style.width = width / window.devicePixelRatio + "px";
    canvas.style.height = height / window.devicePixelRatio + "px";
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const displayWidth = width / window.devicePixelRatio;
    const displayHeight = height / window.devicePixelRatio;
    const centerY = displayHeight / 2;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(55, 65, 81, 0.3)";
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = (displayHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayWidth, y);
        ctx.stroke();
      }
      
      // Vertical time markers
      const timeMarkers = 8;
      for (let i = 0; i <= timeMarkers; i++) {
        const x = (displayWidth / timeMarkers) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, displayHeight);
        ctx.stroke();
      }
    }

    // Draw waveform if audio buffer exists
    if (audioBuffer && audioBuffer.length > 0) {
      const samples = audioBuffer;
      const samplesPerPixel = Math.max(1, Math.floor(samples.length / displayWidth));
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, displayWidth, 0);
      gradient.addColorStop(0, "rgba(124, 58, 237, 0.8)");
      gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.9)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.8)");
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;

      // Draw waveform bars
      for (let x = 0; x < displayWidth; x++) {
        const startSample = Math.floor(x * samplesPerPixel);
        const endSample = Math.min(startSample + samplesPerPixel, samples.length);
        
        let min = 0;
        let max = 0;
        
        for (let i = startSample; i < endSample; i++) {
          const sample = samples[i] || 0;
          min = Math.min(min, sample);
          max = Math.max(max, sample);
        }
        
        const barHeight = Math.max(1, Math.abs(max - min) * centerY);
        const barY = centerY - barHeight / 2;
        
        ctx.fillRect(x, barY, 1, barHeight);
      }
    } else {
      // Draw placeholder waveform
      ctx.strokeStyle = "rgba(124, 58, 237, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < displayWidth; x += 10) {
        const y = centerY + Math.sin(x * 0.05) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw selection
    if (selection && selection.start !== null && selection.end !== null) {
      const startX = (selection.start / duration) * displayWidth;
      const endX = (selection.end / duration) * displayWidth;
      
      ctx.fillStyle = "rgba(236, 72, 153, 0.2)";
      ctx.fillRect(startX, 0, endX - startX, displayHeight);
      
      ctx.strokeStyle = "rgba(236, 72, 153, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, displayHeight);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, displayHeight);
      ctx.stroke();
    }

    // Draw playhead
    if (duration > 0) {
      const playheadX = (currentTime / duration) * displayWidth;
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, displayHeight);
      ctx.stroke();
      
      // Playhead indicator
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(playheadX, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [audioBuffer, canvasSize, currentTime, duration, selection, showGrid, isPlaying]);

  // Handle mouse interactions
  const handleMouseDown = (e) => {
    if (!containerRef.current || !duration) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    
    setIsSelecting(true);
    setSelectionStart(time);
    
    if (onSelectionChange) {
      onSelectionChange({ start: time, end: time });
    }
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !containerRef.current || !duration) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    
    if (onSelectionChange && selectionStart !== null) {
      onSelectionChange({ 
        start: Math.min(selectionStart, time), 
        end: Math.max(selectionStart, time) 
      });
    }
  };

  const handleMouseUp = (e) => {
    if (!containerRef.current || !duration) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    
    if (!isSelecting && onSeek) {
      onSeek(time);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface-800/50 backdrop-blur-sm rounded-xl border border-surface-600 p-4",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-medium text-surface-200">
            Waveform Editor
          </h3>
          <div className="flex items-center gap-2 text-xs text-surface-400">
            {audioBuffer ? (
              <>
                <span>{duration.toFixed(1)}s</span>
                {selection && (
                  <span className="text-secondary-400">
                    • Selection: {(selection.end - selection.start).toFixed(2)}s
                  </span>
                )}
              </>
            ) : (
              <span>No audio loaded</span>
            )}
          </div>
        </div>
        
        {/* Waveform Canvas */}
        <div 
          ref={containerRef}
          className="relative bg-surface-900 rounded-lg overflow-hidden cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsSelecting(false);
            setSelectionStart(null);
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="waveform-canvas w-full h-auto block"
            style={{ height: `${height}px` }}
          />
          
          {/* Empty state overlay */}
          {!audioBuffer && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-surface-400">
                <div className="text-2xl mb-2">🎵</div>
                <p className="text-sm">Record or load audio to see waveform</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WaveformDisplay;