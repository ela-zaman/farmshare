import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
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

import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function ProviderBookingScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("current");

  const provider = getAuth().currentUser;

  const todayStr = new Date().toISOString().split("T")[0];

  const isBn = i18n.language === "bn";

  // ================= SAFE NORMALIZER =================
  const normalizeDates = (dates) => {
    if (!dates) return [];
    if (Array.isArray(dates)) return dates;
    return [dates]; // fix string → array
  };

  // ================= DATE CHECK (FIXED) =================
  const isExpired = (dates) => {
    const list = normalizeDates(dates);
    return list.every((d) => d < todayStr);
  };

  const isCurrent = (dates) => {
    const list = normalizeDates(dates);
    return list.some((d) => d >= todayStr);
  };

  // ================= ADD CONTACT =================
  const handleAddContact = async (item) => {
    try {
      await addDoc(collection(db, "contacts"), {
        providerId: provider.uid,
        userId: item.userId,
        name: item.userName,
        phone: item.userPhone,
        address: item.landAddress || "",
        machineType: item.machineType || "",
        createdAt: serverTimestamp(),
      });

      Alert.alert(t("success"), t("contact_saved"));
    } catch (e) {
      console.log(e);
    }
  };

  // ================= CHAT SCREEN =================
  const handleContactNow = (item) => {
    navigation.navigate("ChatScreen", {
      userId: item.userId,
      userName: item.userName,
    });
  };

  // ================= FETCH BOOKINGS =================
  useEffect(() => {
    if (provider) fetchBookings();
  }, [provider]);

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

    // fetch user info
    const users = {};

    await Promise.all(
      raw.map(async (b) => {
        if (b.userId) {
          const u = await getDoc(doc(db, "users", b.userId));
          if (u.exists()) users[b.userId] = u.data();
        }
      })
    );

    const merged = raw.map((b) => ({
      ...b,
      userName: users[b.userId]?.name || "Unknown",
      userPhone: users[b.userId]?.phone || "N/A",
      userPhoto: users[b.userId]?.photo || null,
    }));

    setBookings(merged);
  };

  // ================= FILTER =================
  const filteredBookings = useMemo(() => {
    let data = [...bookings];

    if (filter === "current") data = data.filter((b) => isCurrent(b.dates));
    if (filter === "expired") data = data.filter((b) => isExpired(b.dates));

    return data.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  }, [bookings, filter]);

  // ================= IMAGE =================
  const img = (uri) =>
    uri ? { uri } : require("../../../assets/images/add.png");

  // ================= DATE FORMAT =================
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString("default", {
      month: "long",
    })} ${d.getFullYear()}`;
  };

  // ================= CARD =================
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
        <View style={styles.imageRow}>
          <Image source={img(item.userPhoto)} style={styles.farmerImg} />
          <Image source={img(item.machineImage)} style={styles.machineImg} />
        </View>

        {/* MACHINE */}
        <Text style={styles.title}>{t(item.machineType)}</Text>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.row}>
            <FontAwesome5 name="user-circle" size={14} />{" "}
            {t("farmer_name")}: {item.userName}
          </Text>

          <Text style={styles.row}>
            <Ionicons name="call" size={14} />{" "}
            {t("phone")}: {item.userPhone}
          </Text>

          <Text style={styles.row}>
            <MaterialIcons name="location-on" size={15} />{" "}
            {t("land_address")}: {item.landAddress}
          </Text>

          <Text style={styles.row}>
            <Ionicons name="calendar" size={15} />{" "}
            {t("dates")}: {normalizeDates(item.dates).join(", ")}
          </Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => handleAddContact(item)}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.btnText}>{t("add_contact")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => handleContactNow(item)}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
            <Text style={styles.btnText}>{t("contact_now")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* FILTER */}
      <View style={styles.filterRow}>
        {["current", "expired", "all"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterBtn,
              filter === type && styles.activeBtn,
            ]}
          >
            <Text style={styles.filterText}>{t(type)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={filteredBookings}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 5,
  },

  currentCard: { backgroundColor: "#e8f5e9" },
  expiredCard: { backgroundColor: "#ffebee" },

  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  farmerImg: {
    width: 65,
    height: 65,
    borderRadius: 40,
    marginRight: -15,
  },

  machineImg: {
    width: 75,
    height: 75,
    borderRadius: 40,
  },

  title: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },

  infoBox: {
    marginBottom: 10,
  },

  row: {
    fontSize: 13,
    marginBottom: 6,
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  contactBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  chatBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1565C0",
    padding: 10,
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },

  filterBtn: {
    padding: 8,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },

  activeBtn: {
    backgroundColor: "#2E7D32",
  },

  filterText: {
    fontWeight: "bold",
  },
});