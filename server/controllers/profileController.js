// controllers/profileController.js
import User from "../models/User.js";
import Profile from "../models/Profile.js";

export const getProfile = async (req, res) => {
  try {
    console.log("\n🔍 GET PROFILE DEBUG:");
    console.log("req.user from JWT:", req.user);
    console.log("userId from token:", req.user?.userId);
    
    const userId = req.user.userId;
    
    if (!userId) {
      console.log("❌ No userId found in token");
      return res.status(400).json({ msg: "Invalid token payload" });
    }
    
    console.log("🔍 Searching for user with ID:", userId);
    
    // Find user by ID, exclude password field
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ msg: "User not found" });
    }
    
    // Find profile for the user
    let profile = await Profile.findOne({ user: userId });
    
    console.log("🔍 Profile found:", profile);
    
    // Send combined user and profile data
    const responseData = {
      // User fields
      id: user._id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      avatarUrl: user.avatarUrl,
      role: user.role,
      
      // Profile fields (will be null if profile doesn't exist)
      dateOfBirth: profile?.dateOfBirth || null,
      gender: profile?.gender || null,
      heightCm: profile?.heightCm || null,
      weightKg: profile?.weightKg || null,
      goalWeightKg: profile?.goalWeightKg || null,
      goalDate: profile?.goalDate || null,
      activityLevel: profile?.activityLevel || null
    };
    
    console.log("✅ Sending combined response:", responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error("❌ Profile Controller Error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("\n🔍 UPDATE PROFILE DEBUG:");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    
    const userId = req.user.userId;
    const updates = req.body;
    
    // Separate user fields from profile fields
    const userFields = {};
    const profileFields = {};
    
    // User model fields that can be updated
    const userFieldNames = ['name', 'email', 'avatarUrl', 'role'];
    
    // Profile model fields that can be updated
    const profileFieldNames = ['dateOfBirth', 'gender', 'heightCm', 'weightKg', 'goalWeightKg', 'goalDate', 'activityLevel'];
    
    // Separate the fields
    Object.keys(updates).forEach(key => {
      if (userFieldNames.includes(key)) {
        userFields[key] = updates[key];
      } else if (profileFieldNames.includes(key)) {
        profileFields[key] = updates[key];
      }
    });
    
    console.log("🔍 User fields to update:", userFields);
    console.log("🔍 Profile fields to update:", profileFields);
    
    let updatedUser = null;
    let updatedProfile = null;
    
    // Update user fields if any
    if (Object.keys(userFields).length > 0) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        userFields,
        { new: true, runValidators: true }
      ).select("-password");
      
      if (!updatedUser) {
        return res.status(404).json({ msg: "User not found" });
      }
      console.log("✅ User updated:", updatedUser);
    } else {
      // Get current user data
      updatedUser = await User.findById(userId).select("-password");
    }
    
    // Update or create profile if any profile fields are provided
    if (Object.keys(profileFields).length > 0) {
      updatedProfile = await Profile.findOneAndUpdate(
        { user: userId },
        { ...profileFields, user: userId }, // Ensure user field is set
        { 
          new: true, 
          upsert: true, // Create if doesn't exist
          runValidators: true 
        }
      );
      console.log("✅ Profile updated/created:", updatedProfile);
    } else {
      // Get current profile data
      updatedProfile = await Profile.findOne({ user: userId });
    }
    
    // Return combined data
    const responseData = {
      // User fields
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      googleId: updatedUser.googleId,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      
      // Profile fields
      dateOfBirth: updatedProfile?.dateOfBirth || null,
      gender: updatedProfile?.gender || null,
      heightCm: updatedProfile?.heightCm || null,
      weightKg: updatedProfile?.weightKg || null,
      goalWeightKg: updatedProfile?.goalWeightKg || null,
      goalDate: updatedProfile?.goalDate || null,
      activityLevel: updatedProfile?.activityLevel || null
    };
    
    console.log("✅ Sending updated response:", responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};