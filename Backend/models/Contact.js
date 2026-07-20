const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  repliedAt: {
    type: Date,
    default: null
  },
  replyMessage: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });

// Static method to get unread count
contactSchema.statics.getUnreadCount = async function() {
  return this.countDocuments({ status: 'unread' });
};

// Static method to get contact stats
contactSchema.statics.getContactStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    if (stat._id) {
      result[stat._id] = stat.count;
    }
    result.total += stat.count;
  });
  
  return result;
};

// Method to mark as read
contactSchema.methods.markAsRead = async function() {
  if (this.status === 'unread') {
    this.status = 'read';
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Contact', contactSchema);