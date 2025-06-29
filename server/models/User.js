// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using Google OAuth
      return !this.googleId;
    }
  },
  // Firebase/Google OAuth fields
  googleId: String,
  avatarUrl: String,

  // role, e.g. user / coach / admin
  role: {
    type: String,
    enum: ['user','coach','admin'],
    default: 'user'
  },

  // Onboarding status (for quick access)
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingCompletedAt: Date
}, { timestamps: true });

// hash password before saving (only if password is provided and modified)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// helper to compare on login
userSchema.methods.comparePassword = function(plain) {
  if (!this.password) return false; // For Google OAuth users
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
