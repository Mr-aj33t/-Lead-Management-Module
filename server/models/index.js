// Import all models
require('./Lead'); // This registers the Lead model with Mongoose

// require('./User');
// require('./OtherModel');

// Export mongoose so models can be imported directly from this file
module.exports = require('mongoose');