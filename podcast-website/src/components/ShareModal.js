import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  LinkIcon,
  CheckIcon,
  ShareIcon,
  QrcodeIcon
} from "@heroicons/react/outline";
import { FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaLinkedin, FaReddit, FaEnvelope } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

const ShareModal = ({ isOpen, onClose, video }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!video) return null;

  const sharePlatforms = [
    {
      name: "Facebook",
      icon: <FaFacebook className="w-5 h-5" />,
      color: "bg-[#1877F2]",
      hoverColor: "hover:bg-[#0E5FBF]",
      getUrl: (url, title) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="w-5 h-5" />,
      color: "bg-[#1DA1F2]",
      hoverColor: "hover:bg-[#0C85D0]",
      getUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5" />,
      color: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20B859]",
      getUrl: (url, title) => {
        if (isMobile) {
          return `whatsapp://send?text=${encodeURIComponent(title + ' ' + url)}`;
        }
        return `https://web.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
      }
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="w-5 h-5" />,
      color: "bg-[#0088cc]",
      hoverColor: "hover:bg-[#0077B5]",
      getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="w-5 h-5" />,
      color: "bg-[#0A66C2]",
      hoverColor: "hover:bg-[#0949A0]",
      getUrl: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: "Reddit",
      icon: <FaReddit className="w-5 h-5" />,
      color: "bg-[#FF4500]",
      hoverColor: "hover:bg-[#E03D00]",
      getUrl: (url, title) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    },
    {
      name: "Email",
      icon: <FaEnvelope className="w-5 h-5" />,
      color: "bg-gray-600",
      hoverColor: "hover:bg-gray-700",
      getUrl: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(title + '\n\n' + url)}`
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(video.videoUrl);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = video.videoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }
  };

  const handleShare = (platform) => {
    const url = platform.getUrl(video.videoUrl, video.title);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: video.videoUrl
        });
        onClose(); // Close modal after successful share
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <ShareIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Share Episode
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                  aria-label="Close modal"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Video Info */}
              <div className="mb-6 p-4 bg-gray-750 rounded-xl border border-gray-700">
                <div className="flex items-start space-x-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {video.title}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Native Share Button (Mobile) */}
              {navigator.share && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNativeShare}
                  className="w-full mb-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Share via...</span>
                </motion.button>
              )}

              {/* Link Copy Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={video.videoUrl}
                      readOnly
                      className="w-full bg-gray-700 text-white rounded-xl pl-4 pr-10 py-3 text-sm border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                    />
                    <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* QR Code Toggle */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full mb-4 bg-gray-700 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <QrcodeIcon className="w-4 h-4" />
                <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
              </button>

              {/* QR Code */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                      <QRCodeSVG
                        value={video.videoUrl}
                        size={160}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Scan to share on mobile
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social Media Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {sharePlatforms.map((platform, index) => (
                    <motion.button
                      key={platform.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare(platform)}
                      className={`${platform.color} ${platform.hoverColor} text-white py-3 px-2 rounded-xl transition-all duration-200 flex flex-col items-center space-y-1 shadow-lg`}
                      title={`Share on ${platform.name}`}
                    >
                      {platform.icon}
                      <span className="text-xs font-medium">{platform.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* View Count */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                  👁️ {video.views} views • Share and spread the knowledge!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add prop types for better documentation
ShareModal.defaultProps = {
  video: null
};

export default ShareModal;