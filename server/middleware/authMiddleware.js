// middleware/authMiddleware.js
import { verifyToken, decodeToken } from "../utils/jwt.js";

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth Middleware: No valid Authorization header found");
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    console.log("Auth Middleware: Token received:", token);
    
    // Debug: decode token without verification first
    const decodedInfo = decodeToken(token);
    console.log("Auth Middleware: Token header:", decodedInfo?.header);
    console.log("Auth Middleware: Token payload:", decodedInfo?.payload);

    // Verify token using centralized utility
    const decoded = verifyToken(token);
    console.log("Auth Middleware: Token successfully verified, decoded:", decoded);
    
    // FIX: Structure req.user to match what controllers expect
    req.user = {
      _id: decoded.userId,  // Map userId to _id
      userId: decoded.userId // Keep original for backward compatibility
    };
    
    console.log("Auth Middleware: Set req.user to:", req.user);
    next();
  } catch (error) {
    console.error("Auth Middleware: TOKEN VERIFICATION FAILED. Error:", error.message);
    console.error("Auth Middleware: Full error:", error);
    
    // More specific error messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: "Token expired" });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: "Invalid token" });
    } else {
      return res.status(401).json({ msg: "Token verification failed" });
    }
  }
};

export default auth;