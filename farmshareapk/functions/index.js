const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

exports.sendNotification = functions.firestore
  .document("bookings/{id}")
  .onCreate(async (snap) => {

    const data = snap.data();

    const userSnap = await admin.firestore()
      .collection("users")
      .doc(data.providerId)
      .get();

    const token = userSnap.data()?.expoPushToken;

    if (!token) return;

    await axios.post(
      "https://exp.host/--/api/v2/push/send",
      {
        to: token,
        sound: "default",
        title: "🚜 New Booking Request",
        body: `${data.userName} sent a request`,
        data: { bookingId: snap.id }
      }
    );
  });