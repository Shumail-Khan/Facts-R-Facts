const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Validation rules for contact form
const contactValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('message').notEmpty().withMessage('Message is required').trim()
];

// Public route - Submit contact form
router.post('/', contactValidation, validate, contactController.submitContact);

// Admin routes - All require admin authentication
router.use(protectAdmin);

// Get all contacts with pagination and filtering
router.get('/', contactController.getAllContacts);

// Get contact statistics
router.get('/stats', contactController.getContactStats);

// Get single contact
router.get('/:id', contactController.getContact);

// Update contact status
router.patch('/:id/status', contactController.updateContactStatus);

// Reply to contact
router.post('/:id/reply', contactController.replyContact);

// Delete contact
router.delete('/:id', contactController.deleteContact);

// Bulk update contacts
router.post('/bulk-update', contactController.bulkUpdateContacts);

module.exports = router;