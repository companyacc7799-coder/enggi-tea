// Run this script once to create the first admin account for local development:
//
//   npm run seed:admin
//
// It reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env if present,
// otherwise falls back to the defaults below. Change the defaults or add
// those variables to your .env before running if you want a different admin.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const ADMIN_NAME = process.env.ADMIN_NAME || "MathVault Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mathvault.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`An account with email "${ADMIN_EMAIL}" already exists.`);
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("Existing account has been promoted to admin.");
      } else {
        console.log("That account is already an admin. Nothing to do.");
      }
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log("You can now log in with these credentials via POST /api/auth/login");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin account:", error.message);
    process.exit(1);
  }
};

seedAdmin();
