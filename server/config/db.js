const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async() => {
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            // logger.log('Using mock database for development');
            return;
        }

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // logger.log('Attempting to connect to MongoDB...');

        // Mask the password in the connection string for logging
        const maskedUri = process.env.MONGODB_URI.replace(
            /(mongodb\+srv:\/\/)([^:]+):([^@]+)@/,
            '$1$2:****@'
        );
        logger.log(`Connecting to: ${maskedUri}`);

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            family: 4,
        };

        // Set up event listeners before connecting
        mongoose.connection.on('connecting', () => {
            // logger.log('Connecting to MongoDB...');
        });

        mongoose.connection.on('connected', () => {
            // logger.log('MongoDB connected successfully!');
        });

        mongoose.connection.on('error', (err) => {
            // logger.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            // logger.log('MongoDB disconnected');
        });

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, options);

        logger.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

    } catch (error) {
        logger.error(`Failed to connect to MongoDB: ${error.message}`);

        // Provide more detailed error message for common issues
        // if (error.name === 'MongooseServerSelectionError') {
        //     logger.error('Server selection error suggestions:');
        //     logger.error('1. Check your connection string is correct');
        //     logger.error('2. Verify your MongoDB Atlas cluster is running');
        //     logger.error('3. Check if your IP is whitelisted in MongoDB Atlas');
        // }

        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;