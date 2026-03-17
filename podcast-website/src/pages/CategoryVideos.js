import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import Navbar from "../components/Navbar";
import VideoPlayer from "../components/VideoPlayer";
import ShareModal from "../components/ShareModal";
import CommentsModal from "../components/CommentsModal";

import {
  MusicNoteIcon,
  FilterIcon,
  RefreshIcon,
  PlayIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ChatIcon,
  ShareIcon,
  AdjustmentsIcon,
  XIcon
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid";

function CategoryVideos() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVideos, setLikedVideos] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareVideo, setShareVideo] = useState(null);

  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [currentCommentVideo, setCurrentCommentVideo] = useState(null);
  const [newComment, setNewComment] = useState("");

  // Fetch category + videos from API
  useEffect(() => {
    setLoading(true);
    API.get(`/categories/slug/${slug}`)
      .then(res => {
        const { category, videos } = res.data;
        setCategory(category);
        setVideos(videos);
        setFilteredVideos(videos);
      })
      .catch(err => {
        console.error("Error fetching category:", err);
        setCategory(null);
        setVideos([]);
        setFilteredVideos([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // console.log('Fetched Category:', category);
  // console.log('Fetched Videos:', videos);
  // Filter and sort videos
  useEffect(() => {
    if (!videos) return;
    let result = [...videos];

    if (searchQuery) {
      result = result.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.poet && v.poet.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedDuration !== "all") {
      result = result.filter(video => {
        const minutes = parseInt(video.duration.split(":")[0]);
        if (selectedDuration === "short") return minutes < 30;
        if (selectedDuration === "medium") return minutes >= 30 && minutes < 60;
        if (selectedDuration === "long") return minutes >= 60;
        return true;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date) - new Date(a.date);
        case "popular":
          return b.views - a.views;
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          return parseInt(a.duration.split(":")[0]) - parseInt(b.duration.split(":")[0]);
        default:
          return 0;
      }
    });

    setFilteredVideos(result);
  }, [videos, sortBy, selectedDuration, searchQuery]);

  const handlePlayClick = (e, video) => {
    e.stopPropagation();
    setSelectedVideo(video);
    document.body.style.overflow = "hidden";
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "unset";
  };

  const handleLike = async (e, videoId) => {
    e.stopPropagation();

    const isLiked = likedVideos[videoId];
    const newLikedState = !isLiked;

    // optimistic update
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: newLikedState
    }));

    setFilteredVideos(prev =>
      prev.map(video =>
        video._id === videoId
          ? { ...video, likes: video.likes + (newLikedState ? 1 : -1) }
          : video
      )
    );

    try {
      await API.post(`/videos/${videoId}/like`);
    } catch (err) {
      console.error("Like error:", err);

      // rollback
      setLikedVideos(prev => ({
        ...prev,
        [videoId]: isLiked
      }));

      setFilteredVideos(prev =>
        prev.map(video =>
          video._id === videoId
            ? { ...video, likes: video.likes + (isLiked ? 1 : -1) }
            : video
        )
      );
    }
  };

  const handleShare = (e, video) => {
    e.stopPropagation();

    setShareVideo({
      ...video,
      thumbnail: video.thumbnailUrl
    });

    setShowShareModal(true);
  };

  const handleShowComments = (e, video) => {
    e.stopPropagation();
    setCurrentCommentVideo(video);
    setShowComments(true);
    if (!comments[video._id]) {
      fetchComments(video._id);
    }
  };

  const fetchComments = async (videoId) => {
    try {
      const res = await API.get(`/videos/${videoId}/comments`);
      setComments(prev => ({
        ...prev,
        [videoId]: res.data
      }));
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentCommentVideo) return;

    try {
      const res = await API.post(
        `/videos/${currentCommentVideo._id}/comments`,
        {
          text: newComment,
          user: "Anonymous"
        }
      );

      setComments(prev => ({
        ...prev,
        [currentCommentVideo._id]: [
          ...(prev[currentCommentVideo._id] || []),
          res.data
        ]
      }));

      setFilteredVideos(prev =>
        prev.map(video =>
          video._id === currentCommentVideo._id
            ? { ...video, comments: (video.comments || 0) + 1 }
            : video
        )
      );

      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

  // console.log("Current Category:", filteredVideos);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MusicNoteIcon className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) return <p className="text-white text-center py-20">Category not found.</p>;

  // Red Mic theme
  const themeColor = "from-red-700 to-red-700";

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      <Navbar />
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
              onClick={(e) => e.stopPropagation()}
            >
              <VideoPlayer
                video={selectedVideo}
                onClose={handleClosePlayer}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ CORRECT: Separate modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        video={shareVideo}
      />

      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        video={currentCommentVideo}
        comments={comments[currentCommentVideo?._id] || []}
        onAddComment={handleAddComment}
        newComment={newComment}
        setNewComment={setNewComment}
      />

      {/* Category Header */}
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative px-4 pt-20 pb-12 mx-auto max-w-7xl">
        <div className={`bg-gradient-to-r ${themeColor} rounded-3xl p-8 shadow-2xl`}>
          <div className="flex items-center gap-6 mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", stiffness: 100, delay: 0.2 }} className="p-4 bg-white/20 rounded-2xl">
              <PlayIcon className="w-8 h-8 text-red-500" />
            </motion.div>
            <div>
              <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-bold text-white">
                {category.name}
              </motion.h1>
              <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-white/80 text-lg mt-2">
                {category.description}
              </motion.p>
            </div>
          </div>

          {/* Stats */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{filteredVideos.length}</div>
              <div className="text-sm text-white/70">Episodes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{formatNumber(filteredVideos.reduce((acc, v) => acc + v.views, 0))}</div>
              <div className="text-sm text-white/70">Total Views</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{formatNumber(filteredVideos.reduce((acc, v) => acc + v.likes, 0))}</div>
              <div className="text-sm text-white/70">Total Likes</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative px-4 mx-auto max-w-7xl mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search videos by title, description, or poet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="latest">Latest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title A-Z</option>
                <option value="duration">Duration</option>
              </select>
              <AdjustmentsIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilterOpen(!filterOpen)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              <span className="hidden md:inline">Filter</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {filterOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="mt-4 p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Filter Videos</h3>
                  <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-white">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Duration</label>
                    <div className="flex gap-3">
                      {["all", "short", "medium", "long"].map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-4 py-2 rounded-lg capitalize transition-colors ${selectedDuration === duration ? `bg-gradient-to-r ${themeColor} text-white` : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => { setSelectedDuration("all"); setSearchQuery(""); }} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                      <RefreshIcon className="w-4 h-4" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Videos Grid */}
      <motion.div
        variants={containerVariants}
        initial={false} // prevent re-animations
        animate="visible"
        className="relative px-4 pb-20 mx-auto max-w-7xl"
      >
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredVideos.map((video) => (
                <motion.div
                  key={video._id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="relative aspect-video min-h-[150px] overflow-hidden">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handlePlayClick(e, video)}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className={`w-16 h-16 bg-gradient-to-r ${themeColor} rounded-full flex items-center justify-center`}
                        >
                          <PlayIcon className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {video.duration}
                        </div>
                      )}
                      {video.featured && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 rounded text-xs text-white">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">{video.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                      {video.poet && (
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-300">{video.poet}</span>
                          <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">{video.language}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" />{formatNumber(video.views)}</span>
                          <span className="flex items-center gap-1"><ChatIcon className="w-3 h-3" />{video.comments}</span>
                        </div>
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{new Date(video.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleLike(e, video._id)}
                          className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {likedVideos[video._id] ? (
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
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShowComments(e, video)}
                          className="text-gray-400 hover:text-green-500 transition-colors"
                        >
                          <ChatIcon className="w-4 h-4" />
                        </motion.button>

                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <MusicNoteIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No videos found in this category</p>
          </motion.div>
        )}
      </motion.div>
      {/* Floating Music Note */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`text-4xl bg-gradient-to-r ${themeColor} p-3 rounded-full shadow-2xl`}
        >
          🎵
        </motion.div>
      </div>
    </div>
  );
}

export default CategoryVideos;