import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseApp } from "./firebaseConfig";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export const registerUser = async ({ name, phone, address, password, role }) => {
  try {
    // Fake email workaround using phone number
    const fakeEmail = `${phone}@example.com`;

    // Register with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCredential.user;

    // Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      phone,
      address,
      role,
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.error("Firebase registration error:", error);
    throw error;
  }
};