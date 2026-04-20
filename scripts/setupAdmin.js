const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("../config/db");
const userModel = require("../models/userModel");

const setupAdmin = async () => {
  try {
    console.log("Starting admin setup...");

    // Execute migration to add admin field
    console.log("Adding admin field to users table...");
    const connection = await db.getConnection();
    await connection.query(
      "ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT 0",
    );
    connection.release();
    console.log("✓ Admin field added successfully");

    // Create default admin user
    const adminEmail = "admin@admin.com";
    const adminPassword = "123456";
    const adminName = "Admin";

    const existingAdmin = await userModel.findUserByEmail(adminEmail);

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await userModel.createUser(
      adminName,
      adminEmail,
      hashedPassword,
      true,
    );

    console.log("✓ Admin user created successfully");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  ID: ${admin.id}`);
    console.log("\n⚠️  Please change this password after first login!");
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("✓ Admin field already exists");
    } else {
      console.error("Error during setup:", error.message);
    }
  }

  process.exit(0);
};

setupAdmin();
