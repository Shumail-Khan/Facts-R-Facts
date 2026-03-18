import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import API from "../services/api";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { 
  Lock, 
  User, 
  LogOut, 
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle 
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const videoRefs = useRef({});
  const modalVideoRef = useRef(null);
  const modalRef = useRef(null);
  
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalCategories: 3,
    totalUsers: 2345,
    avgLikesPerVideo: 0,
    avgCommentsPerVideo: 0,
    engagementRate: 0
  });

  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [currentCommentVideo, setCurrentCommentVideo] = useState(null);
  const [commentStats, setCommentStats] = useState({
    totalComments: 0,
    avgCommentsPerVideo: 0,
    mostCommentedVideo: null,
    recentComments: []
  });
  const [likeStats, setLikeStats] = useState({
    totalLikes: 0,
    avgLikesPerVideo: 0,
    mostLikedVideo: null,
    likeTrend: []
  });
  
  // Change Password Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchComments();
    // fetchLikeStats();
    
    // Add ESC key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeVideoModal();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/videos");
      
      // Get all videos with Cloudinary URLs
      const videos = res.data.map((video) => ({
        id: video._id,
        title: video.title,
        description: video.description || "No description available",
        category: video.category?.name || "Uncategorized",
        views: video.views || 0,
        likes: video.likes || 0,
        comments: video.comments || 0,
        date: video.createdAt ? new Date(video.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        thumbnail: video.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format",
        videoUrl: video.videoUrl,
        duration: video.duration || "0:00",
        createdAt: video.createdAt
      }));

      // Sort by date (most recent first) and take latest 5
      const sortedVideos = videos.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentUploads(sortedVideos.slice(0, 5));

      // Calculate stats
      const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
      const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
      const totalComments = videos.reduce((sum, video) => sum + video.comments, 0);
      const avgLikesPerVideo = videos.length > 0 ? (totalLikes / videos.length).toFixed(1) : 0;
      const avgCommentsPerVideo = videos.length > 0 ? (totalComments / videos.length).toFixed(1) : 0;
      const engagementRate = videos.length > 0 
        ? ((totalLikes + totalComments) / (totalViews || 1) * 100).toFixed(1) 
        : 0;

      setStats(prev => ({
        ...prev,
        totalVideos: videos.length,
        totalViews,
        totalLikes,
        totalComments,
        avgLikesPerVideo,
        avgCommentsPerVideo,
        engagementRate
      }));

      // Update category stats
      const categoryCounts = {};
      const categoryViews = {};
      const categoryLikes = {};
      const categoryComments = {};
      
      videos.forEach(video => {
        if (video.category) {
          categoryCounts[video.category] = (categoryCounts[video.category] || 0) + 1;
          categoryViews[video.category] = (categoryViews[video.category] || 0) + video.views;
          categoryLikes[video.category] = (categoryLikes[video.category] || 0) + video.likes;
          categoryComments[video.category] = (categoryComments[video.category] || 0) + video.comments;
        }
      });

      const categoryColors = {
        "Red Mic": "#ef4444",
        "Qalander": "#8b5cf6",
        "Naama": "#3b82f6",
        "Default": "#6b7280"
      };

      const updatedCategoryStats = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        videos: categoryCounts[cat],
        views: categoryViews[cat] || 0,
        likes: categoryLikes[cat] || 0,
        comments: categoryComments[cat] || 0,
        color: categoryColors[cat] || categoryColors.Default
      }));

      if (updatedCategoryStats.length > 0) {
        setCategoryStats(updatedCategoryStats);
      }

      // Generate views data based on time range
      generateViewsData(videos, timeRange);

      setError(null);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await API.get("/videos/comments/all");
      const commentsData = response.data;

      // Group comments by video
      const commentsByVideo = {};
      commentsData.forEach(comment => {
        if (!commentsByVideo[comment.videoId]) {
          commentsByVideo[comment.videoId] = [];
        }
        commentsByVideo[comment.videoId].push(comment);
      });
      
      setComments(commentsByVideo);
      
      // Calculate comment stats
      const totalComments = commentsData.length;
      const videos = recentUploads.length > 0 ? recentUploads : [];
      const avgCommentsPerVideo = videos.length > 0 ? (totalComments / videos.length).toFixed(1) : 0;
      
      // Find most commented video
      let mostCommented = null;
      let maxComments = 0;
      Object.entries(commentsByVideo).forEach(([videoId, videoComments]) => {
        if (videoComments.length > maxComments) {
          maxComments = videoComments.length;
          const video = videos.find(v => v.id === videoId);
          if (video) {
            mostCommented = {
              ...video,
              commentCount: videoComments.length
            };
          }
        }
      });
      
      // Get recent comments
      const recentComments = commentsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(comment => {
          return {
            ...comment,
            videoTitle: comment.videoId?.title || 'Unknown Video'
          };
        });
      
      setCommentStats({
        totalComments,
        avgCommentsPerVideo,
        mostCommentedVideo: mostCommented,
        recentComments
      });
      
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const generateViewsData = (videos, range) => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Calculate views for this day
      const dayViews = videos.reduce((sum, video) => {
        const videoDate = new Date(video.createdAt);
        if (videoDate.toDateString() === date.toDateString()) {
          return sum + video.views;
        }
        return sum;
      }, 0);
      
      data.push({
        name: dateStr,
        views: dayViews,
        likes: Math.floor(dayViews * 0.3), // Example calculation
        comments: Math.floor(dayViews * 0.1) // Example calculation
      });
    }
  };

  // Modal Video Functions
  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoError(false);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Reset video source to ensure fresh load
    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.load();
      }
    }, 100);
  };

  const closeVideoModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
    setIsModalOpen(false);
    setSelectedVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoError(false);
    
    // Restore body scrolling
    document.body.style.overflow = 'unset';
  };

  // Handle click outside modal
  const handleModalClick = (e) => {
    // If clicking the overlay (not the modal content), close
    if (e.target === e.currentTarget) {
      closeVideoModal();
    }
  };

  // Video Controls
  const togglePlay = () => {
    if (modalVideoRef.current) {
      if (isPlaying) {
        modalVideoRef.current.pause();
      } else {
        modalVideoRef.current.play().catch(error => {
          console.error("Playback failed:", error);
          setVideoError(true);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (modalVideoRef.current) {
      setCurrentTime(modalVideoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (modalVideoRef.current) {
      setDuration(modalVideoRef.current.duration);
      setVideoError(false);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (modalVideoRef.current) {
      modalVideoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (modalVideoRef.current) {
      modalVideoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (modalVideoRef.current) {
      if (!document.fullscreenElement) {
        if (modalVideoRef.current.requestFullscreen) {
          modalVideoRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
  };

  const skipForward = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime -= 10;
    }
  };

  const handleVideoError = (e) => {
    console.error("Video error:", e);
    setVideoError(true);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [categoryStats, setCategoryStats] = useState([
    { name: "Red Mic", videos: 0, views: 0, likes: 0, comments: 0, color: "#ef4444" },
    { name: "Qalander", videos: 0, views: 0, likes: 0, comments: 0, color: "#8b5cf6" },
    { name: "Naama", videos: 0, views: 0, likes: 0, comments: 0, color: "#3b82f6" }
  ]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await API.delete(`/videos/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        });
        fetchVideos();
        fetchComments();
        // fetchLikeStats();
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video");
      }
    }
  };

  const handleViewComments = (video) => {
    setCurrentCommentVideo(video);
    setShowComments(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // SVG Icons
  const PlayIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );

  const PauseIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  const FullscreenIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );

  const VolumeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 5.343a1 1 0 010 1.414 5 5 0 010 7.07 1 1 0 01-1.414-1.414 3 3 0 000-4.242 1 1 0 011.414-1.414z" clipRule="evenodd" />
    </svg>
  );

  const MuteIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM13 8a1 1 0 011.414 0 4 4 0 010 5.656 1 1 0 01-1.414-1.414 2 2 0 000-2.828A1 1 0 0113 8z" clipRule="evenodd" />
    </svg>
  );

  const SkipForwardIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4.5 3.75a.75.75 0 00-1.5 0v12.5a.75.75 0 001.5 0V3.75zM16.28 9.53a.75.75 0 000-1.06l-4.5-4.5a.75.75 0 10-1.06 1.06L14.69 9l-3.97 3.97a.75.75 0 101.06 1.06l4.5-4.5z" />
    </svg>
  );

  const SkipBackwardIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M16.5 3.75a.75.75 0 00-1.5 0v12.5a.75.75 0 001.5 0V3.75zM3.72 9.53a.75.75 0 000-1.06l4.5-4.5a.75.75 0 111.06 1.06L5.31 9l3.97 3.97a.75.75 0 11-1.06 1.06l-4.5-4.5z" />
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const FolderIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const HeartIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  const ChatIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PencilIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const UploadIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );

  const VideoIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const CogIcon = () => (
    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg border-b border-red-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">ANP</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">FACTS ARE FACTS</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  // generateViewsData(recentUploads, e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>

              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  fetchVideos();
                  fetchComments();
                  // fetchLikeStats();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Refresh data"
              >
                <RefreshIcon />
              </motion.button>

              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5">
                  <SearchIcon />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">admin@anp.org</p>
                </div>
                
                {/* Change Password Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                  title="Change Password"
                >
                  <Lock size={18} />
                </motion.button>
                
                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogoutIcon />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-8 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
              <p className="text-red-100">You have {stats.totalVideos} total videos with {formatNumber(stats.totalViews)} views, {formatNumber(stats.totalLikes)} likes, and {formatNumber(stats.totalComments)} comments</p>
              <div className="flex items-center gap-4 mt-4">
                {/* <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <TrendingUpIcon />
                  <span className="text-sm">Engagement Rate: {stats.engagementRate}%</span>
                </div> */}
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format" 
                alt="Dashboard" 
                className="w-32 h-32 object-cover rounded-lg opacity-20"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Videos</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalVideos}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <VideoIcon />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.totalViews)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <EyeIcon />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-pink-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Likes</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.totalLikes)}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
                <HeartIcon />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Comments</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.totalComments)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <ChatIcon />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCategories}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <FolderIcon />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Link to="/admin/upload">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <UploadIcon />
                  <h3 className="text-lg font-semibold mt-3">Upload Podcast</h3>
                  <p className="text-sm text-red-100">Add new content to your channels</p>
                </div>
                <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all border border-gray-200"
            onClick={() => window.location.href = '/admin/videos'}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-600">
                  <VideoIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mt-3">Manage Podcasts</h3>
                <p className="text-sm text-gray-500">Edit or delete existing content</p>
              </div>
              <PencilIcon />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all border border-gray-200"
            onClick={() => window.location.href = '/admin/categories'}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-600">
                  <FolderIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mt-3">Categories</h3>
                <p className="text-sm text-gray-500">Manage your podcast channels</p>
              </div>
              <CogIcon />
            </div>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all border border-gray-200"
            onClick={() => setIsChangePasswordOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600">
                  <Lock size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mt-3">Security</h3>
                <p className="text-sm text-gray-500">Change password & settings</p>
              </div>
              <Settings size={20} className="text-gray-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Uploads and Comments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Uploads</h3>
              <button 
                onClick={fetchVideos}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
              >
                <RefreshIcon />
                <span className="ml-1">Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={fetchVideos}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                {recentUploads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CogIcon />
                    <p className="text-gray-500 mt-4">No uploads found. Start by uploading your first podcast!</p>
                    <Link to="/admin/upload">
                      <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Upload Now
                      </button>
                    </Link>
                  </div>
                ) : (
                  recentUploads.map((upload) => (
                    <motion.div
                      key={upload.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 cursor-pointer"
                      onClick={() => openVideoModal(upload)}
                    >
                      <div className="relative w-full sm:w-40 h-24 bg-gray-900 rounded-lg overflow-hidden group">
                        <img 
                          src={upload.thumbnail} 
                          alt={upload.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <PlayIcon />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <h4 className="font-semibold text-gray-800 truncate">{upload.title}</h4>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 flex-wrap gap-2">
                          <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                            <FolderIcon />
                            <span className="ml-1">{upload.category}</span>
                          </span>
                          <span className="flex items-center">
                            <EyeIcon />
                            <span className="ml-1">{formatNumber(upload.views)}</span>
                          </span>
                          <span className="flex items-center">
                            <HeartIcon />
                            <span className="ml-1">{formatNumber(upload.likes)}</span>
                          </span>
                          <span className="flex items-center">
                            <ChatIcon />
                            <span className="ml-1">{formatNumber(upload.comments)}</span>
                          </span>
                          <span className="flex items-center">
                            <ClockIcon />
                            <span className="ml-1">{upload.date}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => openVideoModal(upload)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="Play video"
                        >
                          <PlayIcon />
                        </button>
                        <button 
                          onClick={() => handleViewComments(upload)}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                          title="View comments"
                        >
                          <ChatIcon />
                        </button>
                        <button 
                          onClick={() => handleEdit(upload.id)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="Edit video"
                        >
                          <PencilIcon />
                        </button>
                        <button 
                          onClick={() => handleDelete(upload.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                          title="Delete video"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>

          {/* Recent Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Comments</h3>
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                {commentStats.totalComments} Total
              </span>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
              {commentStats.recentComments.length > 0 ? (
                commentStats.recentComments.map((comment, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <ChatIcon />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">{comment.videoTitle}</p>
                      <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {comment.user || 'Anonymous'} • {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start space-x-3 p-3">
                  <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <ChatIcon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">No comments yet</p>
                    <p className="text-xs text-gray-500 mt-1">Comments will appear here when users interact</p>
                  </div>
                </div>
              )}
            </div>

            {commentStats.mostCommentedVideo && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Most Engaging Video</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{commentStats.mostCommentedVideo.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {commentStats.mostCommentedVideo.commentCount} comments • {formatNumber(commentStats.mostCommentedVideo.likes)} likes
                </p>
              </div>
            )}

            <Link to="/admin/comments">
              <button className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                View All Comments
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {isModalOpen && selectedVideo && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleModalClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeVideoModal}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-red-600 rounded-full text-white transition-colors"
                title="Close (ESC)"
              >
                <CloseIcon />
              </button>

              {/* Video Title */}
              <div className="absolute top-4 left-4 z-20 text-white">
                <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-300">{selectedVideo.category}</p>
              </div>

              {/* Video Container */}
              <div className="relative aspect-video bg-black">
                {videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-red-400 font-medium">Failed to load video</p>
                      <p className="text-gray-400 text-sm mt-2">Please check the video URL or try again</p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={modalVideoRef}
                    src={selectedVideo.videoUrl}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={handleVideoError}
                    onClick={togglePlay}
                    playsInline
                  />
                )}

                {/* Custom Controls */}
                {!videoError && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
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
                        {/* Play/Pause */}
                        <button
                          onClick={togglePlay}
                          className="text-white hover:text-red-500 transition-colors"
                        >
                          {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        {/* Skip Backward */}
                        <button
                          onClick={skipBackward}
                          className="text-white hover:text-red-500 transition-colors"
                        >
                          <SkipBackwardIcon />
                        </button>

                        {/* Skip Forward */}
                        <button
                          onClick={skipForward}
                          className="text-white hover:text-red-500 transition-colors"
                        >
                          <SkipForwardIcon />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={toggleMute}
                            className="text-white hover:text-red-500 transition-colors"
                          >
                            {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
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

                        {/* Playback Speed */}
                        <button
                          onClick={changePlaybackSpeed}
                          className="px-2 py-1 bg-white/20 rounded text-white text-sm hover:bg-white/30 transition-colors"
                        >
                          {playbackSpeed}x
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Fullscreen */}
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-red-500 transition-colors"
                        >
                          <FullscreenIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Details */}
              <div className="bg-gray-900 p-4 text-white">
                <p className="text-sm text-gray-300 mb-2">{selectedVideo.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center">
                    <EyeIcon />
                    <span className="ml-1">{formatNumber(selectedVideo.views)} views</span>
                  </span>
                  <span className="flex items-center">
                    <HeartIcon />
                    <span className="ml-1">{formatNumber(selectedVideo.likes)} likes</span>
                  </span>
                  <span className="flex items-center">
                    <ChatIcon />
                    <span className="ml-1">{formatNumber(selectedVideo.comments)} comments</span>
                  </span>
                  <span className="flex items-center">
                    <ClockIcon />
                    <span className="ml-1">{selectedVideo.date}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && currentCommentVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowComments(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Comments</h3>
                  <p className="text-sm text-gray-500 mt-1">{currentCommentVideo.title}</p>
                </div>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {comments[currentCommentVideo.id]?.length > 0 ? (
                  <div className="space-y-4">
                    {comments[currentCommentVideo.id].map((comment, index) => (
                      <div key={index} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800">{comment.user || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-gray-600 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChatIcon />
                    <p className="text-gray-500 mt-4">No comments yet for this video</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default AdminDashboard;