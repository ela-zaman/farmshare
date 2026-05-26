import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
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

/* ================= MULTILINGUAL HELPERS ================= */
const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

const toBnNumber = (num) =>
  String(num).split("").map(d => BN_DIGITS[d] || d).join("");

const MONTHS = {
  en: [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ],
  bn: [
    "জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন",
    "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
  ],
};

export default function ProviderBookingScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");

  const provider = getAuth().currentUser;

  const todayStr = new Date().toISOString().split("T")[0];

  /* ================= DATE LOGIC ================= */
  const normalizeDates = (dates) =>
    Array.isArray(dates) ? dates : dates ? [dates] : [];

  const isExpired = (dates) =>
    normalizeDates(dates).every((d) => d < todayStr);

  const isCurrent = (dates) =>
    normalizeDates(dates).some((d) => d >= todayStr);

  /* ================= DATE FORMAT ================= */
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);

    const lang = i18n.language === "bn" ? "bn" : "en";

    const day =
      i18n.language === "bn"
        ? toBnNumber(d.getDate())
        : d.getDate();

    const year =
      i18n.language === "bn"
        ? toBnNumber(d.getFullYear())
        : d.getFullYear();

    const month = MONTHS[lang][d.getMonth()];

    return `${day} ${month} ${year}`;
  };

  /* ================= IMAGE ================= */
  const getMachineImage = (machine) => {
    if (machine?.machineImage)
      return { uri: machine.machineImage };

    const type = (machine?.machineType || "").toLowerCase();

    if (type === "tractor")
      return require("../../../assets/images/Machines/tractor.png");
    if (type === "powertiller")
      return require("../../../assets/images/Machines/powertiller.png");
    if (type === "reaper")
      return require("../../../assets/images/Machines/reaper.png");
    if (type === "sprayer")
      return require("../../../assets/images/Machines/sprayer.jpg");
    if (type === "thresher")
      return require("../../../assets/images/Machines/thresher.png");
    if (type === "combine harvester")
      return require("../../../assets/images/Machines/combine harvester.png");

    return require("../../../assets/images/Machines/tractor.png");
  };

  const getUserImage = (uri) =>
    uri ? { uri } : require("../../../assets/images/add.png");

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!provider) return;

    const fetchBookings = async () => {
      const q = query(
        collection(db, "bookings"),
        where("providerId", "==", provider.uid),
        where("status", "==", "accepted")
      );

      const snap = await getDocs(q);

      const raw = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const users = {};
      const machines = {};

      await Promise.all(
        raw.map(async (b) => {
          if (b.userId && !users[b.userId]) {
            const u = await getDoc(doc(db, "users", b.userId));
            if (u.exists()) users[b.userId] = u.data();
          }

          if (b.machineId && !machines[b.machineId]) {
            const m = await getDoc(doc(db, "machines", b.machineId));
            if (m.exists()) machines[b.machineId] = m.data();
          }
        })
      );

      const merged = raw.map((b) => ({
        ...b,
        userName: users[b.userId]?.name || "Unknown",
        userPhone: users[b.userId]?.phone || "N/A",
        userPhoto: users[b.userId]?.photo || null,
        machineImage: machines[b.machineId]?.machineImage || null,
      }));

      setBookings(merged);
    };

    fetchBookings();
  }, [provider]);

  /* ================= SORT LATEST → OLDEST ================= */
  const sortedBookings = useMemo(() => {
    let data = [...bookings];

    if (filter === "current")
      data = data.filter((b) => isCurrent(b.dates));

    if (filter === "expired")
      data = data.filter((b) => isExpired(b.dates));

    return data.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  }, [bookings, filter]);

  /* ================= TIME SLOT ================= */
  const getSlotLabel = (hour) => {
    if (hour >= 5 && hour < 11) return t("morning");
    if (hour >= 11 && hour < 15) return t("noon");
    if (hour >= 15 && hour < 19) return t("afternoon");
    return t("night");
  };

  const formatSlots = (slots = []) =>
    slots.map((s, i) => {
      const [start, end] = s.split("-").map(Number);

      const label =
        `${getSlotLabel(start)} ` +
        `${i18n.language === "bn"
          ? toBnNumber(start)
          : start
        }:00 - ` +
        `${i18n.language === "bn"
          ? toBnNumber(end)
          : end
        }:00`;

      return { id: i, label };
    });

  /* ================= RENDER ================= */
  const renderItem = ({ item }) => {
    const expired = isExpired(item.dates);

    return (
      <View
        style={[
          styles.card,
          expired ? styles.expiredCard : styles.currentCard,
        ]}
      >
        {/* IMAGES */}
        <View style={styles.imageWrap}>
          <Image
            source={getMachineImage(item)}
            style={styles.machineImg}
          />
          <Image
            source={getUserImage(item.userPhoto)}
            style={styles.userImg}
          />
        </View>

        {/* TEXT */}
        <Text style={styles.title}>
          {t(item.machineType)}
        </Text>

        <Text style={styles.text}>
          <FontAwesome5 name="user-circle" /> {t("farmer_name")}: {item.userName}
        </Text>

        <Text style={styles.text}>
          <Ionicons name="call" /> {t("phone")}: {item.userPhone}
        </Text>

        <Text style={styles.text}>
          <MaterialIcons name="location-on" /> {t("land_address")}: {item.landAddress}
        </Text>

        <Text style={styles.text}>
          📅 {t("dates")}:{" "}
          {normalizeDates(item.dates).map(formatDate).join(", ")}
        </Text>

        {/* TIME SLOT */}
        <Text style={styles.slotTitle}>
          ⏰ {t("time_slot")}
        </Text>

        {/* SLOT CARDS */}
        <View style={styles.slotGrid}>
          {formatSlots(item.slots).map((slot) => (
            <View key={slot.id} style={styles.slotCard}>
              <Text style={styles.slotText}>{slot.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* FILTER */}
      <View style={styles.filterRow}>
        {["all", "current", "expired"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterBtn,
              filter === type ? styles.activeBtn : styles.inactiveBtn,
            ]}
          >
            <Text style={styles.filterText}>{t(type)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sortedBookings}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
  },

  currentCard: {
    backgroundColor: "#d7f5e3",
  },

  expiredCard: {
    backgroundColor: "#f8d7da",
  },

  imageWrap: {
    alignItems: "center",
  },

  machineImg: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  userImg: {
    width: 55,
    height: 55,
    borderRadius: 30,
    position: "absolute",
    bottom: -10,
    right: 100,
    borderWidth: 3,
    borderColor: "#fff",
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },

  text: {
    fontSize: 13,
    marginTop: 4,
  },

  slotTitle: {
    marginTop: 10,
    fontWeight: "bold",
  },

  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  slotCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b2dfdb",
  },

  slotText: {
    fontSize: 12,
    textAlign: "center",
  },

  filterRow: {
    flexDirection: "row",
  },

  filterBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },

  activeBtn: {
    backgroundColor: "#2E7D32",
  },

  inactiveBtn: {
    backgroundColor: "#1565C0",
  },

  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
});