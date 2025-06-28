import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js'; // Add this import
import { signToken } from '../utils/jwt.js'; // Add this import if not already present

// This is needed to resolve relative paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const keyBuffer = await readFile(keyPath, 'utf8');
const serviceAccount = JSON.parse(keyBuffer);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAuth = async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ msg: 'ID token is required' });
  }

  try {
    console.log('🔄 Verifying Firebase ID token...');
    
    // 1) Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;
    
    console.log('✅ Firebase token verified for user:', email);

    // 2) Upsert user in Mongo
    let user = await User.findOne({ email });
    if (!user) {
      console.log('🆕 Creating new user in database...');
      user = await User.create({
        name: name || email.split('@')[0], // Fallback to email prefix if no name
        email,
        password: uid,        // dummy—won't be used
        googleId: uid,
        avatarUrl: picture || null
      });
      console.log('✅ New user created:', user._id);
    } else {
      console.log('👤 Existing user found, updating Firebase data...');
      user.googleId = uid;
      user.avatarUrl = picture || user.avatarUrl;
      user.name = name || user.name; // Update name if provided
      await user.save();
      console.log('✅ User updated:', user._id);
    }

    // 3) Issue your own JWT
    const token = signToken({ userId: user._id });
    
    console.log('✅ JWT token generated successfully');
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted || false
      }
    });
  } catch (err) {
    console.error('🔥 Firebase auth error:', err);
    
    // Provide more specific error messages
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ msg: 'Token expired. Please sign in again.' });
    } else if (err.code === 'auth/id-token-revoked') {
      return res.status(401).json({ msg: 'Token revoked. Please sign in again.' });
    } else if (err.code === 'auth/invalid-id-token') {
      return res.status(401).json({ msg: 'Invalid token. Please sign in again.' });
    }
    
    res.status(401).json({ msg: 'Authentication failed' });
  }
};