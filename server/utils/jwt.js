// utils/jwt.js
import jwt from "jsonwebtoken";

// Get the secret once and validate it
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

export const signToken = (payload, options = {}) => {
  const secret = getJWTSecret();
  console.log("JWT Sign - Secret:", secret, "Length:", secret.length);
  return jwt.sign(payload, secret, { expiresIn: "7d", ...options });
};

export const verifyToken = (token) => {
  const secret = getJWTSecret();
  console.log("JWT Verify - Secret:", secret, "Length:", secret.length);
  return jwt.verify(token, secret);
};

export const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};