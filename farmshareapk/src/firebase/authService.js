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
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { firebaseApp } from "./firebaseConfig";
import { bdLocations } from "../data/bdLocation"; // ✅ FIXED IMPORT

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


// ================= HELPERS: convert Bangla → English =================
const getDistrictEN = (input) => {
  const entry = Object.entries(bdLocations).find(
    ([key, value]) => key === input || value.bn === input
  );
  return entry ? entry[0] : input;
};

const getUpazilaEN = (districtEN, input) => {
  const list = bdLocations[districtEN]?.upazilas || [];
  const found = list.find(u => u.en === input || u.bn === input);
  return found ? found.en : input;
};


// ================= REGISTER USER =================
export const registerUser = async (
  {
    name,
    phone,
    role,
    photo,
    district,
    upazila,
    village
  },
  password
) => {
  try {
    // 🔥 VALIDATION (prevents auth/missing-password)
    if (!password) throw new Error("Password is required");
    if (!phone) throw new Error("Phone is required");

    const fakeEmail = `${phone}@farmapp.com`;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      fakeEmail,
      password
    );

    const user = userCredential.user;

    // 🔥 Convert Bangla → English
    const districtEN = getDistrictEN(district);
    const upazilaEN = getUpazilaEN(districtEN, upazila);

    const userData = {
      uid: user.uid,
      name: name?.trim() || "",
      phone: phone?.trim() || "",
      role: role || "farmer",
      photo: photo || null,

      district: districtEN,
      upazila: upazilaEN,
      village: village || "",

      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return user;

  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};


// ================= LOGIN USER =================
export const loginUser = async ({ phone, password }) => {
  try {
    const fakeEmail = `${phone}@farmapp.com`;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      fakeEmail,
      password
    );

    const user = userCredential.user;

    const docSnap = await getDoc(doc(db, "users", user.uid));

    if (!docSnap.exists()) {
      throw new Error("User data not found");
    }

    return {
      uid: user.uid,
      ...docSnap.data()
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


// ================= EXPORT =================
export { auth, db };