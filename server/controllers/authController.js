// controllers/authController.js
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1) Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email already in use" });

    // 2) Create & save
    user = new User({ name, email, password });
    await user.save();

    // 3) Create JWT & return using centralized utility
    const token = signToken({ userId: user._id });
    
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT using centralized utility
    const token = signToken({ userId: user._id });
    
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
};

export { signup, login };