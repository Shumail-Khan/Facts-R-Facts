import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import VideoCard from "../components/VideoCard";
import Navbar from "../components/Navbar";
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
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVideos, setLikedVideos] = useState({});

  // Category details based on slug
  const categoryDetails = {
    "red-mic": {
      name: "Red Mic",
      icon: <PlayIcon className="w-8 h-8 text-red-500" />,
      color: "from-red-500 to-orange-500",
      description: "Tech talks, innovations, and future trends",
      bgGradient: "from-red-900/30 to-orange-900/30",
      stats: {
        totalVideos: 12,
        totalViews: "45.2K",
        totalListeners: "12.5K"
      }
    },
    "qalanderNama": {
      name: "Qalander",
      icon: <MusicNoteIcon className="w-8 h-8 text-purple-500" />,
      color: "from-purple-500 to-pink-500",
      description: "Spiritual wisdom, poetry, and soulful music",
      bgGradient: "from-purple-900/30 to-pink-900/30",
      stats: {
        totalVideos: 8,
        totalViews: "32.8K",
        totalListeners: "9.2K"
      }
    },
    "tarikh-da-takr": {
      name: "Tarikh Da Takr",
      icon: <MusicNoteIcon className="w-8 h-8 text-blue-500" />,
      color: "from-blue-500 to-cyan-500",
      description: "Travel adventures and cultural explorations",
      bgGradient: "from-blue-900/30 to-cyan-900/30",
      stats: {
        totalVideos: 10,
        totalViews: "38.5K",
        totalListeners: "11.3K"
      }
    }
  };

  // Dummy videos data for Qalander category
  const dummyQalanderVideos = [
    {
      _id: "1",
      title: "Sufi Poetry Night: Rumi's Eternal Wisdom",
      description: "A mesmerizing night of Sufi poetry featuring classical renditions of Rumi's most beloved works. Experience the spiritual depth and mystical beauty of timeless verses.",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format",
      duration: "62:10",
      date: "2024-03-14",
      views: 12500,
      likes: 2345,
      comments: 189,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Rumi",
      language: "Persian/Urdu",
      featured: true
    },
    {
      _id: "2",
      title: "The Wisdom of Bulleh Shah",
      description: "Exploring the revolutionary poetry of Bulleh Shah, his teachings on love, unity, and spiritual enlightenment through powerful Kafis.",
      thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format",
      duration: "55:30",
      date: "2024-03-08",
      views: 11200,
      likes: 2156,
      comments: 178,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Bulleh Shah",
      language: "Punjabi",
      featured: true
    },
    {
      _id: "3",
      title: "Live Qawwali: Night of Ecstasy",
      description: "Live recording of traditional Qawwali performance with soul-stirring vocals and rhythmic clapping. Experience divine love through music.",
      thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format",
      duration: "75:45",
      date: "2024-03-01",
      views: 18300,
      likes: 3245,
      comments: 267,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Various",
      language: "Urdu",
      featured: true
    },
    {
      _id: "4",
      title: "Spiritual Meditation with Sufi Music",
      description: "Guided meditation accompanied by soothing Sufi instrumental music. Perfect for relaxation and spiritual connection.",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format",
      duration: "35:15",
      date: "2024-02-25",
      views: 7400,
      likes: 1432,
      comments: 89,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "N/A",
      language: "Instrumental"
    },
    {
      _id: "5",
      title: "Amir Khusro: The Father of Qawwali",
      description: "A deep dive into the life and works of Amir Khusro, the legendary poet and musician who pioneered Qawwali music.",
      thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format",
      duration: "48:20",
      date: "2024-02-18",
      views: 8900,
      likes: 1678,
      comments: 134,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Amir Khusro",
      language: "Persian/Hindi"
    },
    {
      _id: "6",
      title: "Sufi Whirling Dervishes Ceremony",
      description: "Witness the mesmerizing Sema ceremony of the Whirling Dervishes, a spiritual journey through music and dance.",
      thumbnail: "https://images.unsplash.com/photo-1545224147-b39e6c4d6b3c?w=800&auto=format",
      duration: "52:40",
      date: "2024-02-10",
      views: 15600,
      likes: 2890,
      comments: 215,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Rumi",
      language: "Turkish"
    },
    {
      _id: "7",
      title: "Hafez: The Master of Persian Poetry",
      description: "Exploring the profound ghazals of Hafez Shirazi, their mystical interpretations and timeless appeal.",
      thumbnail: "https://images.unsplash.com/photo-1532635241-8e0e4c2b0b5e?w=800&auto=format",
      duration: "41:15",
      date: "2024-02-03",
      views: 6800,
      likes: 1234,
      comments: 76,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Hafez",
      language: "Persian"
    },
    {
      _id: "8",
      title: "Contemporary Sufi Poetry Fusion",
      description: "Modern artists reinterpreting classical Sufi poetry with contemporary music and fresh perspectives.",
      thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format",
      duration: "58:30",
      date: "2024-01-27",
      views: 9200,
      likes: 1876,
      comments: 145,
      category: "Qalander",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      poet: "Various",
      language: "Multiple"
    }
  ];

  // Get current category details
  const currentCategory = categoryDetails[slug] || {
    name: slug?.charAt(0).toUpperCase() + slug?.slice(1),
    icon: <MusicNoteIcon className="w-8 h-8 text-purple-500" />,
    color: "from-purple-500 to-pink-500",
    description: "Explore amazing content in this category",
    bgGradient: "from-purple-900/30 to-pink-900/30"
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // For Qalander category, use dummy data
      if (slug === "qalanderNama") {
        setVideos(dummyQalanderVideos);
        setFilteredVideos(dummyQalanderVideos);
      } else {
        // For other categories, you can add more dummy data or fetch from API
        API.get(`/videos/${slug}`)
          .then(res => {
            setVideos(res.data);
            setFilteredVideos(res.data);
          })
          .catch(err => {
            console.error("Error fetching videos:", err);
            setVideos([]);
            setFilteredVideos([]);
          });
      }
      setLoading(false);
    }, 1000);
  }, [slug]);

  // Filter and sort videos
  useEffect(() => {
    let result = [...videos];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.poet && video.poet.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply duration filter
    if (selectedDuration !== "all") {
      result = result.filter(video => {
        const minutes = parseInt(video.duration.split(':')[0]);
        if (selectedDuration === "short") return minutes < 30;
        if (selectedDuration === "medium") return minutes >= 30 && minutes < 60;
        if (selectedDuration === "long") return minutes >= 60;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date) - new Date(a.date);
        case "popular":
          return b.views - a.views;
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          const aMin = parseInt(a.duration.split(':')[0]);
          const bMin = parseInt(b.duration.split(':')[0]);
          return aMin - bMin;
        default:
          return 0;
      }
    });

    setFilteredVideos(result);
  }, [videos, sortBy, selectedDuration, searchQuery]);

  const handleLike = (videoId) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MusicNoteIcon className="w-12 h-12 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-${currentCategory.bgGradient.split(' ')[1]} to-gray-900 overflow-hidden`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/5 rounded-full"
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

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative px-4 pt-20 pb-12 mx-auto max-w-7xl"
      >
        <div className={`bg-gradient-to-r ${currentCategory.color} rounded-3xl p-8 shadow-2xl`}>
          <div className="flex items-center gap-6 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="p-4 bg-white/20 rounded-2xl"
            >
              {currentCategory.icon}
            </motion.div>
            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                {currentCategory.name}
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-lg mt-2"
              >
                {currentCategory.description}
              </motion.p>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 max-w-2xl"
          >
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{filteredVideos.length}</div>
              <div className="text-sm text-white/70">Episodes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatNumber(filteredVideos.reduce((acc, v) => acc + v.views, 0))}
              </div>
              <div className="text-sm text-white/70">Total Views</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatNumber(filteredVideos.reduce((acc, v) => acc + v.likes, 0))}
              </div>
              <div className="text-sm text-white/70">Total Likes</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative px-4 mx-auto max-w-7xl mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search videos by title, description, or poet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort and Filter Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500"
              >
                <option value="latest">Latest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title A-Z</option>
                <option value="duration">Duration</option>
              </select>
              <AdjustmentsIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <FilterIcon className="w-5 h-5" />
              <span className="hidden md:inline">Filter</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Filter Videos</h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
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
                          className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                            selectedDuration === duration
                              ? `bg-gradient-to-r ${currentCategory.color} text-white`
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedDuration("all");
                        setSearchQuery("");
                      }}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
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
        initial="hidden"
        animate="visible"
        className="relative px-4 pb-20 mx-auto max-w-7xl"
      >
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video._id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className={`w-16 h-16 bg-gradient-to-r ${currentCategory.color} rounded-full flex items-center justify-center`}
                      >
                        <PlayIcon className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                    
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {video.duration}
                    </div>

                    {/* Featured badge */}
                    {video.featured && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 rounded text-xs text-white">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {video.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>

                    {/* Poet and Language tags */}
                    {video.poet && (
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                          {video.poet}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                          {video.language}
                        </span>
                      </div>
                    )}

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
                        {new Date(video.date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(video._id)}
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
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <ChatIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <MusicNoteIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No videos found in this category</p>
          </motion.div>
        )}
      </motion.div>

      {/* Floating Music Note */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`text-4xl bg-gradient-to-r ${currentCategory.color} p-3 rounded-full shadow-2xl`}
        >
          🎵
        </motion.div>
      </div>
    </div>
  );
}

export default CategoryVideos;