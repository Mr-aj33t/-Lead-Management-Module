const fs = require('fs');
const path = require('path');
const util = require('util');

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'server.log');
const errorFile = path.join(logDir, 'error.log');

// Function to write to log file synchronously
function writeToFile(file, message) {
    try {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        // Write synchronously to ensure logs are captured
        fs.appendFileSync(file, logMessage, { flag: 'a' });

        // Also write to console
        if (file === errorFile) {
            process.stderr.write(logMessage);
        } else {
            process.stdout.write(logMessage);
        }
    } catch (err) {
        // If we can't write to the log file, at least write to console
        console.error('Error writing to log file:', err);
        console.log('Original message:', message);
    }
}

// Custom logger
const logger = {
    log(...args) {
        const message = util.format(...args);
        writeToFile(logFile, message);
    },

    info(...args) {
        this.log(...args);
    },

    error(...args) {
        const message = util.format(...args);
        writeToFile(errorFile, `ERROR: ${message}`);
    },

    warn(...args) {
        const message = util.format(...args);
        writeToFile(logFile, `WARN: ${message}`);
    },

    // Add a debug method that only logs in development
    debug(...args) {
        if (process.env.NODE_ENV === 'development') {
            const message = util.format(...args);
            writeToFile(logFile, `DEBUG: ${message}`);
        }
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err.stack || err);
    // Give it a moment to write the log before exiting
    setTimeout(() => process.exit(1), 100);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason instanceof Error ? reason.stack : reason);
});

// Log process start
logger.log('='.repeat(80));
logger.log('Process started with PID:', process.pid);
logger.log('Node version:', process.version);
logger.log('Current directory:', process.cwd());
logger.log('Environment:', process.env.NODE_ENV || 'development');
logger.log('='.repeat(80));

module.exports = logger;