const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/leadmanager', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

testConnection();