import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  AppState,
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

import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

// Configure notifications for background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* ================= BANGLA DIGITS ================= */
const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

const toBanglaNumber = (num) => {
  if (num === null || num === undefined) return "";
  return num.toString().replace(/\d/g, (d) => BN_DIGITS[d]);
};

/* ================= MONTH TRANSLATION ================= */
const MONTHS = {
  en: [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ],
  bn: [
    "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
    "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
  ],
};

/* ================= MACHINE DEFAULT IMAGES ================= */
const getMachineDefaultImage = (machineType) => {
  const type = (machineType || "").toLowerCase().trim();

  switch(type) {
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

/* ================= SOUND FUNCTION ================= */
const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/sounds/notification.mp3")
    );
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 1500);
  } catch (e) {
    console.log("Sound error:", e);
  }
};

export default function ProviderBookingRequests() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);

  const provider = getAuth().currentUser;
  const isBn = i18n.language === "bn";

  // Track seen bookings, app state, and initial payload load state
  const seenBookings = useRef(new Map());
  const appState = useRef(AppState.currentState);
  const isFirstLoad = useRef(true);

  /* ================= FILTER FUTURE DATES ================= */
  const isFutureOrTodayDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(dateStr);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate >= today;
  };

  // Setup background audio
  useEffect(() => {
    const setupBackgroundAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log("Audio setup error:", error);
      }
    };
    
    setupBackgroundAudio();
    
    // Track app state
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

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
            machineTypeFromDB: machineData.machineType || item.machineType,
            machineModel: machineData.machineModel || "",
          };
        })
      );

      // Detect new bookings and trigger notification sound
      enriched.forEach((item) => {
        const prev = seenBookings.current.get(item.id);
        if (!prev) {
          seenBookings.current.set(item.id, item.createdAt?.seconds || Date.now());
          
          // Only trigger sounds for bookings incoming AFTER the screen is initialized
          if (!isFirstLoad.current) {
            triggerNotification(item);
          }
        }
      });

      // Mark the initial data loading cycle as completed
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }

      // Cleanup removed bookings
      const currentIds = new Set(enriched.map(i => i.id));
      for (let key of seenBookings.current.keys()) {
        if (!currentIds.has(key)) {
          seenBookings.current.delete(key);
        }
      }

      const filteredRequests = enriched.filter(request =>
        request.dates?.some(date => isFutureOrTodayDate(date))
      );

      setRequests(filteredRequests);
    });

    return () => unsub();
  }, [provider]);

  // Notification function
  const triggerNotification = async (item) => {
    await playSound();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚜 New Booking Request",
        body: `${item.userName} booked ${item.machineType}`,
        data: { bookingId: item.id },
        sound: true,
      },
      trigger: null,
    });
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    const d = new Date(date);

    const day = isBn ? toBanglaNumber(d.getDate()) : d.getDate();
    const year = isBn ? toBanglaNumber(d.getFullYear()) : d.getFullYear();

    const month = isBn
      ? MONTHS.bn[d.getMonth()]
      : MONTHS.en[d.getMonth()];

    return `${day} ${month} ${year}`;
  };

  const formatTime = (val) =>
    isBn ? toBanglaNumber(val) : val;

  const getSlotName = (slot) => {
    const start = parseInt(slot.split("-")[0]);

    if (start < 12) return t("morning");
    if (start < 15) return t("noon");
    if (start < 18) return t("afternoon");
    return t("night");
  };

  /* ================= ACTION ================= */
  const handleDecision = async (id, status) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      Alert.alert(t("success"), t("booking_request_updated"));
    } catch (error) {
      Alert.alert(t("error"), t("something_went_wrong"));
    }
  };

  /* ================= MACHINE IMAGE ================= */
  const getMachineImage = (item) => {
    if (item.machineImage && item.machineImage.trim() !== "") {
      return { uri: item.machineImage };
    }
    return getMachineDefaultImage(item.machineTypeFromDB || item.machineType);
  };

  /* ================= CARD ================= */
  const renderCard = (item) => {
    const futureDates =
      item.dates?.filter(date => isFutureOrTodayDate(date)) || [];

    if (futureDates.length === 0) return null;

    return (
      <LinearGradient
        key={item.id}
        colors={["#FDE2FF", "#D6EEFF"]}
        style={styles.card}
      >
        <View style={styles.imageWrap}>
          <Image
            source={getMachineImage(item)}
            style={styles.machineImage}
            resizeMode="contain"
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

        <Text style={styles.title}>{t(item.machineType)}{": "}{t("machine_model")}: {item.machineModel || "N/A"}</Text>
       

        {/* USER INFO */}
        <Text style={styles.text}>👤 {t("farmer_name")}: {item.userName}</Text>
        <Text style={styles.text}>📞 {t("phone")}: {item.userPhone}</Text>

        {/* NEW FIELDS */}
        <Text style={styles.text}>📍 {t("land_address")}: {item.landAddress}</Text>
       <Text style={styles.text}>
  📍{t("tillage_number")}: {toBanglaNumber(item.tillageAmount)}
</Text>
        <Text style={styles.text}>
  📍{t("land_size")}: {toBanglaNumber(item.landSize)}
</Text>
        <Text style={styles.text}>⚙️ {t("unit_of_charge_type")}: {t(item.chargeType)}</Text>
       <Text style={styles.text}>
  💰 {t("total_charge")}: {toBanglaNumber(item.totalCharge)}
</Text>
        

        {/* DATE */}
        <Text style={styles.text}>
          📅 {t("dates")}: {futureDates.map(formatDate).join(", ")}
        </Text>

        {/* SLOT */}
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
                    {getSlotName(slot)} {toBanglaNumber(start)}:০০ - {toBanglaNumber(end)}:০০
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
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>
          {t("no_booking_requests")}
        </Text>
      ) : (
        requests.map(renderCard)
      )}
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
    position: "relative",
  },

  machineImage: {
    width: 220,
    height: 170,
    borderRadius: 15,
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
});