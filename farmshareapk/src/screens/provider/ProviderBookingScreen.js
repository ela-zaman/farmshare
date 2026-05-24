import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";

import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function ProviderBookingScreen() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);

  const provider = getAuth().currentUser;
  const isBn = i18n.language === "bn";

  useEffect(() => {
    if (provider) fetchBookings();
  }, [provider]);

  /* ================= BANGLA NUMBER ================= */
  const toBanglaNumber = (num) => {
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num?.toString().split("").map(d => bn[d] || d).join("");
  };

  /* ================= FULL MONTH FORMAT ================= */
  const formatDate = (dateString) => {
    const d = new Date(dateString);

    const enMonths = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const bnMonths = [
      "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
      "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
    ];

    const day = d.getDate();
    const month = isBn ? bnMonths[d.getMonth()] : enMonths[d.getMonth()];
    const year = d.getFullYear();

    return isBn
      ? `${toBanglaNumber(day)} ${month} ${toBanglaNumber(year)}`
      : `${day} ${month} ${year}`;
  };

  /* ================= SLOT FORMAT ================= */
  const formatSlot = (slot) => {
    const [s, e] = slot.split("-");

    const convert = (h) => {
      let hour = parseInt(h);
      const suffix = hour < 12 ? "AM" : "PM";
      if (hour > 12) hour -= 12;

      return isBn
        ? `${toBanglaNumber(hour)}টা`
        : `${hour} ${suffix}`;
    };

    const period = (h) => {
      if (h < 12) return isBn ? "সকাল" : "Morning";
      if (h < 15) return isBn ? "দুপুর" : "Afternoon";
      if (h < 18) return isBn ? "বিকাল" : "Evening";
      return isBn ? "রাত" : "Night";
    };

    const startHour = parseInt(s);

    return `${period(startHour)} ${convert(s)} - ${convert(e)}`;
  };

  /* ================= FETCH ================= */
  const fetchBookings = async () => {
    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid),
      where("status", "==", "accepted")
    );

    const snap = await getDocs(q);

    const raw = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const users = {};

    await Promise.all(
      raw.map(async (b) => {
        if (b.userId) {
          const u = await getDoc(doc(db, "users", b.userId));
          if (u.exists()) users[b.userId] = u.data();
        }
      })
    );

    const merged = raw.map(b => ({
      ...b,
      userName: users[b.userId]?.name || "Unknown",
      userPhone: users[b.userId]?.phone || "N/A",
      userPhoto: users[b.userId]?.photo || null,
    }));

    setBookings(merged);
  };

  const img = (uri) =>
    uri ? { uri } : require("../../../assets/images/add.png");

  /* ================= SLOT RENDER (2 per row) ================= */
  const renderSlots = (slots = []) => {
    const rows = [];

    for (let i = 0; i < slots.length; i += 2) {
      rows.push(slots.slice(i, i + 2));
    }

    return rows.map((row, i) => (
      <View key={i} style={styles.slotRow}>
        {row.map((s, idx) => (
          <View key={idx} style={styles.slotCard}>
            <Ionicons name="time-outline" size={15} color="#1B5E20" />
            <Text style={styles.slotText}>{formatSlot(s)}</Text>
          </View>
        ))}
      </View>
    ));
  };

  /* ================= CARD ================= */
  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* IMAGES */}
      <View style={styles.imageRow}>
        <Image source={img(item.userPhoto)} style={styles.farmerImg} />
        <Image source={img(item.machineImage)} style={styles.machineImg} />
      </View>

      {/* TITLE */}
      <Text style={styles.title}>
        {t(item.machineType)}
      </Text>

      {/* DETAILS (ICON + LABEL + VALUE) */}
      <View style={styles.infoBox}>

        <Text style={styles.row}>
          <FontAwesome5 name="user-circle" size={14} color="#2E7D32" />
          {"  "}
          {t("farmer_name")}: {item.userName}
        </Text>

        <Text style={styles.row}>
          <Ionicons name="call" size={14} color="#2E7D32" />
          {"  "}
          {t("phone")}: {item.userPhone}
        </Text>

        <Text style={styles.row}>
          <MaterialIcons name="location-on" size={15} color="#2E7D32" />
          {"  "}
          {t("land_address")}: {item.landAddress}
        </Text>

        <Text style={styles.row}>
          <Ionicons name="calendar" size={15} color="#2E7D32" />
          {"  "}
          {t("dates")}: {item.dates?.map(formatDate).join(", ")}
        </Text>

      </View>

      {/* TIME SLOTS */}
      <View style={styles.slotHeader}>
        <Ionicons name="time" size={18} color="#2E7D32" />
        <Text style={styles.slotTitle}>
          {t("time_slots")}
        </Text>
      </View>

      {renderSlots(item.slots)}

      {/* TOTAL CHARGE (PREMIUM GREEN LINE) */}
      <View style={styles.totalRow}>
        <Ionicons name="cash" size={20} color="#fff" />
        <Text style={styles.totalText}>
          {"  "}
          {t("total_charge")}:{" "}
          {isBn
            ? `${toBanglaNumber(item.totalCharge)} ${t("taka")}`
            : `${item.totalCharge} ${t("taka")}`}
        </Text>
      </View>

    </View>
  );

  return (
    <FlatList
      data={bookings}
      renderItem={renderItem}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
    />
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 5,
  },

  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  farmerImg: {
    width: 65,
    height: 65,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#4CAF50",
    marginRight: -15,
    zIndex: 2,
  },

  machineImg: {
    width: 75,
    height: 75,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#2196F3",
  },

  title: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1B5E20",
  },

  infoBox: {
    marginBottom: 10,
  },

  row: {
    fontSize: 13,
    marginBottom: 6,
    color: "#333",
  },

  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 5,
  },

  slotTitle: {
    fontWeight: "bold",
    marginLeft: 5,
    color: "#2E7D32",
  },

  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  slotCard: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    margin: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },

  slotText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "600",
    color: "#1B5E20",
  },

  totalRow: {
    marginTop: 15,
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
  },

  totalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});