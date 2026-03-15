import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  XIcon,
  ArrowsExpandIcon,
  ChevronDownIcon
} from "@heroicons/react/outline";

const VideoPlayer = ({ video, onClose, isMinimized, onMinimize }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        setDuration(videoRef.current.duration);
      });
      
      // Auto-play when video is selected
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      setIsPlaying(true);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / duration) * 100);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    setProgress(e.target.value);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: 1,
        y: 0,
        width: isMinimized ? 320 : "100%",
        height: isMinimized ? 180 : "auto",
        position: isMinimized ? "fixed" : "relative",
        bottom: isMinimized ? 20 : "auto",
        right: isMinimized ? 20 : "auto",
        zIndex: 50,
        boxShadow: isMinimized ? "0 10px 25px rgba(0,0,0,0.5)" : "none"
      }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-black rounded-lg overflow-hidden shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Video Title Bar (when minimized) */}
        {isMinimized && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-2 flex justify-between items-center">
            <p className="text-white text-sm truncate flex-1">{video.title}</p>
            <button
              onClick={onClose}
              className="text-white hover:text-red-500 transition-colors ml-2"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"
        >
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            {!isMinimized && (
              <h3 className="text-white font-semibold truncate max-w-md">
                {video.title}
              </h3>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={onMinimize}
                className="text-white hover:text-red-500 transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <ArrowsExpandIcon className={`w-5 h-5 transform ${isMinimized ? 'rotate-45' : ''}`} />
              </button>
              {!isMinimized && (
                <button
                  onClick={onClose}
                  className="text-white hover:text-red-500 transition-colors"
                  title="Close"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Center Play/Pause Button (only show when not minimized or controls visible) */}
          {(!isMinimized || showControls) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8 text-white" />
                ) : (
                  <PlayIcon className="w-8 h-8 text-white ml-1" />
                )}
              </motion.button>
            </div>
          )}

          {/* Bottom Controls - hide when minimized */}
          {!isMinimized && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ef4444 ${progress}%, #4b5563 ${progress}%)`
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-red-500 transition-colors"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeOffIcon className="w-5 h-5" />
                      ) : (
                        <VolumeUpIcon className="w-5 h-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-red-500 transition-colors"
                  title="Fullscreen"
                >
                  <ArrowsExpandIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Simple controls for minimized mode */}
        {isMinimized && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex justify-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onMinimize}
              className="text-white hover:text-red-500 transition-colors"
            >
              <ArrowsExpandIcon className="w-5 h-5 transform rotate-45" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoPlayer;