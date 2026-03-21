import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useTranslation } from "react-i18next";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function BookingDetails({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { machine } = route.params || {};

  const auth = getAuth();
  const user = auth.currentUser;

  const [bookedDates, setBookedDates] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const [tillageNumber, setTillageNumber] = useState("");

  // ----------------------------
  // 🌐 MULTILINGUAL CALENDAR
  // ----------------------------
  useEffect(() => {
    LocaleConfig.locales["bn"] = {
      monthNames: ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],
      monthNamesShort: ["জানু","ফেব","মার্চ","এপ্রি","মে","জুন","জুল","আগ","সেপ্ট","অক্টো","নভে","ডিসে"],
      dayNames: ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"],
      dayNamesShort: ["রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র","শনি"],
      today: "আজ"
    };

    LocaleConfig.defaultLocale = i18n.language === "bn" ? "bn" : "en";
  }, [i18n.language]);

  useEffect(() => {
    fetchBookedDates();
    fetchUserInfo();
  }, []);

  // ----------------------------
  // USER INFO
  // ----------------------------
  const fetchUserInfo = async () => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      setUserInfo(snap.data());
    }
  };

  // ----------------------------
  // BOOKED DATES
  // ----------------------------
  const fetchBookedDates = async () => {
    const q = query(
      collection(db, "bookings"),
      where("machineId", "==", machine.id),
      where("status", "==", "accepted")
    );

    const snapshot = await getDocs(q);

    let booked = {};

    snapshot.forEach((doc) => {
      const data = doc.data();

      data.dates?.forEach((date) => {
        booked[date] = {
          selected: true,
          selectedColor: "red",
          disabled: true
        };
      });
    });

    setBookedDates(booked);
  };

  // ----------------------------
  // SELECT DATE
  // ----------------------------
  const handleDayPress = (day) => {
    if (bookedDates[day.dateString]) return;

    setSelectedDates((prev) => {
      const updated = { ...prev };

      if (updated[day.dateString]) {
        delete updated[day.dateString];
      } else {
        updated[day.dateString] = {
          selected: true,
          selectedColor: "#007bff" // 🔵 BLUE
        };
      }

      return updated;
    });
  };

  // ----------------------------
  // BOOKING
  // ----------------------------
  const handleBooking = async () => {
    if (!user) {
      Alert.alert(t("error"), t("login_required"));
      return;
    }

    if (!tillageNumber) {
      Alert.alert(t("error"), "Enter tillage number");
      return;
    }

    const dates = Object.keys(selectedDates);

    if (dates.length === 0) {
      Alert.alert(t("error"), t("select_dates"));
      return;
    }

    if (!machine?.providerId) {
      Alert.alert("Error", "Provider ID missing");
      return;
    }

    await addDoc(collection(db, "bookings"), {
      machineId: machine.id,
      machineType: machine.machineType,
      providerId: machine.providerId,

      userId: user.uid,
      userName: userInfo?.name || "Unknown",
      userPhone: userInfo?.phone || "N/A",

      tillageNumber,
      dates,
      status: "pending",
      createdAt: new Date(),
    });

    Alert.alert(t("success"), t("booking_sent"));
    navigation.goBack();
  };

  const today = new Date().toISOString().split("T")[0];

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <ScrollView style={styles.container}>
      
      {/* 🔥 TOP CARD */}
      <View style={styles.card}>
        <Image
          source={require("../../../assets/images/Machines/tractor.png")}
          style={styles.image}
        />

        <View style={styles.info}>
          <Text style={styles.title}>{machine?.machineType}</Text>

          <Text>{t("provider")}: {machine?.providerName}</Text>
          <Text>{t("phone")}: {machine?.phone}</Text>
          <Text>{t("district")}: {machine?.district}</Text>
          <Text>{t("upazila")}: {machine?.upazilla}</Text>
          <Text>{t("village")}: {machine?.village}</Text>
          <Text>{t("charge")}: {machine?.tillageCharge}</Text>
          <Text>{t("type")}: {machine?.tillageType}</Text>
        </View>
      </View>

      {/* 🔢 INPUT */}
      <Text style={styles.label}>{t("tillage_number")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("enter_tillage")}
        value={tillageNumber}
        onChangeText={setTillageNumber}
        keyboardType="numeric"
      />

      {/* 📅 CALENDAR */}
      <Calendar
        minDate={today}
        markedDates={{ ...bookedDates, ...selectedDates }}
        onDayPress={handleDayPress}
        theme={{
          todayTextColor: "green",
          arrowColor: "#007bff",
        }}
      />

      {/* 🚀 BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>{t("book_now")}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ----------------------------
// 🎨 STYLES
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f7fa"
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4
  },

  image: {
    width: 100,
    height: 100,
    marginRight: 10
  },

  info: {
    flex: 1
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff"
  },

  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16
  }
});