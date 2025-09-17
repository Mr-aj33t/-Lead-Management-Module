const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const phoneValidator = [{
        validator: function(v) {
            // First check if it's exactly 10 digits
            if (v.length === 10) {
                return /^\d+$/.test(v);
            }
            return false;
        },
        message: 'Please enter exactly 10 digits'
    },
    {
        validator: function(v) {
            // Check if less than 10 digits
            return v.length >= 10;
        },
        message: 'Phone number must be at least 10 digits'
    },
    {
        validator: function(v) {
            // Check if more than 10 digits
            return v.length <= 10;
        },
        message: 'Maximum 10 digits allowed'
    },
    {
        validator: function(v) {
            // Check if contains only numbers
            return /^\d+$/.test(v);
        },
        message: 'Only numbers are allowed'
    }
];

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        index: true,
        validate: phoneValidator
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost'],
        default: 'new',
        index: true
    },
    notes: { type: String, maxlength: 500 },
    source: { type: String, default: 'web' }
}, {
    timestamps: true,
    validateBeforeSave: true
});

// Add indexes for common query patterns
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, createdAt: -1 });

// Add pagination plugin to the schema
leadSchema.plugin(mongoosePaginate);

// Create and export the model
const Lead = mongoose.model('Lead', leadSchema);

// Create indexes in the background for better performance
Lead.createIndexes().catch(err => {
    console.error('Error creating indexes:', err);
});

module.exports = Lead;