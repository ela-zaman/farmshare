// src/firebase/machineService.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Add machine
export const addMachine = async (machine) => {
  return await addDoc(collection(db, "machines"), machine);
};

// Get all machines
export const getMachines = async () => {
  const snapshot = await getDocs(collection(db, "machines"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};