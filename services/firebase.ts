import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfUbCNnt5StHIII0m5cNwb9d8q07x3zes",
  authDomain: "fileduck-1.firebaseapp.com",
  projectId: "fileduck-1",
  storageBucket: "fileduck-1.firebasestorage.app",
  messagingSenderId: "260473433869",
  appId: "1:260473433869:web:5612383df9ad626584ca44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);