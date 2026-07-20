const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

// Submit contact form (Public)
exports.submitContact = catchAsync(async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    // Get IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Create contact entry
    const contact = await Contact.create({
        name,
        email,
        subject,
        message,
        ipAddress,
        userAgent
    });

    res.status(201).json({
        status: 'success',
        message: 'Your message has been sent successfully! We will get back to you soon.',
        data: {
            contact
        }
    });
});

// Get all contacts (Admin only)
exports.getAllContacts = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';

    // Build query
    let query = {};
    if (status !== 'all') {
        query.status = status;
    }

    // Get contacts with pagination
    const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const total = await Contact.countDocuments(query);

    res.status(200).json({
        status: 'success',
        results: contacts.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            contacts
        }
    });
});

// Get single contact (Admin only)
exports.getContact = catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        return next(new AppError('Contact message not found', 404));
    }

    // Mark as read if it's unread
    if (contact.status === 'unread') {
        contact.status = 'read';
        await contact.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        status: 'success',
        data: {
            contact
        }
    });
});

// Update contact status (Admin only)
exports.updateContactStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
        return next(new AppError('Invalid status value', 400));
    }

    const contact = await Contact.findById(id);

    if (!contact) {
        return next(new AppError('Contact message not found', 404));
    }

    contact.status = status;

    if (status === 'replied') {
        contact.repliedAt = Date.now();
    }

    await contact.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Contact status updated successfully',
        data: {
            contact
        }
    });
});

// Reply to contact (Admin only)
exports.replyContact = catchAsync(async (req, res, next) => {
    const { replyMessage } = req.body;
    const { id } = req.params;

    if (!replyMessage || replyMessage.trim().length === 0) {
        return next(new AppError('Reply message is required', 400));
    }

    const contact = await Contact.findById(id);

    if (!contact) {
        return next(new AppError('Contact message not found', 404));
    }

    contact.replyMessage = replyMessage;
    contact.status = 'replied';
    contact.repliedAt = Date.now();

    await contact.save({ validateBeforeSave: false });

    // Send email notification to user
    try {
        await sendEmail({
            email: contact.email,
            subject: `Re: ${contact.subject || 'Your message to Facts Are Facts'}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Facts Are Facts</h2>
          <p>Dear ${contact.name},</p>
          <p>Thank you for reaching out to us. Here is our response:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;">${replyMessage}</p>
          </div>
          <p>If you have any further questions, feel free to reply to this email.</p>
          <p>Best regards,<br><strong>Facts Are Facts Team</strong></p>
        </div>
      `
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        // Continue even if email fails
    }

    res.status(200).json({
        status: 'success',
        message: 'Reply sent successfully',
        data: {
            contact
        }
    });
});

// Delete contact (Admin only) - FIXED
exports.deleteContact = catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        return next(new AppError('Contact message not found', 404));
    }

    // Use deleteOne() instead of remove()
    await Contact.deleteOne({ _id: req.params.id });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get contact statistics (Admin only) - FIXED
exports.getContactStats = catchAsync(async (req, res, next) => {
    try {
        // Get all contacts with aggregation
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Initialize stats object with all statuses
        const result = {
            total: 0,
            unread: 0,
            read: 0,
            replied: 0,
            archived: 0
        };

        // Map the aggregation results
        stats.forEach(stat => {
            if (stat._id && result.hasOwnProperty(stat._id)) {
                result[stat._id] = stat.count;
                result.total += stat.count;
            }
        });

        // If no stats found, return default
        const unreadCount = await Contact.countDocuments({ status: 'unread' });

        // Get recent contacts for dashboard
        const recentContacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            status: 'success',
            data: {
                stats: result,
                unreadCount,
                recentContacts
            }
        });
    } catch (error) {
        console.error('Error getting contact stats:', error);
        // Return default stats if error
        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    total: 0,
                    unread: 0,
                    read: 0,
                    replied: 0,
                    archived: 0
                },
                unreadCount: 0,
                recentContacts: []
            }
        });
    }
});

// Bulk update contacts (Admin only)
exports.bulkUpdateContacts = catchAsync(async (req, res, next) => {
    const { contactIds, status } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
        return next(new AppError('Please provide contact IDs', 400));
    }

    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
        return next(new AppError('Invalid status value', 400));
    }

    const result = await Contact.updateMany(
        { _id: { $in: contactIds } },
        { status }
    );

    res.status(200).json({
        status: 'success',
        message: `${result.modifiedCount} contacts updated successfully`,
        data: {
            modifiedCount: result.modifiedCount
        }
    });
});