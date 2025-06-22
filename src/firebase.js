
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWU90BZzPz088l8sm6q9RSByEK_7i_u7o",
  authDomain: "ai-nutrition-app-201b1.firebaseapp.com",
  projectId: "ai-nutrition-app-201b1",
  storageBucket: "ai-nutrition-app-201b1.firebasestorage.app",
  messagingSenderId: "1016952321804",
  appId: "1:1016952321804:web:2e98d2c85bcfe8d4523b29",
  measurementId: "G-44QLCMG8XR"
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);