import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Calendar } from "react-native-calendars";
import { collection, addDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function BookingDetails({ route, navigation }) {
  const { t } = useTranslation();
  const { machine } = route.params;

  const auth = getAuth();
  const user = auth.currentUser;

  const [bookedDates, setBookedDates] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchBookedDates();
    fetchUserInfo();
  }, []);

  // ----------------------------
  // Fetch logged-in user info
  // ----------------------------
  const fetchUserInfo = async () => {
    if (!user) return;

    try {
      // Using document ID instead of query for reliability
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserInfo(docSnap.data());
        console.log("USER INFO:", docSnap.data());
      } else {
        console.log("No user info found!");
        Alert.alert(t("error"), t("user_info_missing"));
      }
    } catch (err) {
      console.log("Error fetching user info:", err);
      Alert.alert(t("error"), t("fetch_user_failed"));
    }
  };

  // ----------------------------
  // Fetch booked dates
  // ----------------------------
  const fetchBookedDates = async () => {
    try {
      const q = query(collection(db, "bookings"), where("machineId", "==", machine.id));
      const snapshot = await getDocs(q);

      const booked = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.dates?.forEach((date) => {
          booked[date] = {
            disabled: true,
            marked: true,
            dotColor: "red",
          };
        });
      });

      setBookedDates(booked);
    } catch (err) {
      console.log("Error fetching booked dates:", err);
      Alert.alert(t("error"), t("fetch_booked_failed"));
    }
  };

  // ----------------------------
  // Select date
  // ----------------------------
  const handleDayPress = (day) => {
    if (bookedDates[day.dateString]) return;

    setSelectedDates((prev) => ({
      ...prev,
      [day.dateString]: {
        selected: true,
        selectedColor: "green",
      },
    }));
  };

  // ----------------------------
  // Booking
  // ----------------------------
  const handleBooking = async () => {
    if (!user) {
      Alert.alert(t("error"), t("login_required"));
      return;
    }

    if (!userInfo || !userInfo.name || !userInfo.phone) {
      Alert.alert(t("error"), t("user_info_missing"));
      return;
    }

    const dates = Object.keys(selectedDates);
    if (dates.length === 0) {
      Alert.alert(t("error"), t("select_dates"));
      return;
    }

    try {
      console.log("Booking Data:", {
        machineType: machine.machineType,
        userName: userInfo.name,
        userPhone: userInfo.phone,
        dates,
      });

      await addDoc(collection(db, "bookings"), {
        machineId: machine.id,
        machineType: machine.machineType || "unknown",
        providerId: machine.providerId || "",

        userId: user.uid,
        userName: userInfo.name || "Unknown",
        userPhone: userInfo.phone || "N/A",

        dates,
        status: "pending",
        createdAt: new Date(),
      });

      Alert.alert(t("success"), t("booking_sent"));
      setSelectedDates({});
      fetchBookedDates();
      navigation.goBack();
    } catch (err) {
      console.log("Error booking:", err);
      Alert.alert(t("error"), t("booking_failed"));
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{machine.machineType || "Unknown"}</Text>

      <Text>{t("provider")}: {machine.providerName || "Unknown"}</Text>
      <Text>{t("phone")}: {machine.phone || "N/A"}</Text>
      <Text>{t("district")}: {machine.district || "N/A"}</Text>
      <Text>{t("upazila")}: {machine.upazila || "N/A"}</Text>
      <Text>{t("village")}: {machine.village || "N/A"}</Text>
      <Text>{t("charge")}: {machine.tillageCharge || "N/A"}</Text>
      <Text>{t("type")}: {machine.tillageType || "N/A"}</Text>

      <Calendar
        markingType="period"
        markedDates={{ ...bookedDates, ...selectedDates }}
        onDayPress={handleDayPress}
      />

      <View style={{ marginTop: 15 }}>
        <Button title={t("book_now")} onPress={handleBooking} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
});