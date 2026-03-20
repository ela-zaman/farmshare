import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Calendar } from "react-native-calendars";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function BookingDetails({ route, navigation }) {
  const { t } = useTranslation();
  const { machine } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;

  const [bookedDates, setBookedDates] = useState({});
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const fetchBookedDates = async () => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("machineId", "==", machine.id)
      );
      const snapshot = await getDocs(q);
      const booked = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.dates.forEach((date) => {
          booked[date] = { disabled: true, marked: true, dotColor: "red" };
        });
      });
      setBookedDates(booked);
    } catch (err) {
      console.log("Error fetching booked dates:", err);
      Alert.alert(t("error"), t("fetch_booked_failed"));
    }
  };

  const handleDayPress = (day) => {
    if (bookedDates[day.dateString]) return;
    setSelectedDates((prev) => ({
      ...prev,
      [day.dateString]: { selected: true, selectedColor: "green" }
    }));
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert(t("error"), t("login_required"));
      return;
    }
    const dates = Object.keys(selectedDates);
    if (dates.length === 0) {
      Alert.alert(t("error"), t("select_dates"));
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        machineId: machine.id,
        providerId: machine.providerId,
        userId: user.uid,
        dates,
        status: "pending", // provider needs to approve
        createdAt: new Date()
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{machine.machineType}</Text>
      <Text>{t("provider")}: {machine.providerName}</Text>
      <Text>{t("phone")}: {machine.phone}</Text>
      <Text>{t("district")}: {machine.district}</Text>
      <Text>{t("upazila")}: {machine.upazilla}</Text>
      <Text>{t("village")}: {machine.village}</Text>
      <Text>{t("charge")}: {machine.tillageCharge}</Text>
      <Text>{t("type")}: {machine.tillageType}</Text>

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
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 }
});