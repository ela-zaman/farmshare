// src/firebase/bookingService.js
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Request booking
export const requestBooking = async (booking) => {
  return await addDoc(collection(db, "bookings"), booking);
};

// Get all bookings
export const getBookings = async () => {
  const snapshot = await getDocs(collection(db, "bookings"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  const bookingRef = doc(db, "bookings", bookingId);
  return await updateDoc(bookingRef, { status });
};