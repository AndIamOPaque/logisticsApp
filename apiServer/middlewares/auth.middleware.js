import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const mockAuth = (req, res, next) => {
  // Check if the header exists
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ success: false, message: "DEV MODE: Missing 'x-user-id' header" });
  }

  // Inject the ID into req.user so your controller works without changes
  req.user = { 
    _id: userId,
    role: "admin" // You can even mock roles here if needed
  };

  next();
};

export const protectHardware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      errors: ['Unauthorized: API key missing.'] 
    });
  }

  if (apiKey !== process.env.SCANNER_API_KEY) {
    return res.status(401).json({ 
      success: false, 
      errors: ['Unauthorized: Invalid API key.'] 
    });
  }
  next();
};
export const protect = async (req, res, next) => {
  let token;

  // Check for "Bearer <token>" in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
         return res.status(401).json({ success: false, message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// 2. ADMIN ONLY (The VIP Rope)
// Blocks anyone who isn't an Admin.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Not authorized as an admin" });
  }
};