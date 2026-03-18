import React, { useState, useRef, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function UploadPodcast() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
    duration: "",
    language: "Pashto",
    featured: false,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!thumbnailFile && formData.category) {
      const selectedCategory = categories.find(
        (c) => c._id === formData.category
      );

      if (selectedCategory?.image) {
        setPreviewUrl(selectedCategory.image);
      }
    }
  }, [formData.category, thumbnailFile, categories]);

  // Handle video playback
  const togglePlay = () => {
    if (videoRef.current && isVideoLoaded) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.log("Playback failed:", error);
          setVideoError(true);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);

      // Format duration for form
      const minutes = Math.floor(videoDuration / 60);
      const seconds = Math.floor(videoDuration % 60);
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      setFormData((prev) => ({ ...prev, duration: formattedDuration }));

      setIsVideoLoaded(true);
      setVideoError(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVideoError = (e) => {
    console.error("Video error:", e);
    setVideoError(true);
    setIsVideoLoaded(false);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Video file select - improved with better source handling
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a valid video type
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validVideoTypes.includes(file.type)) {
        alert("Please select a valid video file (MP4, WebM, OGG, or MOV)");
        return;
      }

      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert("File size exceeds 500MB limit");
        return;
      }

      setSelectedVideo(file);
      setVideoError(false);
      setIsVideoLoaded(false);

      // Clean up previous preview URL
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }

      // Create video preview URL
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);

      // Reset playback state
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  // Thumbnail select
  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData((prev) => ({ ...prev, thumbnail: url }));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);

    const selectedCategory = categories.find(
      (c) => c._id === formData.category
    );

    if (selectedCategory?.image) {
      setPreviewUrl(selectedCategory.image);
    } else {
      setPreviewUrl("");
    }

    setFormData((prev) => ({ ...prev, thumbnail: "" }));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl("");
    setFormData((prev) => ({ ...prev, duration: "" }));
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsVideoLoaded(false);
    setVideoError(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [videoPreviewUrl, previewUrl]);

  // Form submit
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!selectedVideo) {
      alert("Please select a video file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
    setUploadSuccess(false);
    setUploadError(false);

    try {
      const data = new FormData();
      data.append("video", selectedVideo);

      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      } else {
        const selectedCategory = categories.find(
          (c) => c._id === formData.category
        );

        if (selectedCategory?.image) {
          data.append("thumbnailUrl", selectedCategory.image);
        }
      }

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("duration", formData.duration);
      data.append("language", formData.language);
      data.append("featured", formData.featured);

      const res = await API.post('/videos/upload', data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
            setUploadProgress(percent);

            // Show complete message when 100%
            if (percent === 100) {
              setUploadComplete(true);
            }
          },
        }
      );

      if (res.status === 201) {
        setUploadSuccess(true);
        setUploadError(false);

        setTimeout(() => {
          setFormData({
            title: "",
            description: "",
            category: "",
            thumbnail: "",
            duration: "",
            language: "Urdu",
            featured: false,
          });
          setSelectedVideo(null);
          setThumbnailFile(null);
          setPreviewUrl("");
          setVideoPreviewUrl("");
          setUploadProgress(0);
          setUploading(false);
          setUploadComplete(false);
          setUploadSuccess(false);
          navigate("/admin");
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setUploadError(true);
      setUploading(false);
      setUploadComplete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Upload New Podcast</h1>
          <p className="text-gray-400">Fill in the details and select a video to preview</p>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {/* Upload Complete Message - Shows at 100% */}
          {uploadComplete && !uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>

              <div className="flex items-center relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">Video Uploaded Successfully! 🎉</h3>
                  <p className="text-green-100">Your video has been uploaded and is being processed</p>

                  {/* Progress bar for visual effect */}
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <motion.div
                      className="bg-white h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Uploading Progress */}
          {uploading && !uploadComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Uploading: {uploadProgress}%</span>
                <span className="text-gray-400">{uploadProgress}% complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">Please don't close the browser</p>
            </motion.div>
          )}

          {/* Upload Success - Final confirmation */}
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Upload Successful! Redirecting to dashboard...
            </motion.div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Upload Failed! Please try again.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={submitHandler} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 space-y-6">
              {/* Video Upload Button - Professional */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Select Video *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoFileChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-red-500 transition-colors group"
                  >
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-400 group-hover:text-red-500 transition-colors">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV (max. 500MB)</p>
                    </div>
                  </label>
                </div>
                {selectedVideo && (
                  <p className="text-sm text-green-400 mt-2">
                    ✓ Selected: {selectedVideo.name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter podcast title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your podcast episode..."
                />
              </div>

              {/* Category Selection - FIXED */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat._id}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all 
                        ${formData.category === cat._id
                          ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/20"
                          : "border-gray-600 hover:border-gray-500 bg-gray-700/30"
                        }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat._id}
                        checked={formData.category === cat._id}
                        onChange={handleInputChange}
                        className="absolute opacity-0"
                        required
                      />
                      <span
                        className={`text-sm font-medium ${formData.category === cat._id
                          ? "text-white"
                          : "text-gray-400"
                          }`}
                      >
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
                {categories.length === 0 && (
                  <p className="text-sm text-yellow-500 mt-2">
                    Loading categories...
                  </p>
                )}
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option value="Urdu">Urdu</option>
                  <option value="English">English</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Pashto">Pashto</option>
                  <option value="Sindhi">Sindhi</option>
                </select>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Thumbnail (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="flex items-center justify-center w-full px-4 py-4 border border-gray-600 rounded-lg cursor-pointer hover:border-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">Choose thumbnail image</span>
                  </label>
                </div>
                {previewUrl && (
                  <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-offset-gray-800"
                  id="featured"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                  Mark as featured episode
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !selectedVideo}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {uploading ? `Uploading... ${uploadProgress}%` : "Upload Podcast"}
              </button>
            </form>
          </motion.div>

          {/* Right Column - Video Preview with Playback Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-6 h-fit"
          >
            {selectedVideo ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                {/* Video Player with Custom Controls */}
                <div className="relative aspect-video bg-black group"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}>

                  {/* Video Element with proper sources */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    poster={previewUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={handleVideoError}
                    onClick={togglePlay}
                    preload="metadata"
                  >
                    {videoPreviewUrl && (
                      <source src={videoPreviewUrl} type={selectedVideo?.type || 'video/mp4'} />
                    )}
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Info Overlay */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      Preview Mode
                    </span>
                    {formData.duration && (
                      <span className="px-3 py-1 bg-gray-900/90 backdrop-blur-sm text-gray-300 text-xs font-medium rounded-full">
                        {formData.duration}
                      </span>
                    )}
                  </div>

                  {/* Remove Video Button */}
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-4 right-4 p-2 bg-gray-900/90 backdrop-blur-sm rounded-lg hover:bg-red-500/90 transition-colors group z-10"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Video Error Message */}
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-400 font-medium">Video format not supported</p>
                        <p className="text-gray-400 text-sm mt-2">Please try a different video file</p>
                      </div>
                    </div>
                  )}

                  {/* Custom Video Controls */}
                  <AnimatePresence>
                    {showControls && !videoError && isVideoLoaded && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4"
                      >
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                          <div className="flex justify-between text-xs text-white/70 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Play/Pause Button */}
                            <button
                              onClick={togglePlay}
                              className="text-white hover:text-red-500 transition-colors"
                            >
                              {isPlaying ? (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M10 4H6v16h4V4zm8 0h-4v16h4V4z" />
                                </svg>
                              ) : (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={toggleMute}
                                className="text-white hover:text-red-500 transition-colors"
                              >
                                {isMuted || volume === 0 ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4v6h3l5 5v-6.59l4.18 4.18c-.65.42-1.38.74-2.18.91v2.06c1.34-.22 2.57-.81 3.57-1.66l2.01 2.01a.996.996 0 101.41-1.41L5.05 3.63a.996.996 0 00-1.42 0zM16 12c0 .35-.05.68-.13 1.01l1.52 1.52c.38-.78.61-1.63.61-2.53 0-2.49-1.27-4.7-3.18-5.99v2.06c1.12.86 1.87 2.13 1.87 3.53zM14 4.25v2.06c.16.09.32.17.47.27L13 8.29V6.78l1-2.53zM10 6.78l-1 2.53L5.27 5.73 6.73 4.27 10 6.78z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                                  </svg>
                                )}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-500"
                              />
                            </div>
                          </div>

                          {/* Fullscreen Button */}
                          <button
                            onClick={() => videoRef.current?.requestFullscreen()}
                            className="text-white hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Big Play Button (when paused and video loaded) */}
                  {!isPlaying && !videoError && isVideoLoaded && (
                    <button
                      onClick={togglePlay}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors group"
                    >
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  )}

                  {/* Loading State */}
                  {!isVideoLoaded && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Video Details Panel */}
                <div className="p-6 space-y-4">
                  {/* Title and Category */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {formData.title || "Untitled Podcast"}
                    </h2>
                    {formData.category && (
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-xs font-medium">
                          {categories.find(c => c._id === formData.category)?.name || "Category"}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formData.language}
                        </span>
                        {formData.featured && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/30">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {formData.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  {/* Video Stats */}
                  {selectedVideo && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-white">{formData.duration || "Loading..."}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Format</p>
                        <p className="text-sm font-medium text-white">{selectedVideo?.type.split('/')[1]?.toUpperCase() || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Size</p>
                        <p className="text-sm font-medium text-white">
                          {(selectedVideo?.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {isVideoLoaded && !videoError && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-400">Video ready to play and upload</p>
                          <p className="text-xs text-green-500/70">Click play to preview your video</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State - No Video Selected */
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Video Selected</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Select a video file from the form to see a professional preview here
                </p>
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium cursor-pointer hover:bg-red-500/20 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Choose a Video
                </label>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default UploadPodcast;