import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { firebaseApp } from "./firebaseConfig";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


// ================= REGISTER USER =================
export const registerUser = async ({
  name,
  phone,
  address,
  password,
  role,
  photo // 🆕 added photo
}) => {
  try {
    // Convert phone → fake email (your system)
    const fakeEmail = `${phone}@example.com`;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      fakeEmail,
      password
    );

    const user = userCredential.user;

    // Save user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      phone,
      address,
      role,
      photo: photo || null, // 🆕 store image URL
      createdAt: new Date().toISOString()
    });

    return user;

  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};


// ================= LOGIN USER =================
export const loginUser = async ({ phone, password }) => {
  try {
    const fakeEmail = `${phone}@example.com`;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      fakeEmail,
      password
    );

    const user = userCredential.user;

    // Fetch user data from Firestore
    const docSnap = await getDoc(doc(db, "users", user.uid));

    if (!docSnap.exists()) {
      throw new Error("User data not found.");
    }

    return {
      uid: user.uid,
      ...docSnap.data() // includes photo now
    };

  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


// ================= LOGOUT =================
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};


// ================= EXPORTS =================
export { auth, db };