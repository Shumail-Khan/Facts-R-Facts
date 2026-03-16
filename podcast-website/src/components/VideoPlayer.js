import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../services/api"; // Make sure to import your API
import {
  PlayIcon,
  PauseIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  XIcon,
  ArrowsExpandIcon
} from "@heroicons/react/outline";

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeout = useRef(null);

  // Add view tracking function with session storage to prevent multiple counts
  const addView = async () => {
    // Check if view already counted in this session
    if (!sessionStorage.getItem(`viewed_${video._id}`)) {
      try {
        await API.post(`/videos/${video._id}/view`);
        // Mark as viewed in session storage
        sessionStorage.setItem(`viewed_${video._id}`, 'true');
        console.log('View tracked for video:', video._id);
      } catch (error) {
        console.error("View update failed", error);
      }
    } else {
      console.log('View already counted in this session');
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        setDuration(videoRef.current.duration);
        setIsLoading(false);
      });

      videoRef.current.addEventListener("waiting", () => setIsLoading(true));
      videoRef.current.addEventListener("playing", () => setIsLoading(false));

      // Auto-play when video is selected
      videoRef.current.play().catch(e => {
        console.log("Autoplay prevented:", e);
        setIsPlaying(false);
      });
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
    if (!document.fullscreenElement) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
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

  const handleKeyPress = (e) => {
    if (e.key === " " || e.key === "Spacebar" || e.key === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "Escape") {
      onClose();
    } else if (e.key === "f" || e.key === "F") {
      toggleFullscreen();
    } else if (e.key === "m" || e.key === "M") {
      toggleMute();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isMuted]);

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <motion.div
      ref={playerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative" style={{ paddingTop: "56.25%" }}>
        {/* Video Element */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          onPlay={addView} // This triggers when video starts playing
          className="absolute top-0 left-0 w-full h-full"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Video Info Overlay - Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg truncate">
                {video.title}
              </h3>
              <p className="text-gray-300 text-sm truncate">
                {video.description}
              </p>
            </div>
            <button
              onClick={handleCloseClick}
              className="text-white hover:text-red-500 transition-colors ml-4 p-2 hover:bg-white/10 rounded-full"
              title="Close (ESC)"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Center Play/Pause Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: showControls ? 1 : 0,
            scale: showControls ? 1 : 0.5
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
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
        </motion.div>

        {/* Bottom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"
        >
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
                className="text-white hover:text-red-500 transition-colors p-2 hover:bg-white/10 rounded-full"
                title="Play/Pause (Space)"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors p-2 hover:bg-white/10 rounded-full"
                  title="Mute/Unmute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeOffIcon className="w-5 h-5" />
                  ) : (
                    <VolumeUpIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="w-0 group-hover:w-20 transition-all duration-300 overflow-hidden">
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
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors p-2 hover:bg-white/10 rounded-full"
                title="Fullscreen (F)"
              >
                <ArrowsExpandIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 0.5 : 0 }}
          className="absolute bottom-20 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded"
        >
          Space: Play/Pause | F: Fullscreen | ESC: Close | M: Mute
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;