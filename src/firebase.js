import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions'; // Add this line to import Cloud Functions

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxDZbbEpePSLkMh4mV8UlbZ30jR2clwIM",
  authDomain: "hiretrove.firebaseapp.com",
  projectId: "hiretrove",
  storageBucket: "hiretrove.appspot.com",
  messagingSenderId: "178563686249",
  appId: "1:178563686249:web:711d94b5ef0d637370a7f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Initialize functions

// Exporting necessary functions and instances
export { auth, firestore, storage, functions }; // Added 'functions' here
