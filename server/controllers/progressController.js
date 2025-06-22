// server/controllers/progressController.js
import Progress from "../models/Progress.js";

export const addProgress = async (req, res) => {
  try {
    console.log("=== DEBUG: addProgress called ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log("ERROR: No authenticated user found");
      return res.status(401).json({ msg: "User not authenticated" });
    }
    
    // Create the progress entry
    const progressData = { 
      user: req.user._id, 
      ...req.body 
    };
    console.log("Progress data to save:", progressData);
    
    const entry = new Progress(progressData);
    console.log("Created Progress instance:", entry);
    
    await entry.save();
    console.log("Successfully saved progress entry:", entry);
    
    res.status(201).json(entry);
  } catch (err) {
    console.error("=== ERROR in addProgress ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    
    // Send more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: "Validation error", 
        details: err.message 
      });
    }
    
    res.status(500).json({ 
      msg: "Could not record progress", 
      error: err.message 
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    console.log("=== DEBUG: getProgress called ===");
    console.log("req.user:", req.user);
    console.log("req.user keys:", Object.keys(req.user || {})); // ADD THIS LINE
    console.log("req.body:", req.body);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }
    
    const data = await Progress.find({ user: req.user._id }).sort("date");
    console.log("Found progress data:", data);
    
    res.json(data);
  } catch (err) {
    console.error("=== ERROR in getProgress ===");
    console.error(err);
    res.status(500).json({ msg: "Could not fetch progress" });
  }
};