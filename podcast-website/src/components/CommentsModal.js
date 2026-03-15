import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XIcon, 
  UserIcon, 
  ChatAlt2Icon,
  EmojiHappyIcon,
  PaperAirplaneIcon
} from "@heroicons/react/outline";

const CommentsModal = ({ 
  isOpen, 
  onClose, 
  video, 
  comments = [], 
  onAddComment, 
  newComment, 
  setNewComment,
  isLoading = false 
}) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Scroll to bottom when new comment is added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!video) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
            ref={modalRef}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <ChatAlt2Icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Comments ({comments.length})
                    </h3>
                    <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                      {video.title}
                    </p>
                  </div>
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

            {/* Comments List */}
            <div className="h-96 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {comment.userAvatar ? (
                            <img
                              src={comment.userAvatar}
                              alt={comment.user || 'User'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">
                                {comment.user?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div className="flex items-baseline flex-wrap gap-2">
                            <span className="text-sm font-semibold text-white">
                              {comment.user || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                            {comment.text}
                          </p>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center space-x-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                              Like
                            </button>
                            <button className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <ChatAlt2Icon className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-300 font-medium">No comments yet</p>
                  <p className="text-gray-400 text-sm mt-1 max-w-xs">
                    Be the first to share your thoughts about this episode!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-700 bg-gray-750">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="w-full bg-gray-700 text-white rounded-xl pl-4 pr-12 py-3 text-sm border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <EmojiHappyIcon className="w-5 h-5 hover:text-red-400 cursor-pointer transition-colors" />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    newComment.trim() && !isLoading
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Post</span>
                  <PaperAirplaneIcon className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Character count and hints */}
              {newComment.length > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    {newComment.length}/500 characters
                  </span>
                  <span className="text-xs text-gray-400">
                    Press Enter to post
                  </span>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add prop types for better documentation
CommentsModal.defaultProps = {
  comments: [],
  isLoading: false,
  newComment: '',
  setNewComment: () => {},
  onAddComment: () => {}
};

export default CommentsModal;