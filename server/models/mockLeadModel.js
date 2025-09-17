const logger = require('../utils/logger');

// In-memory database for development/testing that mimics Mongoose
let leads = [
  {
    _id: '1',
    id: '1',
    name: 'Initial Mock Lead 1',
    email: 'mock1@example.com',
    phone: '123-456-7890',
    status: 'new',
    notes: 'This is a pre-seeded mock lead.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    id: '2',
    name: 'Initial Mock Lead 2',
    email: 'mock2@example.com',
    phone: '098-765-4321',
    status: 'contacted',
    notes: 'This is another pre-seeded mock lead.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


class MockQuery {
  constructor(results) {
    // Ensure we have a proper array of results
    this.results = Array.isArray(results) ? [...results] : [];
    this.sortField = null;
    this.sortOrder = 1;
    this.limitCount = null;
    this.skipCount = 0;
    
    logger.log(`MockQuery created with ${this.results.length} initial results`);
  }

  sort(sortObj) {
    if (sortObj && typeof sortObj === 'object') {
      const [field, order] = Object.entries(sortObj)[0];
      this.sortField = field;
      this.sortOrder = order === -1 ? -1 : 1;
    }
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  skip(count) {
    this.skipCount = count;
    return this;
  }

  lean() {
    // Mongoose's lean() returns a query, so we do the same.
    return this;
  }

  // Make the MockQuery class "thenable" to work with async/await
  then(onFulfilled, onRejected) {
    logger.debug('MockQuery.then called, executing query...');
    return this.exec().then(onFulfilled, onRejected);
  }

  async exec() {
    try {
      logger.log('DEBUG: Executing mock query with results:', JSON.stringify(this.results, null, 2));
      
      // Create a deep copy of results to avoid modifying the original
      let finalResults = JSON.parse(JSON.stringify(this.results || []));
      
      // Ensure we have an array
      if (!Array.isArray(finalResults)) {
        logger.warn('Expected results to be an array, got:', typeof finalResults);
        finalResults = [];
      }
      
      logger.log(`Processing ${finalResults.length} results`);
      
      // Apply sorting if specified
      if (this.sortField) {
        logger.log(`Sorting by ${this.sortField} in ${this.sortOrder > 0 ? 'ascending' : 'descending'} order`);
        
        finalResults.sort((a, b) => {
          if (!a || !b) return 0;
          
          let aVal = a[this.sortField];
          let bVal = b[this.sortField];
          
          // Handle undefined or null values
          if (aVal === undefined || aVal === null) return 1;
          if (bVal === undefined || bVal === null) return -1;
          
          // Handle date sorting
          if (this.sortField.toLowerCase().includes('date') || 
              this.sortField === 'createdAt' || 
              this.sortField === 'updatedAt') {
            try {
              aVal = new Date(aVal).getTime();
              bVal = new Date(bVal).getTime();
            } catch (e) {
              logger.error('Error parsing dates:', e);
              return 0;
            }
          }
          
          // Handle string comparison
          if (aVal < bVal) return -1 * this.sortOrder;
          if (aVal > bVal) return 1 * this.sortOrder;
          return 0;
        });
      }
      
      // Apply skip and limit
      if (this.skipCount > 0) {
        logger.log(`Skipping first ${this.skipCount} results`);
        finalResults = finalResults.slice(this.skipCount);
      }
      
      if (this.limitCount !== null) {
        logger.log(`Limiting to ${this.limitCount} results`);
        finalResults = finalResults.slice(0, this.limitCount);
      }
      
      // Ensure we return a proper array
      const result = Array.isArray(finalResults) ? finalResults : [];
      logger.log(`Returning ${result.length} results`);
      
      return result;
      
    } catch (error) {
      logger.error('Error in MockQuery.exec:', error);
      return [];
    }
  }
}

// Export the leads array and a reset function for consistent state management
const initialLeads = [
  {
    _id: '1',
    id: '1',
    name: 'Initial Mock Lead 1',
    email: 'mock1@example.com',
    phone: '123-456-7890',
    status: 'new',
    notes: 'This is a pre-seeded mock lead.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    id: '2',
    name: 'Initial Mock Lead 2',
    email: 'mock2@example.com',
    phone: '098-765-4321',
    status: 'contacted',
    notes: 'This is another pre-seeded mock lead.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let leadsDB = JSON.parse(JSON.stringify(initialLeads));
let idCounter = leadsDB.length + 1;

const resetDatabase = () => {
  leadsDB = JSON.parse(JSON.stringify(initialLeads));
  idCounter = leadsDB.length + 1;
  logger.log('Mock database has been reset.');
};

class MockLead {
  constructor(data) {
    this.data = data ? { ...data } : {};
    this.isNew = !this.data._id;
  }

  async save() {
    const now = new Date().toISOString();
    if (this.isNew) {
      this.data._id = (idCounter++).toString();
      this.data.id = this.data._id;
      this.data.createdAt = now;
      this.data.updatedAt = now;
      this.data.status = this.data.status || 'new';
      leadsDB.push({ ...this.data });
      logger.debug(`Created new lead with ID: ${this.data._id}`);
    } else {
      this.data.updatedAt = now;
      const index = leadsDB.findIndex(lead => lead._id === this.data._id);
      if (index !== -1) {
        leadsDB[index] = { ...leadsDB[index], ...this.data };
        logger.debug(`Updated lead with ID: ${this.data._id}`);
      } else {
        throw new Error(`Lead with ID ${this.data._id} not found`);
      }
    }
    return this;
  }

  static find(query = {}) {
    let results = JSON.parse(JSON.stringify(leadsDB));
    if (Object.keys(query).length > 0) {
      results = results.filter(lead => 
        Object.entries(query).every(([key, value]) => lead[key] === value)
      );
    }
    return new MockQuery(results);
  }

  static findOne(query = {}) {
    const result = leadsDB.find(lead =>
      Object.entries(query).every(([key, value]) => {
        if (key === '$or' && Array.isArray(value)) {
          return value.some(cond => Object.keys(cond).some(k => lead[k] === cond[k]));
        }
        return lead[key] === value;
      })
    );
    return Promise.resolve(result || null);
  }

  static async countDocuments(query = {}) {
    const results = await this.find(query).exec();
    return results.length;
  }

  static findByIdAndUpdate(id, update, options = {}) {
    const index = leadsDB.findIndex(lead => lead._id === id);
    if (index === -1) return null;
    leadsDB[index] = { ...leadsDB[index], ...update, updatedAt: new Date().toISOString() };
    return options.new ? leadsDB[index] : leadsDB[index];
  }

  static findByIdAndDelete(id) {
    const index = leadsDB.findIndex(lead => lead._id === id);
    if (index === -1) return null;
    const [deletedLead] = leadsDB.splice(index, 1);
    return deletedLead;
  }
}

module.exports = { MockLead, resetDatabase };
