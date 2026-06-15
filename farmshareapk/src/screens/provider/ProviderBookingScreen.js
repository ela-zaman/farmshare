import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { useTranslation } from "react-i18next";

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";
import { db } from "../../firebase/firebaseConfig";

/* ================= MULTILINGUAL ================= */

const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

const toBnNumber = (value) =>
  String(value ?? "")
    .split("")
    .map((c) => BN_DIGITS[c] ?? c)
    .join("");

const formatAnyText = (value, lang) =>
  lang === "bn" ? toBnNumber(value) : String(value ?? "");

/* ================= DATE (FULL MULTILINGUAL) ================= */


const getMachineDefaultImage = (type = "") => {
  switch ((type || "").toLowerCase()) {
    case "tractor":
      return require("../../../assets/images/Machines/tractor.png");

    case "powertiller":
      return require("../../../assets/images/Machines/powertiller.png");

    case "reaper":
      return require("../../../assets/images/Machines/reaper.png");

    case "sprayer":
      return require("../../../assets/images/Machines/sprayer.jpg");

    case "thresher":
      return require("../../../assets/images/Machines/thresher.png");

    case "combine harvester":
      return require("../../../assets/images/Machines/combine harvester.png");

    default:
      return require("../../../assets/images/add.png");
  }
};


// 🇧🇩 Bangla month map (FULL FIX)
const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const formatDateLong = (dateStr, lang) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = date.getDate();
  const month = date.getMonth(); // 0–11
  const year = date.getFullYear();

  const monthName =
    lang === "bn" ? BN_MONTHS[month] : date.toLocaleDateString("en-GB", { month: "long" });

  const raw = `${day} ${monthName} ${year}`;

  return lang === "bn" ? toBnNumber(raw) : raw;
};
/* ================= MAIN ================= */

