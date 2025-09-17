const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Import the model
const mongoose = require('mongoose');

// Get the appropriate model based on environment
let LeadModel;
if (process.env.USE_MOCK_DB === 'true') {
    LeadModel = require('../models/mockLeadModel').MockLead;
} else {
    // This ensures the model is properly registered with Mongoose
    const Lead = require('../models/Lead');
    LeadModel = mongoose.models.Lead || Lead;
}

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public
const createLead = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors in createLead:', errors.array());
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }

    try {
        const { name, email, phone, status = 'new', notes = '' } = req.body;

        // phone number validation
        if (phone.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be at least 10 digits',
                field: 'phone'
            });
        }

        if (phone.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 digits allowed for phone number',
                field: 'phone'
            });
        }

        if (!/^\d+$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Only numbers are allowed in phone number',
                field: 'phone'
            });
        }

        const newLead = new LeadModel({
            name,
            email,
            phone,
            status,
            notes
        });

        const savedLead = await newLead.save();
        logger.info(`New lead created: ${savedLead._id}`);

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: savedLead
        });
    } catch (error) {
        logger.error('Error in createLead:', error);

        if (error.code === 11000) { // Duplicate key error
            const field = error.message.includes('email') ? 'email' : 'phone';
            return res.status(400).json({
                success: false,
                message: `A lead with this ${field} already exists`,
                field: field
            });
        }

        // For other errors
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating the lead',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Public
const getLeads = async(req, res, next) => {
    try {
        const startTime = Date.now();
        const { page = 1, limit = 10, status } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        const options = {
            page: parseInt(page, 10),
            limit: Math.min(parseInt(limit, 10), 100), // Max 100 items per page
            sort: { createdAt: -1 },
            lean: true,
            collation: {
                locale: 'en',
                strength: 2
            },
            select: '-__v' // Exclude version key
        };

        // For mock database, we need to handle pagination differently
        if (process.env.USE_MOCK_DB === 'true') {
            const allLeads = await LeadModel.find(query).sort(options.sort).lean();
            const startIndex = (options.page - 1) * options.limit;
            const endIndex = startIndex + options.limit;

            const result = {
                docs: allLeads.slice(startIndex, endIndex),
                totalDocs: allLeads.length,
                limit: options.limit,
                page: options.page,
                totalPages: Math.ceil(allLeads.length / options.limit),
                pagingCounter: (options.page - 1) * options.limit + 1,
                hasPrevPage: options.page > 1,
                hasNextPage: endIndex < allLeads.length,
                prevPage: options.page > 1 ? options.page - 1 : null,
                nextPage: endIndex < allLeads.length ? options.page + 1 : null
            };

            const responseTime = Date.now() - startTime;
            logger.log(`[PERF] getLeads took ${responseTime}ms`);

            res.status(200).json({
                success: true,
                count: result.docs.length,
                data: result.docs,
                page: result.page,
                totalPages: result.totalPages,
                totalItems: result.totalDocs,
                responseTime: `${responseTime}ms`
            });
        } else {
            // Real MongoDB with pagination
            const result = await LeadModel.paginate(query, options);

            const responseTime = Date.now() - startTime;
            logger.log(`[PERF] getLeads took ${responseTime}ms`);

            res.status(200).json({
                success: true,
                count: result.docs.length,
                data: result.docs,
                page: result.page,
                totalPages: result.totalPages,
                totalItems: result.totalDocs,
                responseTime: `${responseTime}ms`
            });
        }
    } catch (error) {
        logger.error('Error in getLeads:', error);
        next(error);
    }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Public
const getLead = async(req, res, next) => {
    try {
        const lead = await LeadModel.findById(req.params.id);

        if (!lead) {
            logger.warn(`Lead not found with id: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        logger.info(`Lead retrieved successfully: ${lead._id}`);
        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        logger.error('Error in getLead:', error);
        next(error);
    }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Public
const updateLead = async(req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedLead = await LeadModel.findByIdAndUpdate(
            id,
            updates, { new: true, runValidators: true }
        );

        if (!updatedLead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        logger.info(`Lead updated: ${updatedLead._id}`);
        res.status(200).json({
            success: true,
            data: updatedLead
        });
    } catch (error) {
        logger.error('Error in updateLead:', error);
        next(error);
    }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Public
const deleteLead = async(req, res, next) => {
    try {
        const { id } = req.params;
        const deletedLead = await LeadModel.findByIdAndDelete(id);

        if (!deletedLead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        logger.info(`Lead deleted: ${deletedLead._id}`);
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error('Error in deleteLead:', error);
        next(error);
    }
};

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead };