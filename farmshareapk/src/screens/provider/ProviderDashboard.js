import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  ImageBackground,
} from "react-native";

import { useTranslation } from "react-i18next";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const buttonSize = (screenWidth / 2) - 30;

export default function ProviderDashboard({ navigation }) {
  const { t, i18n } = useTranslation();

  const provider = getAuth().currentUser;

  const [newNotificationCount, setNewNotificationCount] = useState(0);

  /* ================= REALTIME NOTIFICATION COUNT ================= */
  useEffect(() => {
    if (!provider) return;

   const q = query(
  collection(db, "bookings"),
  where("providerId", "==", provider.uid),
  where("isRead", "==", false)
);
    const unsub = onSnapshot(q, (snap) => {
      setNewNotificationCount(snap.size); // 🔥 green count
    });

   
    return () => unsub();
  }, [provider]);

  return (
    <ImageBackground
      source={require("../../../assets/images/background6.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 150 },
        ]}
      >
        {/* CURRENT STATUS CARD */}
        <TouchableOpacity
          style={styles.statusCard}
          onPress={() => navigation.navigate("ProviderCurrentStatus")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/Current Status.png")}
            style={styles.statusImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.statusTitle}>{t("current_status")}</Text>
            <Text style={styles.statusSubtitle}>
              {t("check_machine_availability")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ROW 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AddMachinery")}
          >
            <Image
              source={require("../../../assets/images/add.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("add_machinery")}</Text>
          </TouchableOpacity>

          {/* NOTIFICATION BUTTON WITH BADGE */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderNotification")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/notify.png")}
              style={styles.icon}
              resizeMode="contain"
            />

            {/* 🔔 BADGE */}
            {newNotificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {i18n.language === "bn"
                    ? newNotificationCount
                        .toString()
                        .replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d])
                    : newNotificationCount}
                </Text>
              </View>
            )}

            <Text style={styles.label}>{t("notification")}</Text>
          </TouchableOpacity>
        </View>

        {/* ROW 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderBookingScreen")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/bookings.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("my_bookings")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderMyContact")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/contact.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("my_contact")}</Text>
          </TouchableOpacity>
        </View>

        {/* ROW 3 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderBookingRequests")}
          >
            <Image
              source={require("../../../assets/Dashboard/inventory.jpg")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("booking_requests")}</Text>
          </TouchableOpacity>

        
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    padding: 15,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ADD8E6",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    width: "100%",
  },

  statusImage: {
    width: 60,
    height: 60,
    marginRight: 20,
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  statusSubtitle: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },

  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    position: "relative",
  },

  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },

  label: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },

  /* 🔔 BADGE */
  badge: {
    position: "absolute",
    top: 8,
    right: 10,
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});