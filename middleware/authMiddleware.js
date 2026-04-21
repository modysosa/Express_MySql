const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    let token;

    // Check Authorization header first (for API calls)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.authToken) {
      // Fall back to cookie (for browser requests)
      token = req.cookies.authToken;
    }

    if (!token) {
      // For view routes, redirect to login. For API routes, return JSON error
      if (req.path.startsWith("/api")) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    // For view routes, redirect to login. For API routes, return JSON error
    if (req.path.startsWith("/api")) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    return res.redirect("/login");
  }
};

module.exports = protect;
