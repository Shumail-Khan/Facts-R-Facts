import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function AdminEditVideo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchVideo();
    fetchCategories();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const res = await axios.get(`http://localhost:5000/api/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const video = res.data;
      setFormData({
        title: video.title || '',
        description: video.description || '',
        category: video.category?._id || video.category || '',
        thumbnail: video.thumbnail || '',
        videoUrl: video.videoUrl || ''
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError('Failed to load video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      
      await axios.put(`http://localhost:5000/api/videos/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert('Video updated successfully!');
      navigate('/admin');
    } catch (err) {
      console.error('Error updating video:', err);
      alert(err.response?.data?.message || 'Failed to update video. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Video</h1>
            <p className="text-red-100 text-sm mt-1">Update your video information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter thumbnail URL"
              />
              {formData.thumbnail && (
                <div className="mt-2">
                  <img 
                    src={formData.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-32 h-20 object-cover rounded-lg border border-gray-300"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video URL"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Video'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminEditVideo;