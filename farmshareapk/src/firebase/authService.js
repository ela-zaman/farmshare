import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseApp } from "./firebaseConfig";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Register user
export const registerUser = async ({ name, phone, address, password, role }) => {
  try {
    const fakeEmail = `${phone}@example.com`;
    const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name,
      phone,
      address,
      role,
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Login user
export const loginUser = async ({ phone, password }) => {
  try {
    const fakeEmail = `${phone}@example.com`;
    const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCredential.user;

    // Fetch user info including role
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (!docSnap.exists()) throw new Error("User data not found.");
    return { uid: user.uid, ...docSnap.data() };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
export { auth, db };