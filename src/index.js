// src/index.js in your React application

import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import './index.css'; // Assuming you have a CSS file for global styles
import App from './App'; // Your main App component

// Firebase Imports for React - these are essential for React integration
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// If you use other Firebase services like Firestore, also import them:
// import { getFirestore } from 'firebase/firestore';

// Your Firebase project configuration
// IMPORTANT: Replace the placeholder values ("YOUR_API_KEY", etc.)
// with the actual configuration details from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyAowOlYGrWCtzqpq-aysb_WkEnyims_M7k",
  authDomain: "mphakathionline.firebaseapp.com",
  databaseURL: "https://mphakathionline-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mphakathionline",
  storageBucket: "mphakathionline.firebasestorage.app",
  messagingSenderId: "139852645000",
  appId: "1:139852645000:web:8db2bba11935859b14553d",
  measurementId: "G-4Z2XPPNWLR"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get the Auth service instance from the initialized app

// Listen for authentication state changes
// This will tell you if a user logs in or out
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in (e.g., after login or if session persists)
    console.log("User is logged in:", user.email, "UID:", user.uid);
    // You can now access the logged-in user's data (e.g., user.uid, user.email)
    // and update your React application's state or navigate accordingly.
  } else {
    // User is signed out (e.g., after logout or if no active session)
    console.log("No user is logged in.");
    // You might want to redirect to a login page or update UI for a logged-out state.
  }
});

// This is where your React application is rendered into the HTML document
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Your main React component (App) will use Firebase services */}
    <App />
  </React.StrictMode>
);