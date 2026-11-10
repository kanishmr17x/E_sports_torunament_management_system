const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME = 'admin' } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured');
    }

    if (process.env.NODE_ENV === 'production' && process.env.DB_NAME === 'esports_db') {
      throw new Error("CRITICAL: Production cannot use development database 'esports_db'. Please specify DB_NAME=esports_db_prod.");
    }

    // Connect to MongoDB using centralized connection module
    await connectDB();
    console.log(`Connected to MongoDB [${mongoose.connection.name}]`);

    // Check if admin already exists by email or username
    const existingAdmin = await User.findOne({
      $or: [
        { email: ADMIN_EMAIL.toLowerCase().trim() },
        { username: ADMIN_USERNAME.trim() }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close(false);
      process.exit(0);
    }

    // Create admin user (password is hashed automatically by pre-save hook)
    const admin = await User.create({
      username: ADMIN_USERNAME.trim(),
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      role: 'admin'
    });

    console.log(`Admin user created successfully: ${admin.username}`);
    await mongoose.connection.close(false);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    try {
      await mongoose.connection.close(false);
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
};

createAdmin();
