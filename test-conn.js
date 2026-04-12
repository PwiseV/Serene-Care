require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

async function testConnections() {
    console.log("Testing connections...");
    let success = true;

    // Test MongoDB
    try {
        console.log("1. Testing MongoDB...");
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env");
        
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ MongoDB Connection Successful!");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        success = false;
    }

    // Test Cloudinary
    try {
        console.log("\n2. Testing Cloudinary...");
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
             throw new Error("Cloudinary missing credentials");
        }
        
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            console.log("✅ Cloudinary Connection Successful!");
        } else {
            throw new Error("Unexpected ping response");
        }
    } catch (err) {
        console.error("❌ Cloudinary Connection Failed:", err.message);
        success = false;
    }

    process.exit(success ? 0 : 1);
}

testConnections();
