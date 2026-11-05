const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  const preferredUri = process.env.MONGO_URI;

  try {
    if (!preferredUri) {
      throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(preferredUri);
    console.log('MongoDB connected');
    return;
  } catch (error) {
    if (process.env.USE_MEMORY_DB === 'false') {
      throw error;
    }

    const memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    process.env.MONGO_URI = memoryUri;

    await mongoose.connect(memoryUri);
    console.log('MongoDB connected using in-memory server');
  }
};

module.exports = connectDB;