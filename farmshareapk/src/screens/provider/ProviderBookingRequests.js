import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

/* ================= BANGLA DIGITS ================= */
const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

const toBanglaNumber = (num) =>
  num?.toString().split("").map(d => BN_DIGITS[d] || d).join("");

/* ================= MONTH TRANSLATION ================= */
const MONTHS = {
  en: [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ],
  bn: [
    "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
    "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
  ],
};

export default function ProviderBookingRequests() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);

  const provider = getAuth().currentUser;
  const isBn = i18n.language === "bn";

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const raw = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const enriched = await Promise.all(
        raw.map(async (item) => {
          let userData = {};
          let machineData = {};

          if (item.userId) {
            const u = await getDoc(doc(db, "users", item.userId));
            if (u.exists()) userData = u.data();
          }

          if (item.machineId) {
            const m = await getDoc(doc(db, "machines", item.machineId));
            if (m.exists()) machineData = m.data();
          }

          return {
            ...item,
            userName: userData.name || "Unknown",
            userPhone: userData.phone || "",
            userPhoto: userData.photo || null,
            machineImage: machineData.machineImage || null,
          };
        })
      );

      setRequests(enriched);
    });

    return () => unsub();
  }, []);

  /* ================= DATE FORMAT (FULL MULTILINGUAL) ================= */
  const formatDate = (date) => {
    const d = new Date(date);

    const day = isBn ? toBanglaNumber(d.getDate()) : d.getDate();
    const year = isBn ? toBanglaNumber(d.getFullYear()) : d.getFullYear();

    const month = isBn
      ? MONTHS.bn[d.getMonth()]
      : MONTHS.en[d.getMonth()];

    return `${day} ${month} ${year}`;
  };

  /* ================= TIME SLOT FORMAT ================= */
  const formatTime = (val) =>
    isBn ? toBanglaNumber(val) : val;

/* morning/noon label */
  const getSlotName = (slot) => {
    const start = parseInt(slot.split("-")[0]);

    if (start < 12) return t("morning");
    if (start < 15) return t("noon");
    if (start < 18) return t("afternoon");
    return t("night");
  };

  /* ================= ACTION ================= */
  const handleDecision = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status });
    Alert.alert(t("success"));
  };

  /* ================= CARD ================= */
  const renderCard = (item) => (
    <LinearGradient
      key={item.id}
      colors={["#FDE2FF", "#D6EEFF"]}
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        <Image
          source={
            item.machineImage
              ? { uri: item.machineImage }
              : require("../../../assets/images/add.png")
          }
          style={styles.machineImage}
        />

        <Image
          source={
            item.userPhoto
              ? { uri: item.userPhoto }
              : require("../../../assets/images/add.png")
          }
          style={styles.userImage}
        />
      </View>

      <Text style={styles.title}>{t(item.machineType)}</Text>

      {/* USER INFO */}
      <Text style={styles.text}>👤 {t("farmer_name")}: {item.userName}</Text>
      <Text style={styles.text}>📞 {t("phone")}: {item.userPhone}</Text>

      {/* DATE (MULTILINGUAL FIXED) */}
      <Text style={styles.text}>
        📅 {t("dates")}:{" "}
        {item.dates?.map((d) => formatDate(d)).join(", ")}
      </Text>

      {/* TIME SLOT */}
      <Text style={styles.slotTitle}>⏰ {t("time_slot")}</Text>

      <View style={styles.slotWrap}>
        {item.slots?.map((slot, index) => {
          const [start, end] = slot.split("-");

          return (
            <LinearGradient
              key={index}
              colors={["#A8D8FF", "#FFC6E6"]}
              style={styles.slotBorder}
            >
              <View style={styles.slotCard}>
                <Text style={styles.slotText}>
                  {getSlotName(slot)}{" "}
                  {formatTime(start)}:00 - {formatTime(end)}:00
                </Text>
              </View>
            </LinearGradient>
          );
        })}
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.accept}
          onPress={() => handleDecision(item.id, "accepted")}
        >
          <Text style={styles.btnText}>✅ {t("accept")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deny}
          onPress={() => handleDecision(item.id, "denied")}
        >
          <Text style={styles.btnText}>❌ {t("deny")}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {requests.map(renderCard)}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 100,
  },

  card: {
    padding: 15,
    borderRadius: 25,
    marginBottom: 25,
  },

  imageWrap: {
    alignItems: "center",
    marginBottom: 20,
  },

  machineImage: {
    width: 170,
    height: 120,
    borderRadius: 15,
  },

  userImage: {
    width: 65,
    height: 65,
    borderRadius: 35,
    position: "absolute",
    bottom: -18,
    right: 80,
    borderWidth: 3,
    borderColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    textAlign: "center",
    marginBottom: 15,
  },

  text: {
    color: "#0D47A1",
    fontWeight: "600",
    marginBottom: 5,
  },

  slotTitle: {
    marginTop: 12,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  slotWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  slotBorder: {
    padding: 1.5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },

  slotCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },

  slotText: {
    fontWeight: "bold",
    color: "#0D47A1",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  accept: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 15,
    marginRight: 5,
    alignItems: "center",
  },

  deny: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 15,
    marginLeft: 5,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});