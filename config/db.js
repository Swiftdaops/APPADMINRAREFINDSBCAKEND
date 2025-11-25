const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Missing required environment variable: MONGO_URI.\nPlease create a `.env` file in the backend root (copy `.env.example`) and set MONGO_URI to your MongoDB connection string.');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Default Admin Seeder (defensive)
    const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME;
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (defaultUsername && defaultPassword) {
      try {
        const adminExists = await Admin.findOne({ username: defaultUsername });
        if (!adminExists) {
          try {
            const admin = await Admin.create({
              username: defaultUsername,
              password: defaultPassword,
              role: 'superadmin'
            });
            console.log(`✅ Default Admin created: ${admin.username} / ${defaultPassword}`);
          } catch (createErr) {
            // If a duplicate key error occurs (e.g., unique index on a different field),
            // log it and continue. This avoids crashing the whole server because of
            // seeding race conditions or legacy indexes in the database.
            if (createErr && createErr.code === 11000) {
              console.warn('⚠️ Default Admin seeder: duplicate key detected, skipping creation.', createErr.keyValue || createErr.message);
            } else {
              console.warn('⚠️ Default Admin seeder: failed to create admin:', createErr && createErr.message);
            }
        }
        } else {
          console.log('ℹ️ Default Admin already exists');
        }
      } catch (findErr) {
        console.warn('⚠️ Default Admin seeder: lookup failed:', findErr && findErr.message);
      }
    } else {
      console.log('ℹ️ DEFAULT_ADMIN_USERNAME or DEFAULT_ADMIN_PASSWORD not set; skipping default admin seeder');
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
