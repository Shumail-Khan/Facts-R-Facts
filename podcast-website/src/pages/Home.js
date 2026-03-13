import React, { useEffect, useState } from "react";
import API from "../services/api";
import CategoryCard from "../components/CategoryCard";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
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

  // Category icons mapping with red theme
  const categoryIcons = {
    "Red Mic": <MicrophoneIcon className="w-8 h-8 text-red-600" />,
    "QalanderNamaa": <MusicNoteIcon className="w-8 h-8 text-red-500" />,
    "Tarikh Da Takr": <SparklesIcon className="w-8 h-8 text-red-400" />
  };

  // Dummy videos data for each category
  const dummyVideos = {
    "Red Mic": [
      {
        id: 1,
        title: "The Future of Technology",
        description: "Exploring AI, Blockchain, and the next big tech revolution with industry experts",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780a5c6b7e?w=500&auto=format",
        duration: "45:30",
        date: "2024-03-15",
        views: "12.5K",
        likes: 2345,
        comments: 189,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Red Mic"
      },
      {
        id: 2,
        title: "Startup Success Stories",
        description: "How these entrepreneurs built million-dollar companies from scratch",
        thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&auto=format",
        duration: "52:15",
        date: "2024-03-10",
        views: "8.2K",
        likes: 1567,
        comments: 98,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Red Mic"
      },
      {
        id: 3,
        title: "Digital Marketing Masterclass",
        description: "Learn the secrets of successful online marketing campaigns",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format",
        duration: "38:45",
        date: "2024-03-05",
        views: "15.8K",
        likes: 2890,
        comments: 234,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Red Mic"
      },
      {
        id: 4,
        title: "Cybersecurity Trends 2024",
        description: "Protecting your digital assets in the modern age",
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format",
        duration: "41:20",
        date: "2024-02-28",
        views: "6.9K",
        likes: 1234,
        comments: 67,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Red Mic"
      }
    ],
    "Qalander": [
      {
        id: 5,
        title: "Sufi Poetry Night",
        description: "Beautiful renditions of classical Sufi poetry with modern interpretations",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format",
        duration: "62:10",
        date: "2024-03-14",
        views: "9.7K",
        likes: 1876,
        comments: 145,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Qalander"
      },
      {
        id: 6,
        title: "The Wisdom of Rumi",
        description: "Exploring the timeless teachings of the great poet Rumi",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format",
        duration: "55:30",
        date: "2024-03-08",
        views: "11.2K",
        likes: 2156,
        comments: 178,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Qalander"
      },
      {
        id: 7,
        title: "Qawwali Night Live",
        description: "Live recording of traditional Qawwali performance",
        thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&auto=format",
        duration: "75:45",
        date: "2024-03-01",
        views: "18.3K",
        likes: 3245,
        comments: 267,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Qalander"
      },
      {
        id: 8,
        title: "Spiritual Meditation Guide",
        description: "Guided meditation with spiritual music",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format",
        duration: "35:15",
        date: "2024-02-25",
        views: "7.4K",
        likes: 1432,
        comments: 89,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Qalander"
      }
    ],
    "Naama": [
      {
        id: 9,
        title: "Travel Diaries: Mountains",
        description: "Exploring the world's most beautiful mountain ranges",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format",
        duration: "48:20",
        date: "2024-03-12",
        views: "14.6K",
        likes: 2678,
        comments: 198,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Naama"
      },
      {
        id: 10,
        title: "Street Food Adventure",
        description: "Tasting the best street food from around the world",
        thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format",
        duration: "42:35",
        date: "2024-03-07",
        views: "21.3K",
        likes: 3890,
        comments: 312,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Naama"
      },
      {
        id: 11,
        title: "Hidden Gems of Asia",
        description: "Discovering lesser-known travel destinations",
        thumbnail: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=500&auto=format",
        duration: "58:40",
        date: "2024-02-29",
        views: "10.8K",
        likes: 1987,
        comments: 156,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Naama"
      },
      {
        id: 12,
        title: "Cultural Festivals Guide",
        description: "Best cultural festivals to experience this year",
        thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format",
        duration: "39:55",
        date: "2024-02-22",
        views: "9.1K",
        likes: 1654,
        comments: 123,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Naama"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Create categories with their videos
      const categoriesData = [
        {
          _id: "1",
          name: "Red Mic",
          description: "Tech talks, innovations, and future trends",
          episodeCount: dummyVideos["Red Mic"].length,
          videos: dummyVideos["Red Mic"],
          icon: categoryIcons["Red Mic"]
        },
        {
          _id: "2",
          name: "QalanderNamaa",
          description: "Spiritual wisdom, poetry, and soulful music",
          episodeCount: dummyVideos["Qalander"].length,
          videos: dummyVideos["Qalander"],
          icon: categoryIcons["QalanderNamaa"]
        },
        {
          _id: "3",
          name: "Tarikh Da Takr",
          description: "Travel adventures and cultural explorations",
          episodeCount: dummyVideos["Naama"].length,
          videos: dummyVideos["Naama"],
          icon: categoryIcons["Tarikh Da Takr"]
        }
      ];

      setCategories(categoriesData);

      // Set featured videos (mix from all categories)
      const allVideos = [
        ...dummyVideos["Red Mic"],
        ...dummyVideos["Qalander"],
        ...dummyVideos["Naama"]
      ];
      setFeaturedVideos(allVideos.slice(0, 6));

      setLoading(false);
    }, 1500);
  }, []);

  const handleLike = (videoId) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const formatNumber = (num) => {
    if (typeof num === 'string') {
      if (num.includes('K')) return num;
      if (num.includes('M')) return num;
    }
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

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Animated background particles - lighter for dark bg */}
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

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 pt-20 pb-12 mx-auto max-w-7xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">

          {/* Logo Left */}
          <motion.div variants={itemVariants}>
            <img
              src="/Logo.jpeg"
              alt="AWAMI NATIONAL PARTY"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-red-500 shadow-lg"
            />
          </motion.div>

          {/* Right Content */}
          <div className="text-center md:text-left max-w-xl">

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
             
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300"
            >
              Discover amazing stories from our three exclusive channels
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center md:justify-start gap-8 mt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">12</div>
                <div className="text-sm text-gray-400">Total Episodes</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-white">3</div>
                <div className="text-sm text-gray-400">Channels</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-white">2.5K+</div>
                <div className="text-sm text-gray-400">Listeners</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700 hover:border-red-500/30 transition-all duration-300">
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
                      className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <PlayIcon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {video.duration}
                  </div>

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
                      {new Date(video.date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(video.id)}
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
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <ChatIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Categories Section */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
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

        {/* FACTS ARE FACTS Social Media Section - Keeping it Red */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left side - Image */}
              <div className="w-full md:w-1/2 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="Logo.jpeg"
                    alt="FACTS ARE FACTS"
                    className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/30"
                  />
                </motion.div>
              </div>

              {/* Right side - Text and Social Links */}
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

                {/* Social Media Links */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex flex-wrap justify-center md:justify-start gap-4"
                >
                  {/* Facebook */}
                  <motion.a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </motion.a>

                  {/* Twitter/X */}
                  <motion.a
                    href="https://x.com/are_facts26663"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </motion.a>

                  {/* Instagram */}
                  <motion.a
                    href="https://www.instagram.com/factsarefactsstudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </motion.a>

                  {/* YouTube */}
                  <motion.a
                    href="https://www.youtube.com/@FactsareFactsstudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </motion.a>

                  {/* TikTok */}
                  <motion.a
                    href="https://www.tiktok.com/@factsarefactsstud"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.88-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.36 1.51-1.42 2.49-.05.71.11 1.42.44 2.02.45.8 1.33 1.39 2.24 1.46.93.08 1.88-.27 2.54-.96.51-.54.82-1.28.84-2.03.08-3.16.01-6.32.02-9.47 1.36.92 2.96 1.47 4.63 1.45.02-.94.01-1.89.03-2.83.02-1.4-.02-2.8.01-4.2.06-.14.12-.28.19-.41.46-.85 1.32-1.48 2.28-1.61.43-.06.87-.08 1.31-.08z"/>
                    </svg>
                  </motion.a>
                </motion.div>

                {/* Follow text */}
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