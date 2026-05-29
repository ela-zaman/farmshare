import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";

import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { showNotificationPopup } from "../../utils/popup";
import { db } from "../../firebase/firebaseConfig";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { showLocalNotification } from "../../services/notificationService";
/* ================= SOUND ================= */

const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/sounds/notification.mp3")
    );
    await sound.playAsync();
  } catch (e) {
    console.log(e);
  }
};

/* ================= MACHINE FALLBACK ================= */
const getMachineFallback = (type) => {
  const t = (type || "").toLowerCase().trim();

  if (t === "tractor")
    return require("../../../assets/images/Machines/tractor.png");

  if (t === "powertiller")
    return require("../../../assets/images/Machines/powertiller.png");

  if (t === "reaper")
    return require("../../../assets/images/Machines/reaper.png");

  if (t === "sprayer")
    return require("../../../assets/images/Machines/sprayer.jpg");

  if (t === "thresher")
    return require("../../../assets/images/Machines/thresher.png");

  if (t === "combine harvester")
    return require("../../../assets/images/Machines/combine harvester.png");

  return require("../../../assets/images/Machines/tractor.png");
};

export default function ProviderNotificationScreen({ navigation }) {
  const { t } = useTranslation();
  const provider = getAuth().currentUser;

  const [notifications, setNotifications] = useState([]);
  const prevCount = useRef(0);

  /* ================= REALTIME FIRESTORE ================= */
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const enriched = await Promise.all(
        raw.map(async (item) => {
          let userPhoto = null;
          let userName = item.userName || null;

          if (item.userId) {
            const userSnap = await getDoc(doc(db, "users", item.userId));

            if (userSnap.exists()) {
              userPhoto = userSnap.data()?.photo || null;
              userName = userSnap.data()?.name || userName;
            }
          }

          return {
            ...item,
            userPhoto,
            userName,
            isRead: item.isRead === true, // 🔥 STRICT BOOLEAN
          };
        })
      );

      // 🔔 sound only for new items
      if (enriched.length > prevCount.current) {

  const latest = enriched[0];

  // 🔊 SOUND
  playSound();

  // 📲 POPUP
  showNotificationPopup({
    title: "🚜 New Booking Request",
    body: `${latest.userName} sent a booking request`,
  });
}

      prevCount.current = enriched.length;
      setNotifications(enriched);
    });

    return () => unsub();
  }, [provider]);

  /* ================= MARK AS READ (SAFE UPDATE) ================= */
  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        isRead: true,
      });

      // 🔥 local instant UI update (no wait for Firestore)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (e) {
      console.log(e);
    }
  };

  /* ================= IMAGE ================= */
  const getImage = (uri, type) => {
    if (uri && typeof uri === "string") return { uri };
    return getMachineFallback(type);
  };

  /* ================= PRESS ================= */
  const handlePress = (item) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }

    navigation.navigate("ProviderBookingRequests", {
      bookingId: item.id,
    });
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={[
          styles.card,
          item.isRead ? styles.readCard : styles.unreadCard,
        ]}
      >
        {/* IMAGE STACK */}
        <View style={styles.imageStack}>
          <Image
            source={getImage(item.machineImage, item.machineType)}
            style={styles.machineImg}
          />

          <Image
            source={
              item.userPhoto
                ? { uri: item.userPhoto }
                : require("../../../assets/images/add.png")
            }
            style={styles.userImg}
          />
        </View>

        {/* TEXT */}
        <View style={styles.textBox}>
          {/* DO NOT REMOVE */}
          <Text style={styles.machineType}>
            🚜 {t(item.machineType)}
          </Text>

          <Text style={styles.title}>
            🔔 {t("new_booking_request")}
          </Text>

          <Text style={styles.subtitle}>
            {t("you_have_new_request")}
          </Text>

          <Text style={styles.meta}>
            👤 {item.userName || t("unknown")}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={22} color="#333" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FF",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    elevation: 3,
  },

  /* 🟢 GREEN = UNREAD */
  unreadCard: {
    backgroundColor: "#E8F5E9",
  },

  /* 🔴 RED = READ FOREVER */
  readCard: {
    backgroundColor: "#FFEBEE",
  },

  imageStack: {
    width: 70,
    height: 70,
    marginRight: 12,
  },

  machineImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    position: "absolute",
    left: 0,
    top: 5,
  },

  userImg: {
    width: 38,
    height: 38,
    borderRadius: 20,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },

  textBox: {
    flex: 1,
  },

  machineType: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 2,
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  subtitle: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },

  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
});