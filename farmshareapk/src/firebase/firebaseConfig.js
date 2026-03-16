// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6oop0eKHGGxikMkM6JwBr_9DN9FEBa1Y",
  authDomain: "farmshare-b3c91.firebaseapp.com",
  projectId: "farmshare-b3c91",
  storageBucket: "farmshare-b3c91.firebasestorage.app",
  messagingSenderId: "368913958971",
  appId: "1:368913958971:web:aed34434c234a64411741e",
  measurementId: "G-HQ4DZQL324"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);