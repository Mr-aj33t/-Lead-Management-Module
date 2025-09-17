const { Router } = require('express');
const { body } = require('express-validator');
const { createLead, getLeads, getLead, updateLead, deleteLead } = require('../controllers/leadController');
const logger = require('../utils/logger');

const router = Router();

// Simple middleware to log all requests
router.use((req, res, next) => {
    logger.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.body).length > 0) {
        logger.log('Request Body:', req.body);
    }
    next();
});

// Validation rules for creating a lead
const createLeadValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),

    body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9\-\+\(\)\s]+$/).withMessage('Please enter a valid phone number'),

    body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot be more than 500 characters')
];

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        logger.error('Error in route handler:', error);
        next(error);
    });
};

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Public
router.post('/', createLeadValidation, asyncHandler(createLead));

// @route   GET /api/leads
// @desc    Get all leads with pagination
// @access  Public
router.get('/', asyncHandler(getLeads));

// @route   GET /api/leads/:id
// @desc    Get a single lead
// @access  Public
router.get('/:id', asyncHandler(getLead));

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Public
router.put('/:id', asyncHandler(updateLead));

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Public
router.delete('/:id', asyncHandler(deleteLead));

// Errors are handled by the global error handler in index.js

module.exports = router;