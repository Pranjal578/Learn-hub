const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { seedDefaultUsers } = require('../utils/seedUsers');
const { resetClassrooms } = require('../utils/resetDb');

exports.connectDB = async () => {
    try {
        console.log('Connecting to Primary MongoDB Database...');
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 3000,
        });
        console.log('Database connected successfully');
        await seedDefaultUsers();
    } catch (error) {
        console.log(`Primary Database connection error: ${error.message}`);
        console.log('Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/learnhub)...');
        try {
            await mongoose.disconnect();
            await mongoose.connect('mongodb://127.0.0.1:27017/learnhub', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 2000,
            });
            console.log('Local Database connected successfully');
            await seedDefaultUsers();
        } catch (fallbackError) {
            console.log('Primary and local fallback MongoDB failed. Starting persistent database engine...');
            try {
                await mongoose.disconnect();
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const dbPath = path.join(__dirname, '../data/db');
                if (!fs.existsSync(dbPath)) {
                    fs.mkdirSync(dbPath, { recursive: true });
                }

                const mongoServer = await MongoMemoryServer.create({
                    instance: {
                        dbPath: dbPath,
                        storageEngine: 'wiredTiger',
                    }
                });
                const mongoUri = mongoServer.getUri();
                console.log(`Persistent local database started at: ${mongoUri} (Data stored in ${dbPath})`);
                await mongoose.connect(mongoUri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log('Persistent Local Database connected successfully');
                await seedDefaultUsers();
            } catch (inMemoryError) {
                console.log('Persistent database start error, attempting zero-config in-memory fallback:', inMemoryError.message);
                try {
                    await mongoose.disconnect();
                    const { MongoMemoryServer } = require('mongodb-memory-server');
                    const mongoServer = await MongoMemoryServer.create();
                    const mongoUri = mongoServer.getUri();
                    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
                    console.log('In-memory Database connected successfully');
                    await seedDefaultUsers();
                } catch (e) {
                    console.error('Database connection failed:', e.message);
                }
            }
        }
    }
};
