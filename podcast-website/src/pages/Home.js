import React, { useEffect, useState } from "react";
import API from "../services/api";
import CategoryCard from "../components/CategoryCard";
import Navbar from "../components/Navbar";
import VideoPlayer from "../components/VideoPlayer";
import ShareModal from "../components/ShareModal";
import CommentsModal from "../components/CommentsModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  MicrophoneIcon,
  MusicNoteIcon,
  PlayIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ChatIcon,
  ShareIcon
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid";

function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState({});
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareVideo, setShareVideo] = useState(null);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [currentCommentVideo, setCurrentCommentVideo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalCategories: 0,
    totalViews: 0
  });

  // Category icons mapping with red theme
  const categoryIcons = {
    "Red Mic": <MicrophoneIcon className="w-8 h-8 text-green-600" />,
    "Pukhtun Chronicles": <MusicNoteIcon className="w-8 h-8 text-green-500" />,
    "رشتیا رشتیا وی": <SparklesIcon className="w-8 h-8 text-green-400" />
  };

  // Default icon for categories without specific icon
  const defaultIcon = <SparklesIcon className="w-8 h-8 text-blue-500" />;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both videos and categories in parallel
      const [videosResponse, categoriesResponse] = await Promise.all([
        API.get("/videos"),
        API.get("/categories")
      ]);

      // console.log('Videos Response:', videosResponse.data);
      // console.log('Categories Response:', categoriesResponse.data);

      const videos = Array.isArray(videosResponse.data) ? videosResponse.data :
        (videosResponse.data.videos || []);

      const categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data :
        (categoriesResponse.data.categories || []);

      // Format videos
      // console.log(videos);
      const formattedVideos = videos.map(video => ({
        id: video._id,
        title: video.title || "Untitled",
        description: video.description || "No description available",
        thumbnail: video.thumbnailUrl || video.cloudinaryUrl || 'https://via.placeholder.com/500x280?text=No+Thumbnail',
        duration: formatDuration(video.duration),
        date: formatDateSafely(video.createdAt),
        views: video.views?.toString() || "0",
        likes: video.likes?.length || 0,
        comments: video.comments?.length || 0,
        videoUrl: video.videoUrl || video.cloudinaryUrl || '',
        category: video.category?.name || "Uncategorized",
        categoryId: video.category?._id || null
      }));

      // Filter out videos without valid URLs
      const validVideos = formattedVideos.filter(v => v.videoUrl);
      
      // Set featured videos (latest 6)
      const sortedVideos = [...validVideos].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setFeaturedVideos(sortedVideos.slice(0, 6));

      // Build categories with their videos
      const categoriesWithVideos = categoriesData.map(cat => {
        const categoryVideos = validVideos.filter(
          v => v.categoryId === cat._id || v.category === cat.name
        );

        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "Explore our amazing content",
          episodeCount: categoryVideos.length,
          videos: categoryVideos.slice(0, 4), // Show first 4 videos
          icon: categoryIcons[cat.name] || defaultIcon,
          image: cat.image || null
        };
      });

      // Add uncategorized videos if any
      const uncategorizedVideos = validVideos.filter(v => !v.categoryId && v.category === "Uncategorized");
      if (uncategorizedVideos.length > 0) {
        categoriesWithVideos.push({
          _id: "uncategorized",
          name: "Uncategorized",
          slug: "uncategorized",
          description: "Other amazing content",
          episodeCount: uncategorizedVideos.length,
          videos: uncategorizedVideos.slice(0, 4),
          icon: defaultIcon,
          image: null
        });
      }

      setCategories(categoriesWithVideos);

      // Calculate stats
      const totalViews = validVideos.reduce((acc, video) => acc + (parseInt(video.views) || 0), 0);
      setStats({
        totalVideos: validVideos.length,
        totalCategories: categoriesWithVideos.length,
        totalViews: totalViews
      });

      // Initialize comments state for each video
      const commentsState = {};
      validVideos.forEach(video => {
        commentsState[video.id] = [];
      });
      setComments(commentsState);

      setLoading(false);

    } catch (err) {
      console.error("Error fetching data:", err);

      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to the server. Please make sure the backend server is running.");
      } else if (err.response) {
        setError(`Server error: ${err.response.status}`);
      } else {
        setError("Failed to load data. Please try again.");
      }

      setLoading(false);
    }
  };

  const formatDateSafely = (dateValue) => {
    if (!dateValue) return getCurrentDate();

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return getCurrentDate();
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      return getCurrentDate();
    }
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = (e, video) => {
    e.stopPropagation();
    setSelectedVideo(video);
    document.body.style.overflow = 'hidden';
  };
  const handleClosePlayer = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'unset';
  };

  const handleLike = async (e, videoId) => {
    e.stopPropagation();
    try {
      setLikedVideos(prev => ({
        ...prev,
        [videoId]: !prev[videoId]
      }));

      await API.post(`/videos/${videoId}/like`);

      // Update like count in featured videos
      setFeaturedVideos(prev => prev.map(video =>
        video.id === videoId
          ? { ...video, likes: video.likes + (likedVideos[videoId] ? -1 : 1) }
          : video
      ));

      // Update like count in categories videos
      setCategories(prev => prev.map(category => ({
        ...category,
        videos: category.videos.map(video =>
          video.id === videoId
            ? { ...video, likes: video.likes + (likedVideos[videoId] ? -1 : 1) }
            : video
        )
      })));

    } catch (err) {
      console.error("Error liking video:", err);
      setLikedVideos(prev => ({
        ...prev,
        [videoId]: !prev[videoId]
      }));
    }
  };

  const handleShare = (e, video) => {
    e.stopPropagation();
    setShareVideo(video);
    setShowShareModal(true);
  };

  const handleShowComments = (e, video) => {
    e.stopPropagation();
    setCurrentCommentVideo(video);
    setShowComments(true);
    
    // Fetch comments for this video
    fetchComments(video.id);
  };

  const fetchComments = async (videoId) => {
    try {
      const response = await API.get(`/videos/${videoId}/comments`);
      setComments(prev => ({
        ...prev,
        [videoId]: response.data
      }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentCommentVideo) return;

    try {
      const response = await API.post(`/videos/${currentCommentVideo.id}/comments`, {
        text: newComment,
        user: "Anonymous" // You can replace with actual user name when auth is implemented
      });

      setComments(prev => ({
        ...prev,
        [currentCommentVideo.id]: [...(prev[currentCommentVideo.id] || []), response.data]
      }));

      // Update comment count in video
      setFeaturedVideos(prev => prev.map(video =>
        video.id === currentCommentVideo.id
          ? { ...video, comments: video.comments + 1 }
          : video
      ));

      setCategories(prev => prev.map(category => ({
        ...category,
        videos: category.videos.map(video =>
          video.id === currentCommentVideo.id
            ? { ...video, comments: video.comments + 1 }
            : video
        )
      })));

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';

    if (typeof num === 'string') {
      if (num.includes('K')) return num;
      if (num.includes('M')) return num;
      num = parseInt(num) || 0;
    }

    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              transition: {
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={handleClosePlayer}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <VideoPlayer
                video={selectedVideo}
                onClose={handleClosePlayer}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        video={shareVideo}
      />

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        video={currentCommentVideo}
        comments={comments[currentCommentVideo?.id] || []}
        onAddComment={handleAddComment}
        newComment={newComment}
        setNewComment={setNewComment}
      />

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 pt-20 pb-12 mx-auto max-w-7xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          <motion.div variants={itemVariants}>
            <img
              src="/Logo.jpeg"
              alt="AWAMI NATIONAL PARTY"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-red-500 shadow-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/160x160?text=Logo';
              }}
            />
          </motion.div>

          <div className="text-center md:text-left max-w-xl">
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Welcome to Facts Are Facts
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300"
            >
              Discover amazing stories from our exclusive channels
            </motion.p>

            {/* Dynamic Stats */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center md:justify-start gap-8 mt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {stats.totalVideos}
                </div>
                <div className="text-sm text-gray-400">Total Episodes</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {stats.totalCategories}
                </div>
                <div className="text-sm text-gray-400">Channels</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {formatNumber(stats.totalViews)}
                </div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Featured Videos Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 pb-12 mx-auto max-w-7xl"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
        >
          <PlayIcon className="w-8 h-8 text-red-500" />
          Featured Episodes
        </motion.h2>

        {featuredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700 hover:border-red-500/30 transition-all duration-300"
              >
                {/* Thumbnail with Play Button */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x280?text=No+Thumbnail';
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    onClick={(e) => handlePlayClick(e, video)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <PlayIcon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Duration badge */}
                  {video.duration && video.duration !== "00:00" && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {video.duration}
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-600/90 rounded text-xs text-white">
                    {video.category}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" />
                        {formatNumber(video.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChatIcon className="w-3 h-3" />
                        {video.comments}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {video.date}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(e, video.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {likedVideos[video.id] ? (
                        <HeartIconSolid className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                      <span className="text-xs">{formatNumber(video.likes)}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleShare(e, video)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleShowComments(e, video)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <ChatIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            No videos available yet. Check back soon!
          </div>
        )}
      </motion.div>

      {/* Categories Section - Dynamic from Database */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 pb-20 mx-auto max-w-7xl"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
        >
          <SparklesIcon className="w-8 h-8 text-red-300" />
          Our Channels
        </motion.h2>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            No channels available yet.
          </div>
        )}
      </motion.div>

      {/* Connect With Us Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 pb-20 mx-auto max-w-7xl"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
        >
          <SparklesIcon className="w-8 h-8 text-red-300" />
          Connect With Us
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-1/2 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="/Logo.jpeg"
                    alt="FACTS ARE FACTS"
                    className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/30"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/320x320?text=Facts+Are+Facts';
                    }}
                  />
                </motion.div>
              </div>

              <div className="w-full md:w-1/2 text-center md:text-left">
                <motion.h2
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white">
                    FACTS ARE FACTS
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-white/90 text-lg mb-8"
                >
                  Stay connected with us on social media for the latest updates and exclusive content
                </motion.p>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex flex-wrap justify-center md:justify-start gap-4"
                >
                  {/* Social media icons */}
                  <motion.a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </motion.a>

                  <motion.a
                    href="https://x.com/are_facts26663"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </motion.a>

                  <motion.a
                    href="https://www.instagram.com/factsarefactsstudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </motion.a>

                  <motion.a
                    href="https://www.youtube.com/@FactsareFactsstudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </motion.a>
                </motion.div>

                <motion.p
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-white/80 mt-6 text-sm"
                >
                  Follow us for daily updates and exclusive content
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl bg-red-600/20 backdrop-blur-lg p-3 rounded-full text-red-500"
        >
          🎙️
        </motion.div>
      </div>
    </div>
  );
}

export default Home;