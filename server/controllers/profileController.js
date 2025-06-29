// controllers/profileController.js - Enhanced Debug Version
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import mongoose from 'mongoose';

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
      profileName: profile?.name || null,
      age: profile?.age || null,
      dateOfBirth: profile?.dateOfBirth || null,
      gender: profile?.gender || null,
      heightCm: profile?.heightCm || null,
      weightKg: profile?.weightKg || null,
      activityLevel: profile?.activityLevel || null,
      goal: profile?.goal || null,
      goalWeightKg: profile?.goalWeightKg || null,
      goalDate: profile?.goalDate || null,
      preferences: profile?.preferences || null,
      bmr: profile?.bmr || null,
      tdee: profile?.tdee || null,
      onboardingCompleted: profile?.onboardingCompleted || false,
      onboardingCompletedAt: profile?.onboardingCompletedAt || null
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
    console.log("\n🔍 UPDATE PROFILE DEBUG - ENHANCED:");
    console.log("=".repeat(50));
    
    // 1. Check if req.user exists
    console.log("1. req.user:", req.user);
    console.log("2. req.user type:", typeof req.user);
    console.log("3. req.user.userId:", req.user?.userId);
    console.log("4. req.body:", JSON.stringify(req.body, null, 2));
    
    // 5. Check database connection
    console.log("5. Mongoose connection state:", mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (!req.user || !req.user.userId) {
      console.log("❌ FATAL: No userId found in token");
      return res.status(401).json({ msg: "Invalid authentication token" });
    }
    
    const userId = req.user.userId;
    const updates = req.body;
    
    // 6. Verify user exists first
    console.log("6. Checking if user exists...");
    const existingUser = await User.findById(userId);
    console.log("7. User exists:", !!existingUser);
    console.log("8. User ID from DB:", existingUser?._id);
    
    if (!existingUser) {
      console.log("❌ FATAL: User not found in database");
      return res.status(404).json({ msg: "User not found in database" });
    }
    
    // Separate user fields from profile fields
    const userFields = {};
    const profileFields = {};
    
    const userFieldNames = ['name', 'email', 'avatarUrl', 'role'];
    const profileFieldNames = [
      'name', 'age', 'dateOfBirth', 'gender', 'heightCm', 'weightKg', 
      'activityLevel', 'goal', 'goalWeightKg', 'goalDate', 'preferences',
      'bmr', 'tdee', 'onboardingCompleted', 'onboardingCompletedAt'
    ];
    
    Object.keys(updates).forEach(key => {
      if (userFieldNames.includes(key)) {
        userFields[key] = updates[key];
      } else if (profileFieldNames.includes(key)) {
        profileFields[key] = updates[key];
      }
    });
    
    console.log("9. User fields to update:", userFields);
    console.log("10. Profile fields to update:", profileFields);
    
    let updatedUser = null;
    let updatedProfile = null;
    
    // Update user fields if any
    if (Object.keys(userFields).length > 0) {
      console.log("11. Updating user fields...");
      updatedUser = await User.findByIdAndUpdate(
        userId,
        userFields,
        { new: true, runValidators: true }
      ).select("-password");
      
      if (!updatedUser) {
        console.log("❌ FATAL: Failed to update user");
        return res.status(404).json({ msg: "Failed to update user" });
      }
      console.log("12. ✅ User updated successfully");
    } else {
      updatedUser = await User.findById(userId).select("-password");
    }
    
    // Update or create profile if any profile fields are provided
    if (Object.keys(profileFields).length > 0) {
      console.log("13. Updating/creating profile...");
      console.log("14. Profile data to save:", profileFields);
      
      // Check if profile already exists
      const existingProfile = await Profile.findOne({ user: userId });
      console.log("15. Existing profile found:", !!existingProfile);
      
      try {
        updatedProfile = await Profile.findOneAndUpdate(
          { user: userId },
          { ...profileFields, user: userId },
          { 
            new: true, 
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
          }
        );
        console.log("16. ✅ Profile updated/created successfully");
        console.log("17. Profile ID:", updatedProfile._id);
        console.log("18. Profile user field:", updatedProfile.user);
      } catch (profileError) {
        console.log("❌ FATAL: Profile save failed");
        console.log("19. Profile error:", profileError.message);
        console.log("20. Profile error stack:", profileError.stack);
        
        // Try to create manually if upsert failed
        if (!existingProfile) {
          console.log("21. Attempting manual profile creation...");
          const newProfile = new Profile({
            ...profileFields,
            user: userId
          });
          updatedProfile = await newProfile.save();
          console.log("22. ✅ Manual profile creation successful");
        } else {
          throw profileError;
        }
      }
    } else {
      updatedProfile = await Profile.findOne({ user: userId });
    }
    
    // Verify the data was actually saved
    console.log("23. Verifying saved data...");
    const verifyProfile = await Profile.findOne({ user: userId });
    console.log("24. Profile verification:", !!verifyProfile);
    console.log("25. Profile data after save:", verifyProfile);
    
    // Return combined data
    const responseData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      googleId: updatedUser.googleId,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      
      profileName: updatedProfile?.name || null,
      age: updatedProfile?.age || null,
      dateOfBirth: updatedProfile?.dateOfBirth || null,
      gender: updatedProfile?.gender || null,
      heightCm: updatedProfile?.heightCm || null,
      weightKg: updatedProfile?.weightKg || null,
      activityLevel: updatedProfile?.activityLevel || null,
      goal: updatedProfile?.goal || null,
      goalWeightKg: updatedProfile?.goalWeightKg || null,
      goalDate: updatedProfile?.goalDate || null,
      preferences: updatedProfile?.preferences || null,
      bmr: updatedProfile?.bmr || null,
      tdee: updatedProfile?.tdee || null,
      onboardingCompleted: updatedProfile?.onboardingCompleted || false,
      onboardingCompletedAt: updatedProfile?.onboardingCompletedAt || null
    };
    
    console.log("26. ✅ Sending response:", responseData);
    console.log("=".repeat(50));
    res.json(responseData);
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR in updateProfile:");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);
    
    // If it's a validation error, provide more details
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        msg: "Validation error", 
        errors: error.errors,
        error: error.message 
      });
    }
    
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};