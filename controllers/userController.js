const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const db = require("../config/db");

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

    // Set the token in a cookie
    res.cookie("authToken", token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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

    // Set the token in a cookie (http-only for security in production, but allowing JS access for now)
    res.cookie("authToken", token, {
      httpOnly: false, // Allow JavaScript access for now
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      tokenPayload: payload,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin || false,
      },
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

// Admin API Functions
const createUserAdmin = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create users",
      });
    }

    const { name, email, password, isAdmin } = req.body;

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
    const user = await userModel.createUser(
      name,
      email,
      hashedPassword,
      isAdmin || false,
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user admin error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUserAdminAPI = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update users",
      });
    }

    const { userId } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser && existingUser.id != userId) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const updated = await userModel.updateUser(userId, name, email);
    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { id: userId, name, email },
    });
  } catch (error) {
    console.error("Update user admin error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteUserAdmin = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete users",
      });
    }

    const { userId } = req.params;

    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete yourself",
      });
    }

    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deleted = await userModel.deleteUser(userId);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user admin error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin View Functions
const getAdminDashboard = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send("Access denied");
    }

    const users = await userModel.getAllUsers();

    return res.render("admin/dashboard", {
      title: "Admin Dashboard",
      users,
      currentUser: req.user,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).send("Server error");
  }
};

const getCreateUserPage = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send("Access denied");
    }

    return res.render("admin/create-user", {
      title: "Create User",
      currentUser: req.user,
    });
  } catch (error) {
    console.error("Create user page error:", error.message);
    return res.status(500).send("Server error");
  }
};

const getEditUserPage = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send("Access denied");
    }

    const { userId } = req.params;
    const user = await userModel.findUserById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    return res.render("admin/edit-user", {
      title: "Edit User",
      user,
      currentUser: req.user,
    });
  } catch (error) {
    console.error("Edit user page error:", error.message);
    return res.status(500).send("Server error");
  }
};

const postCreateUser = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send("Access denied");
    }

    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).render("admin/create-user", {
        title: "Create User",
        error: "Name, email and password are required",
        currentUser: req.user,
      });
    }

    if (password.length < 6) {
      return res.status(400).render("admin/create-user", {
        title: "Create User",
        error: "Password must be at least 6 characters",
        currentUser: req.user,
      });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).render("admin/create-user", {
        title: "Create User",
        error: "User already exists with this email",
        currentUser: req.user,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.createUser(name, email, hashedPassword, isAdmin === "on");

    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Post create user error:", error.message);
    return res.status(500).send("Server error");
  }
};

const postUpdateUser = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send("Access denied");
    }

    const { userId } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email) {
      const user = await userModel.findUserById(userId);
      return res.status(400).render("admin/edit-user", {
        title: "Edit User",
        user,
        error: "Name and email are required",
        currentUser: req.user,
      });
    }

    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser && existingUser.id != userId) {
      return res.status(400).render("admin/edit-user", {
        title: "Edit User",
        user: { ...user, name, email },
        error: "Email already in use",
        currentUser: req.user,
      });
    }

    await userModel.updateUser(userId, name, email);

    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);
    }

    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Post update user error:", error.message);
    return res.status(500).send("Server error");
  }
};

const postDeleteUser = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send("Access denied");
    }

    const { userId } = req.params;

    if (userId == req.user.id) {
      return res.status(400).send("Cannot delete yourself");
    }

    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    await userModel.deleteUser(userId);
    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Post delete user error:", error.message);
    return res.status(500).send("Server error");
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    return res.render("user/dashboard", {
      title: "User Dashboard",
      user,
    });
  } catch (error) {
    console.error("Get user dashboard error:", error.message);
    return res.status(500).send("Server error");
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getProfile,
  getUsersView,
  getProfileView,
  getUserDashboard,
  makeAdmin,
  createUserAdmin,
  updateUserAdminAPI,
  deleteUserAdmin,
  getAdminDashboard,
  getCreateUserPage,
  getEditUserPage,
  postCreateUser,
  postUpdateUser,
  postDeleteUser,
};
