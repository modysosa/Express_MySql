const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    admin: user.admin || false,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return { token, payload };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(name, email, hashedPassword);
    const { token, payload } = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      tokenPayload: payload,
      user,
    });
  } catch (error) {
    console.error("Register user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { token, payload } = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      // tokenPayload: payload,
      // user: {
      //   id: user.id,
      //   name: user.name,
      //   email: user.email,
      //   admin: user.admin,
      // },
    });
  } catch (error) {
    console.error("Login user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getUsersView = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    return res.render("user/users", {
      title: "All Users",
      users,
    });
  } catch (error) {
    console.error("Get users view error:", error.message);
    return res.status(500).send("Server error");
  }
};

const getProfileView = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    return res.render("user/profile", {
      title: "Profile",
      user,
    });
  } catch (error) {
    console.error("Get profile view error:", error.message);
    return res.status(500).send("Server error");
  }
};

const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user making the request is admin
    if (!req.user.admin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can make other users admins",
      });
    }

    const user = await userModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updated = await userModel.updateUserAdmin(userId, true);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: {
        id: userId,
        name: user.name,
        email: user.email,
        admin: true,
      },
    });
  } catch (error) {
    console.error("Make admin error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getProfile,
  getUsersView,
  getProfileView,
  makeAdmin,
};
