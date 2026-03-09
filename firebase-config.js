// js/firebase-config.js

// 🔴 Your actual Firebase config - keep this EXACTLY as it was
const firebaseConfig = {
    apiKey: "AIzaSyDscm5L3X1tEVVz5fOmbFo4FeLfIE1bQ68",
  authDomain: "school-management-2026-e2f1b.firebaseapp.com",
  databaseURL: "https://school-management-2026-e2f1b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "school-management-2026-e2f1b",
  storageBucket: "school-management-2026-e2f1b.firebasestorage.app",
  messagingSenderId: "848145999419",
  appId: "1:848145999419:web:6a2d4b9cefb16407f01e1e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Make available globally
window.auth = auth;
window.db = db;

console.log("✅ Firebase initialized");