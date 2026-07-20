import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  MailIcon,
  EyeIcon,
  CheckCircleIcon,
  ReplyIcon,
  TrashIcon,
  FilterIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  ExclamationIcon
} from "@heroicons/react/outline";

function AdminContact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0
  });

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [filter, page]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/contact?status=${filter}&page=${page}`);
      setContacts(response.data.data.contacts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get("/contact/stats");
      setStats(response.data.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleViewContact = async (contact) => {
    try {
      // Mark as read if unread
      if (contact.status === "unread") {
        await API.patch(`/contact/${contact._id}/status`, { status: "read" });
        contact.status = "read";
        fetchStats();
      }
      setSelectedContact(contact);
    } catch (error) {
      console.error("Error viewing contact:", error);
    }
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await API.patch(`/contact/${contactId}/status`, { status: newStatus });
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReply = async (contactId) => {
    if (!replyMessage.trim()) return;

    try {
      await API.post(`/contact/${contactId}/reply`, { replyMessage });
      setShowReplyModal(false);
      setReplyMessage("");
      fetchContacts();
      fetchStats();
      setSelectedContact(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await API.delete(`/contact/${contactId}`);
      fetchContacts();
      fetchStats();
      setSelectedContact(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "unread": return "bg-red-500";
      case "read": return "bg-yellow-500";
      case "replied": return "bg-green-500";
      case "archived": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MailIcon className="w-8 h-8 text-red-500" />
            Contact Messages
          </h1>
          <button
            onClick={() => { fetchContacts(); fetchStats(); }}
            className="p-2 bg-red-600/20 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
          </div>
          <div className="bg-red-900/20 rounded-xl p-4 border border-red-700/30">
            <p className="text-gray-400 text-sm">Unread</p>
            <p className="text-2xl font-bold text-red-500">{stats.unread || 0}</p>
          </div>
          <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-700/30">
            <p className="text-gray-400 text-sm">Read</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.read || 0}</p>
          </div>
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-700/30">
            <p className="text-gray-400 text-sm">Replied</p>
            <p className="text-2xl font-bold text-green-500">{stats.replied || 0}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {["all", "unread", "read", "replied", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === status
                  ? "bg-red-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {status === "all" ? "All Messages" : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <MailIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No messages found</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800/50 rounded-xl p-4 border ${
                  contact.status === "unread"
                    ? "border-red-500/30 bg-red-900/10"
                    : "border-gray-700"
                } hover:border-gray-600 transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)} flex-shrink-0`}></span>
                      <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                      <span className="text-gray-400 text-sm truncate">({contact.email})</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{contact.message}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{formatDate(contact.createdAt)}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-700">
                        {getStatusLabel(contact.status)}
                      </span>
                      {contact.repliedAt && (
                        <span className="text-green-400">✓ Replied</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {contact.status !== "replied" && (
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowReplyModal(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Reply"
                      >
                        <ReplyIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="View"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {contact.status !== "archived" && (
                      <button
                        onClick={() => handleStatusChange(contact._id, "archived")}
                        className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg ${
                  page === p
                    ? "bg-red-600 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedContact && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-xl max-w-lg w-full p-6 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Reply to {selectedContact.name}
                </h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">From:</strong> {selectedContact.email}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  <strong className="text-white">Message:</strong>
                </p>
                <p className="text-gray-300 text-sm mt-1">{selectedContact.message}</p>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your reply..."
                rows="5"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleReply(selectedContact._id)}
                  className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Send Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage("");
                  }}
                  className="flex-1 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Contact Modal */}
        {selectedContact && !showReplyModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-xl max-w-lg w-full p-6 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Message from {selectedContact.name}
                </h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">From</p>
                  <p className="text-white">{selectedContact.name} ({selectedContact.email})</p>
                </div>
                {selectedContact.subject && (
                  <div>
                    <p className="text-gray-400 text-sm">Subject</p>
                    <p className="text-white">{selectedContact.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm">Message</p>
                  <p className="text-white whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${getStatusColor(selectedContact.status)}`}>
                    {getStatusLabel(selectedContact.status)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Received</p>
                  <p className="text-gray-300">{formatDate(selectedContact.createdAt)}</p>
                </div>
                {selectedContact.replyMessage && (
                  <div>
                    <p className="text-gray-400 text-sm">Reply</p>
                    <p className="text-green-400">{selectedContact.replyMessage}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedContact.status !== "replied" && (
                  <button
                    onClick={() => setShowReplyModal(true)}
                    className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                )}
                {selectedContact.status === "unread" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedContact._id, "read");
                      setSelectedContact(null);
                    }}
                    className="flex-1 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="flex-1 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminContact;