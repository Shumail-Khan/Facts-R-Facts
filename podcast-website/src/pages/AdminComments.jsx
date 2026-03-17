import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await API.get("/videos/comments/all");
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await API.delete(`/videos/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Comments</h1>
          <p className="text-gray-400 text-sm">
            Manage and moderate all user comments
          </p>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-gray-400 text-center py-10">
              No comments found
            </div>
          ) : (
            comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-start gap-4"
              >
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold">
                      {c.user || "Anonymous"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-2">
                    {c.text}
                  </p>

                  <p className="text-xs text-gray-500">
                    Video:{" "}
                    <span className="text-gray-300">
                      {c.videoId?.title || "Unknown"}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div>
                  <button
                    onClick={() => deleteComment(c._id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AdminComments;