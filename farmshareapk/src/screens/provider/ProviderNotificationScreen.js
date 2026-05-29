import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
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
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

/* ================= NOTIFICATIONS ================= */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* ================= SOUND ================= */
const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/sounds/notification.mp3")
    );
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 1000);
  } catch (e) {
    console.log(e);
  }
};

/* ================= PUSH TOKEN ================= */
async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (!Device.isDevice) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  return await Notifications.getExpoPushTokenAsync();
}

/* ================= FALLBACK IMAGE ================= */
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
  const [machineMap, setMachineMap] = useState({});

  const notificationListener = useRef();
  const responseListener = useRef();

  /* ================= LOAD MACHINES ================= */
  useEffect(() => {
    const loadMachines = async () => {
      const snap = await getDocs(collection(db, "machines"));
      const map = {};

      snap.forEach((doc) => {
        map[doc.id] = doc.data();
      });

      setMachineMap(map);
    };

    loadMachines();
  }, []);

  /* ================= BOOKINGS ================= */
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setNotifications(data);
    });

    return () => unsub();
  }, [provider]);

  /* ================= IMAGE ================= */
  const getImage = (item) => {
    const firebaseImage =
      machineMap?.[item.machineId]?.machineImage;

    if (firebaseImage && firebaseImage.trim() !== "") {
      return { uri: firebaseImage };
    }

    return getMachineFallback(item.machineType);
  };

  /* ================= NAVIGATION ================= */
  const handlePress = async (item) => {
    if (!item.isRead) {
      await updateDoc(doc(db, "bookings", item.id), {
        isRead: true,
      });
    }

    navigation.navigate("ProviderBookingRequests", {
      bookingId: item.id,
    });
  };

  /* ================= NOTIFICATION LISTENERS ================= */
  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        playSound();
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const bookingId =
          response.notification.request.content.data?.bookingId;

        if (bookingId) {
          navigation.navigate("ProviderBookingRequests", {
            bookingId,
          });
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  /* ================= RENDER ================= */
  const renderItem = ({ item }) => {
    const isRead = item.isRead === true;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={[
          styles.card,
          isRead ? styles.readCard : styles.unreadCard,
        ]}
      >
        <Image source={getImage(item)} style={styles.machineImg} />

        <View style={styles.textBox}>
          <Text style={styles.title}>
            🚜 {t(item.machineType)}
          </Text>

          <Text style={styles.subtitle}>
            {t("new_booking_request")}
          </Text>

          <Text style={styles.meta}>
            👤 {item.userName || "Unknown"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={22} color="#333" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15, paddingBottom: 150 }} 
        />
      )}
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
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  /* 🟢 UNREAD */
  unreadCard: {
    backgroundColor: "#E8F5E9",
  },

  /* 🔴 READ */
  readCard: {
    backgroundColor: "#FFEBEE",
  },

  machineImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontWeight: "bold",
    fontSize: 14,
  },

  subtitle: {
    fontSize: 12,
  },

  meta: {
    fontSize: 12,
    color: "#666",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});