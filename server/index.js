require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');

// Log environment variables (for debugging)
logger.log('Environment variables loaded:');
Object.keys(process.env).forEach(key => {
    if (key.startsWith('NODE_') || key === 'PORT' || key === 'NODE_ENV') {
        logger.log(`  ${key}=${process.env[key]}`);
    } else if (key === 'MONGODB_URI') {
        // Log a masked version of MongoDB URI for security
        const maskedUri = process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1****:****@');
        logger.log(`  MONGODB_URI=${maskedUri}`);
    }
});

// Import models first to ensure they are registered with Mongoose
require('./models');

// Then import the database connection
const connectDB = require('./config/db');
const leadRoutes = require('./routes/leads');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/leads', leadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Connect to database and start server
const startServer = async() => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5001;
        const server = app.listen(PORT, () => {
            logger.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error(`Unhandled Rejection: ${err.message}`);
            server.close(() => process.exit(1));
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

// Only start the server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = app; // For testing