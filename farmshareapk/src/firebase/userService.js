import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

const usersCollection = collection(db, "users");

export const registerUser = async (user) => {
  return await addDoc(usersCollection, user);
};

export const loginUser = async (phone, password) => {
  const q = query(
    usersCollection,
    where("phone", "==", phone),
    where("password", "==", password)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  } else {
    throw new Error("Invalid phone or password");
  }
};