// React Native Firebase Configuration
// Use this configuration in your React Native app

import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your Firebase configuration for React Native
const firebaseConfig = {
  apiKey: "AIzaSyBbbBnRXe40Kkaqa4-xMRFuRtQPVjmtkEc",
  authDomain: "habithero-31e24.firebaseapp.com",
  projectId: "habithero-31e24",
  storageBucket: "habithero-31e24.firebasestorage.app",
  messagingSenderId: "643942362110",
  appId: "1:643942362110:web:a93bdb2b8889dbc96c2eaf",
  measurementId: "G-3CLK6C2WC1"
};

// Initialize Firebase for React Native
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { app, messaging }; 