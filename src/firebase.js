import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions'; // Add this line to import Cloud Functions

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Your API_Key",
  authDomain: "Your authDomain",
  projectId: "Your projectId",
  storageBucket: "Your storageBucket",
  messagingSenderId: "Your messagingSenderId",
  appId: "Your appId"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Initialize functions

// Exporting necessary functions and instances
export { auth, firestore, storage, functions }; // Added 'functions' here