export default function ProviderBookingScreen() {
  const { t, i18n } = useTranslation();
  const provider = getAuth().currentUser;

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("current");

  const todayStr = new Date().toISOString().split("T")[0];

  const normalizeDates = (d) =>
    Array.isArray(d) ? d : d ? [d] : [];

  const isExpired = (dates) =>
    normalizeDates(dates).every((d) => d < todayStr);

  const isCurrent = (dates) =>
    normalizeDates(dates).some((d) => d >= todayStr);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!provider) return;

    const fetchData = async () => {
      const q = query(
        collection(db, "bookings"),
        where("providerId", "==", provider.uid),
        where("status", "==", "accepted")
      );

      const snap = await getDocs(q);

      const data = await Promise.all(
        snap.docs.map(async (d) => {
          const booking = { id: d.id, ...d.data() };

          let user = {};
          let machine = {};

          if (booking.userId) {
            const userSnap = await getDoc(
              doc(db, "users", booking.userId)
            );
            if (userSnap.exists()) user = userSnap.data();
          }

          if (booking.machineId) {
            const machineSnap = await getDoc(
              doc(db, "machines", booking.machineId)
            );
            if (machineSnap.exists()) machine = machineSnap.data();
          }

          return {
            ...booking,
            userName: user?.name || "Unknown",
            userPhone: user?.phone || "N/A",
            userAddress: user?.address || "N/A",
            userPhoto: user?.photo || null,
            machineType: machine?.machineType || booking.machineType,
            machineImage: machine?.machineImage || null,
          };
        })
      );

      setBookings(data);
    };

    fetchData();
  }, [provider]);

  /* ================= CALL ================= */

  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Cannot open dialer")
    );
  };

  /* ================= SAVE CONTACT ================= */

 const addToContact = async (item) => {
  try {
    const phone = item.userPhone;

    if (!phone || phone === "N/A") {
      Alert.alert("Error", "Invalid phone number");
      return;
    }

    // 🔍 Check if contact already exists
    const q = query(
      collection(db, "contacts"),
      where("phone", "==", phone),
      where("providerId", "==", provider.uid)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      Alert.alert("Info", "Contact already exists");
      return;
    }

    // 💾 Save if not exists
    await addDoc(collection(db, "contacts"), {
      name: item.userName,
      phone: phone,
      providerId: provider.uid,
      createdAt: serverTimestamp(),
    });

    Alert.alert("Success", "Saved to contacts");
  } catch (e) {
    console.log(e);
    Alert.alert("Error", "Failed to save contact");
  }
};

  /* ================= FILTER ================= */

  const sortedBookings = useMemo(() => {
    let arr = [...bookings];

    arr.sort((a, b) => {
      const ac = isCurrent(a.dates);
      const bc = isCurrent(b.dates);

      if (ac && !bc) return -1;
      if (!ac && bc) return 1;

      return (
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
      );
    });

    if (filter === "current")
      return arr.filter((b) => isCurrent(b.dates));

    if (filter === "expired")
      return arr.filter((b) => isExpired(b.dates));

    return arr;
  }, [bookings, filter]);

  /* ================= SLOT FORMAT ================= */

  const getSlotLabel = (start) => {
    if (start >= 5 && start < 12) return t("morning");
    if (start >= 12 && start < 15) return t("noon");
    if (start >= 15 && start < 19) return t("evening");
    return t("night");
  };

  const formatTime = (v, lang) => {
    const value =
      v === 0 || v === 12 ? 12 : v > 12 ? v - 12 : v;

    return lang === "bn" ? toBnNumber(value) : String(value);
  };

  const formatSlots = (slots = []) =>
    slots.map((s, i) => {
      const [start, end] = s.split("-").map(Number);

      return {
        id: i,
        label: `${getSlotLabel(start)} ${formatTime(
          start,
          i18n.language
        )}.00 - ${formatTime(end, i18n.language)}.00`,
      };
    });

  /* ================= CARD ================= */

  const renderItem = (item) => {
    const expired = isExpired(item.dates);

    return (
      <View
        key={item.id}
        style={[
          styles.card,
          expired ? styles.expired : styles.current,
        ]}
      >
        
        <Image
          source={
             item.machineImage && item.machineImage.trim()
    ? { uri: item.machineImage }
    : getMachineDefaultImage(item.machineType)
          }
          style={styles.machineImg}
        />

        <Image
          source={
            item.userPhoto
              ? { uri: item.userPhoto }
              : require("../../../assets/images/user.jpg")
          }
          style={styles.userImg}
        />

        <Text style={styles.title}>
          {t(item.machineType)}
          
        </Text>

        {/* FULL MULTILINGUAL TEXT */}
        <Text style={styles.text}>
          👨‍🌾 {t("farmer_name")}{": "}
          {formatAnyText(item.userName, i18n.language)}
        </Text>

        <Text style={styles.text}>
          📱 {t("phone")}{": "}
          {formatAnyText(item.userPhone, i18n.language)}
        </Text>

        <Text style={styles.text}>
          📍 {t("land_address")}{": "}
          {formatAnyText(item.landAddress, i18n.language)}
        </Text>

        <Text style={styles.text}>
          📅 {t("dates")}{": "}
          {formatDateLong(item.dates?.[0], i18n.language)}
        </Text>

        <Text style={styles.text}>
          💰 {t("total_charge")}{": "}
          {formatAnyText(item.totalCharge, i18n.language)}
        </Text>

        <Text style={styles.text}>
          🌾 {t("tillage_number")}{": "}
          {formatAnyText(item.tillageAmount, i18n.language)}
        </Text>
          <Text style={styles.text}>
          🌾 {t("land_size")}{": "}
          {formatAnyText(item.landSize, i18n.language)}
        </Text>
        <Text style={styles.text}>
          💳 {t("type")}{": "}
          {formatAnyText(t(item.chargeType))}
        </Text>

        {/* TIME SLOTS - BLUE/PINK STROKE CARDS */}
        <View style={styles.slotWrap}>
          {formatSlots(item.slots || []).map((s) => (
            <View key={s.id} style={styles.slot}>
              <Text style={styles.slotText}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => addToContact(item)}
          >
            <Text style={styles.btnText}>
              {t("add_contact")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCall(item.userPhone)}
          >
            <Text style={styles.btnText}>{t("call")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterRow}>
        {["current", "all", "expired"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterBtn,
              filter === f && styles.active,
            ]}
          >
            <Text style={{ color: "#fff" }}>
              {t(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        {sortedBookings.map(renderItem)}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 22,
    marginBottom: 14,
  },

  current: {
    backgroundColor: "rgba(46,204,113,.12)",
  },

  expired: {
    backgroundColor: "rgba(231,76,60,.10)",
  },

  machineImg: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  userImg: {
    position: "absolute",
    left: 62,
    top: 22,
    width: 62,
    height: 62,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  text: {
    marginTop: 5,
  },

  /* BLUE + PINK STROKE SLOT CARD */
  slot: {
    padding: 8,
    borderRadius: 20,
    margin: 4,
    backgroundColor: "#fff",

    borderWidth: 2,
    borderTopColor: "#4f8cff",
    borderLeftColor: "#4f8cff",
    borderBottomColor: "#ff4fa0",
    borderRightColor: "#ff4fa0",
  },

  slotText: {
    fontWeight: "600",
  },

  slotWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  filterBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#5E35B1",
    alignItems: "center",
  },

  active: {
    backgroundColor: "#00A86B",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  contactBtn: {
    flex: 1,
    marginRight: 5,
    backgroundColor: "#4f8cff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  callBtn: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: "#ff4fa0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});